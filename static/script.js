var socket = io();
var currentRoom = '';

function openChat(userId, userName) {
    document.getElementById('chat-modal').style.display = 'block';
    document.getElementById('chat-with-name').innerText = 'Chat with ' + userName;
    
    // Simple room generation (stable sorted pair)
    currentRoom = [userId, window.CURRENT_USER_ID || 'me'].sort().join('_');
    
    socket.emit('join', { room: currentRoom });
    document.getElementById('chat-messages').innerHTML = ''; 
}

function closeChat() {
    document.getElementById('chat-modal').style.display = 'none';
}

function sendMessage() {
    var input = document.getElementById('chat-input');
    var message = input.value.trim();
    if (message && currentRoom) {
        // Show typing indicator if it's an AI room
        if (currentRoom.includes('ai_mentor')) {
            showTypingIndicator();
        }

        socket.emit('message', {
            room: currentRoom,
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        input.value = '';
    }
}

function showTypingIndicator() {
    var container = document.getElementById('chat-messages');
    var div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'message received typing';
    div.innerHTML = `<strong>SkillSwap AI</strong> is typing<span class="dots">...</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    var indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

socket.on('message', function(msg) {
    // Remove typing indicator when message arrives
    if (msg.sender === 'SkillSwap AI') {
        removeTypingIndicator();
    }

    var container = document.getElementById('chat-messages');
    var div = document.createElement('div');
    
    // Check if message is from AI or current user
    var isAI = msg.sender === 'SkillSwap AI';
    var isMe = msg.sender === window.CURRENT_USER_NAME;
    
    div.className = 'message ' + (isMe ? 'sent' : 'received') + (isAI ? ' ai' : '');
    div.innerHTML = `<strong>${msg.sender}</strong><br>${msg.text}<br><small style="font-size: 0.7rem; opacity: 0.6">${msg.time}</small>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
});

// Handle enter key in chat
document.getElementById('chat-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
