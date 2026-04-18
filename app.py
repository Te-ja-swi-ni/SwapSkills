from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_socketio import SocketIO, emit, join_room, leave_room
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'skill-swap-default-secret')
socketio = SocketIO(app, cors_allowed_origins="*")

# OpenAI Setup
client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# --- Database Setup ---
try:
    # Try connecting to local mongo
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    client.server_info() # trigger exception if cannot connect
    db = client['skill_swap_db']
except:
    # Fallback to local dictionary mock for demo stability if mongo is missing
    print("WARNING: MongoDB not found. Using in-memory mock for demonstration.")
    class MockDB:
        def __init__(self):
            self.users = []
            self.requests = []
            self.messages = []
        
        @property
        def users_col(self): return self
        @property
        def requests_col(self): return self
        @property
        def messages_col(self): return self

        def find_one(self, query):
            for u in self.users:
                if all(u.get(k) == v for k, v in query.items()): return u
            return None
        
        def find(self, query={}):
            return [u for u in self.users if all(u.get(k) == v for k, v in query.items())]

        def insert_one(self, data):
            if not data.get('_id'): data['_id'] = ObjectId()
            self.users.append(data)
            return data

        def update_one(self, query, update):
            u = self.find_one(query)
            if u: u.update(update.get('$set', {}))

    mock_db = MockDB()
    db = type('DB', (), {'users': mock_db, 'requests': mock_db, 'messages': mock_db})

# --- Auth Setup ---
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.email = user_data['email']
        self.name = user_data['name']
        self.skills_have = user_data.get('skills_have', [])
        self.skills_want = user_data.get('skills_want', [])

@login_manager.user_loader
def load_user(user_id):
    user_data = db.users.find_one({'_id': ObjectId(user_id)})
    return User(user_data) if user_data else None

# --- REST APIs for React Frontend ---
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    name = data.get('name')
    if not name: return jsonify({"error": "Name required"}), 400
    
    user_data = db.users.find_one({'name': name})
    if not user_data:
        # Auto-register for simple React demo auth
        user_data = {
            'name': name,
            'avatar': data.get('avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'),
            'teaching': [],
            'learning': [],
            'rating': 5.0,
            'exchanges': 0
        }
        res = db.users.insert_one(user_data)
        user_data['_id'] = res.inserted_id if hasattr(res, 'inserted_id') else user_data['_id']

    user_data['id'] = str(user_data['_id'])
    return jsonify(user_data)

@app.route('/api/users')
def api_users():
    users = list(db.users.find())
    for u in users:
        u['id'] = str(u['_id'])
        u.pop('password', None)
        u.pop('_id', None)
        if 'rating' not in u: u['rating'] = 5.0
        if 'exchanges' not in u: u['exchanges'] = 0
        if 'teaching' not in u: u['teaching'] = []
        if 'learning' not in u: u['learning'] = []
    return jsonify(users)

@app.route('/api/messages/<room>')
def api_messages(room):
    msgs = list(db.messages.find({'room': room}))
    for m in msgs:
        m['id'] = str(m['_id'])
        m.pop('_id', None)
    return jsonify(msgs)

@app.route('/api/update-profile', methods=['POST'])
def api_update_profile():
    data = request.json
    user_id = data.get('id')
    db.users.update_one({'_id': ObjectId(user_id) if len(user_id) == 24 else user_id}, {'$set': data})
    return jsonify({"success": True})

# --- Routes (Legacy HTML Forms) ---
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if db.users.find_one({'email': email}):
            flash('Email already exists')
            return redirect(url_for('register'))
            
        db.users.insert_one({
            'name': name,
            'email': email,
            'password': generate_password_hash(password),
            'skills_have': [],
            'skills_want': []
        })
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_data = db.users.find_one({'email': email})
        
        if user_data and check_password_hash(user_data['password'], password):
            user = User(user_data)
            login_user(user)
            # If profile is incomplete, go to create profile
            if not user.skills_have and not user.skills_want:
                return redirect(url_for('create_profile'))
            return redirect(url_for('dashboard'))
        flash('Invalid email or password')
    return render_template('login.html')

