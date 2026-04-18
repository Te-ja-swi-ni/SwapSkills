import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  User as UserIcon, 
  Home as HomeIcon, 
  Zap,
  Star,
  ArrowRight,
  LogOut,
  Send,
  Edit3,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './AppContext';

// --- Sub-Components ---

const SkillCard = ({ user, delay, onSwap }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ y: -8 }}
    className="glass-card" 
    style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
      <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }} />
      <div>
        <h3 style={{ fontSize: '1.2rem' }}>{user.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.9rem' }}>
          <Star size={14} fill="#fbbf24" />
          <span>{user.rating} ({user.exchanges} swaps)</span>
        </div>
      </div>
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Teaching</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {user.teaching.length > 0 ? user.teaching.map(skill => (
            <span key={skill} style={{ padding: '4px 10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>{skill}</span>
          )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None listed</span>}
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Learning</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {user.learning.length > 0 ? user.learning.map(skill => (
            <span key={skill} style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>{skill}</span>
          )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None listed</span>}
        </div>
      </div>
    </div>

    <Link to={`/chat/${user.id}`} className="btn-primary" style={{ marginTop: '20px', textAlign: 'center', width: '100%', fontSize: '0.9rem' }}>Swap Skills</Link>
  </motion.div>
);

// --- Pages ---

const Home = () => {
  const { users } = useApp();
  return (
    <div className="animate-fade-in">
      <section style={{ padding: '80px 0 60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1 }}>
          The Currency of the <br/><span className="gradient-text">Future is Talent</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
          SkillSwap connects you with neighbors and experts worldwide to trade knowledge for knowledge. No money required.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/explore" className="btn-primary">Explore Skills</Link>
          <Link to="/chat/ai-mentor" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--accent-purple)' }}>
            <Zap size={18} color="var(--accent-purple)" /> Talk to AI Mentor
          </Link>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Featured <span className="gradient-text">Experts</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>People ready to teach you today</p>
          </div>
          <Link to="/explore" style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            View all <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {users.slice(0, 4).map((user, idx) => (
            <SkillCard key={user.id} user={user} delay={idx * 0.1} />
          ))}
        </div>
      </section>
    </div>
  );
};

const Explore = () => {
  const { users, currentUser } = useApp();
  const [search, setSearch] = useState('');
  
  const filtered = users.filter(u => 
    (u.teaching.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    u.name.toLowerCase().includes(search.toLowerCase())) &&
    u.id !== currentUser?.id
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Find Your <span className="gradient-text">New Mentor</span></h1>
        <div style={{ position: 'relative', maxWidth: '800px' }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={22} />
          <input 
            type="text" 
            placeholder="Search for skills (e.g. Photoshop, Woodworking, Japanese)..." 
            style={{ 
              width: '100%', 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '16px', 
              padding: '20px 20px 20px 60px', 
              color: 'white',
              fontSize: '1.1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
        {filtered.map((user, idx) => (
          <SkillCard key={user.id} user={user} delay={idx * 0.05} />
        ))}
      </div>
    </div>
  );
};

const Chat = () => {
  const { id } = useParams();
  const { currentUser, users, chats, sendMessage } = useApp();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const targetUser = users.find(u => u.id === id) || users.find(u => u.id !== currentUser?.id);
  const chatId = currentUser && targetUser ? [currentUser.id, targetUser.id].sort().join('-') : null;
  const messages = chatId ? (chats[chatId] || []) : [];

  useEffect(() => {
    if (!currentUser) navigate('/auth');
  }, [currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !targetUser) return;
    sendMessage(targetUser.id, input);
    setInput('');
  };

  if (!currentUser || !targetUser) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
      {/* Sidebar - Other Chats */}
      <div className="glass-card" style={{ overflowY: 'auto', padding: '16px' }}>
        <h3 style={{ marginBottom: '20px', paddingLeft: '8px' }}>Active Swaps</h3>
        {users.filter(u => u.id !== currentUser.id).map(u => (
          <div 
            key={u.id}
            onClick={() => navigate(`/chat/${u.id}`)}
            style={{ 
              display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', 
              background: u.id === targetUser.id ? 'var(--glass-border)' : 'transparent',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
          >
            <img src={u.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {u.id === 'ai-mentor' ? 'AI Assistant' : 'Click to chat'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={targetUser.avatar} style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
          <div>
            <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {targetUser.name}
              {targetUser.id === 'ai-mentor' && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-gradient)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>AI Power</span>}
            </h4>
            <span style={{ fontSize: '0.8rem', color: '#10b981' }}>● {targetUser.id === 'ai-mentor' ? 'Always Online' : 'Currently Online'}</span>
          </div>
        </div>
        
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
               <Zap size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
               <p>Start a conversation about swapping skills!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.senderId === currentUser.id ? 'flex-end' : 'flex-start',
              maxWidth: '70%'
            }}>
              <div style={{ 
                padding: '12px 18px', 
                borderRadius: '16px',
                background: m.senderId === currentUser.id ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                fontSize: '0.95rem'
              }}>
                {m.text}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: m.senderId === currentUser.id ? 'right' : 'left' }}>{m.time}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Suggest a skill swap..." 
            style={{ 
              flex: 1, 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px', 
              padding: '14px 20px', 
              color: 'white',
              outline: 'none'
            }} 
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { currentUser, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [teaching, setTeaching] = useState('');
  const [learning, setLearning] = useState('');

  useEffect(() => {
    if (!currentUser) navigate('/auth');
  }, [currentUser]);

  if (!currentUser) return null;

  const handleAddTeaching = (e) => {
    e.preventDefault();
    if (!teaching) return;
    updateProfile({ teaching: [...(currentUser.teaching || []), teaching] });
    setTeaching('');
  };

  const handleAddLearning = (e) => {
    e.preventDefault();
    if (!learning) return;
    updateProfile({ learning: [...(currentUser.learning || []), learning] });
    setLearning('');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>My <span className="gradient-text">Studio</span></h1>
        <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="glass-card" style={{ padding: '40px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--accent-purple)' }} />
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>{currentUser.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Elite Swapper • {currentUser.exchanges} lifetime swaps</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} color="var(--accent-purple)" /> Skills I Teach</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              {currentUser.teaching?.map(s => (
                <span key={s} className="glass-card" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', background: 'rgba(139, 92, 246, 0.2)' }}>{s}</span>
              ))}
            </div>
            <form onSubmit={handleAddTeaching} style={{ display: 'flex', gap: '8px' }}>
              <input value={teaching} onChange={e => setTeaching(e.target.value)} placeholder="Add skill..." style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
              <button type="submit" className="btn-primary" style={{ padding: '10px' }}><Plus size={20} /></button>
            </form>
          </div>

          <div>
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={18} color="var(--accent-blue)" /> Skills I Want to Learn</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              {currentUser.learning?.map(s => (
                <span key={s} className="glass-card" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', background: 'rgba(59, 130, 246, 0.2)' }}>{s}</span>
              ))}
            </div>
            <form onSubmit={handleAddLearning} style={{ display: 'flex', gap: '8px' }}>
              <input value={learning} onChange={e => setLearning(e.target.value)} placeholder="Add skill..." style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
              <button type="submit" className="btn-primary" style={{ padding: '10px' }}><Plus size={20} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    login({ name, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' });
    navigate('/');
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div className="glass-card" style={{ padding: '48px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <Zap size={48} color="var(--accent-purple)" fill="var(--accent-purple)" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Join the global skill exchange</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--glass-border)', 
              padding: '16px', 
              borderRadius: '12px', 
              color: 'white',
              fontSize: '1rem',
              marginBottom: '20px',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>Get Started</button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const { currentUser } = useApp();

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="glass-card" style={{ 
          position: 'sticky', top: '20px', margin: '0 24px', zIndex: 100, padding: '12px 32px',
          borderRadius: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
              <Zap color="white" fill="white" size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Skill<span className="gradient-text">Swap</span></span>
          </Link>

          <nav style={{ display: 'flex', gap: '32px' }}>
            <NavLink to="/" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)', fontWeight: 600 })}>Home</NavLink>
            <NavLink to="/explore" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)', fontWeight: 600 })}>Explore</NavLink>
            <NavLink to="/messages" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)', fontWeight: 600 })}>Messages</NavLink>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser ? (
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentUser.name}</span>
                <img src={currentUser.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-purple)' }} />
              </Link>
            ) : (
              <Link to="/auth" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Join</Link>
            )}
          </div>
        </header>

        <main className="container" style={{ flex: 1, padding: '40px 24px 100px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/messages" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>

        <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Zap color="var(--accent-purple)" size={24} fill="var(--accent-purple)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SkillSwap</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>The world's leading community-driven skill exchange platform. Connect, learn, and grow together without money.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Explore</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>Featured Mentors</li>
                <li>Success Stories</li>
                <li>Safety Guidelines</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Social</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '12px', display: 'grid', placeItems: 'center' }}><Star size={20} /></div>
                <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '12px', display: 'grid', placeItems: 'center' }}><Plus size={20} /></div>
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&copy; 2026 SkillSwap. No cost. All community.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