@app.route('/create-profile', methods=['GET', 'POST'])
@login_required
def create_profile():
    if request.method == 'POST':
        haves = request.form.get('skills_have').split(',')
        wants = request.form.get('skills_want').split(',')
        db.users.update_one(
            {'_id': ObjectId(current_user.id)},
            {'$set': {
                'skills_have': [s.strip() for s in haves if s.strip()],
                'skills_want': [s.strip() for s in wants if s.strip()]
            }}
        )
        return redirect(url_for('dashboard'))
    return render_template('create_profile.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    query = request.args.get('q', '').lower()
    all_users = db.users.find()
    matches = []
    search_results = []
    
    my_wants = [s.strip().lower() for s in current_user.skills_want]
    my_haves = [s.strip().lower() for s in current_user.skills_have]
    
    my_wants_set = set(my_wants)
    my_haves_set = set(my_haves)

    for u in all_users:
        uid = str(u['_id'])
        if uid == current_user.id: continue
        
        u_haves = [s.strip().lower() for s in u.get('skills_have', [])]
        u_wants = [s.strip().lower() for s in u.get('skills_want', [])]

        # 1. Matching Logic
        if (my_haves_set & set(u_wants)) and (my_wants_set & set(u_haves)):
            matches.append(u)
        
        # 2. Search Logic
        if query:
            if any(query in s for s in u_haves):
                search_results.append(u)
            
    return render_template('dashboard.html', matches=matches, search_results=search_results, query=query)

@app.route('/update_skills', methods=['POST'])
@login_required
def update_skills():
    haves = request.form.get('skills_have').split(',')
    wants = request.form.get('skills_want').split(',')
    
    db.users.update_one(
        {'_id': ObjectId(current_user.id)},
        {'$set': {
            'skills_have': [s.strip() for s in haves if s.strip()],
            'skills_want': [s.strip() for s in wants if s.strip()]
        }}
    )
    flash('Skills updated!')
    return redirect(url_for('dashboard'))

# --- SocketIO Chat (Phase 6) ---
@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)

@socketio.on('message')
def handle_message(data):
    room = data.get('room')
    msg_text = data.get('message')
    sender_name = data.get('senderName', getattr(current_user, 'name', 'Guest'))
    sender_id = data.get('senderId', getattr(current_user, 'id', '000'))
    
    # Send user message to room
    msg = {
        'room': room,
        'senderId': sender_id,
        'sender': sender_name,
        'text': msg_text,
        'time': data.get('time', '')
    }
    emit('message', msg, room=room)
    
    # Store user message
    db.messages.insert_one({
        'room': room,
        'sender_id': sender_id,
        'text': msg_text
    })
    
    # Phase 11: Check if this is an AI room
    if 'ai_mentor' in room:
        try:
            # Call ChatGPT
            response = client_ai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": """You are the SkillSwap Premium AI Mentor. 
                    Your mission is to provide expert-level learning guidance to members of the SkillSwap community.
                    
                    Guidelines:
                    1. Be extremely encouraging and professional.
                    2. Provide structured, actionable learning paths for any skill requested.
                    3. Suggest specific resources (books, websites, courses).
                    4. Use formatting (bullet points, bold text) to make your advice easy to read.
                    5. If you're suggesting a learning path, break it down into 'Beginner', 'Intermediate', and 'Advanced' stages.
                    6. Remind the user that they can find partners in the dashboard to practice these skills with.
                    
                    Style: Empathetic, expert, and highly organized."""},
                    {"role": "user", "content": msg_text}
                ]
            )
            ai_reply = response.choices[0].message.content
        except Exception as e:
            # Fallback if there's a temporary issue with the API
            ai_reply = "I'm having a slight technical hiccup connecting to my brain, but I'm still here! Let's talk about your learning goals. What is the main skill you want to master today?"

        ai_msg = {
            'room': room,
            'senderId': 'ai-mentor',
            'sender': 'SkillSwap AI',
            'text': ai_reply,
            'time': msg['time']
        }
        emit('message', ai_msg, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
