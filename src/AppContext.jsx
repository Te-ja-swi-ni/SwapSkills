import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();
// Allow the application to switch dynamically between the live cloud server and local developer computer
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const AppProvider = ({ children }) => {
  // Persistence Helper for current user across quick reloads
  const getInitialData = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [currentUser, setCurrentUser] = useState(getInitialData('current_user', null));
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState({});
  const [swaps, setSwaps] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    // Connect to Flask Backend via WebSockets
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
        console.log("Connected to Real-time Backend");
    });

    socketRef.current.on('message', (msg) => {
      setChats(prev => {
        const roomId = msg.room;
        return {
          ...prev,
          [roomId]: [...(prev[roomId] || []), msg]
        };
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Fetch Users on App Load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users`);
        const data = await res.json();
        
        const hasAI = data.some(u => u.id === 'ai-mentor');
        if (!hasAI) {
          data.unshift({
            id: 'ai-mentor',
            name: 'SkillSwap AI Mentor',
            avatar: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?w=150&h=150&fit=crop',
            teaching: ['Everything', 'Curriculum Design', 'Motivation'],
            learning: ['Your Goals'],
            rating: 5.0,
            exchanges: 999
          });
        }
        setUsers(data);
      } catch (err) {
        console.error("Could not fetch global users from server:", err);
      }
    };
    fetchUsers();
    // Re-fetch users every 15 seconds to ensure we see new registrations instantly
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);


  // Actions
  const login = async (userData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      setCurrentUser(data);
      if (!users.find(u => u.id === data.id)) {
        setUsers([...users, data]);
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    try {
      await fetch(`${BACKEND_URL}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (e) {
      console.error("Profile update failed:", e);
    }
  };

  const sendMessage = (targetUserId, text) => {
    if (!currentUser || !socketRef.current) return;
    const chatId = [currentUser.id, targetUserId].sort().join('-');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socketRef.current.emit('join', { room: chatId });
    
    // Fire to backend. The backend handles broadcasting and the AI.
    socketRef.current.emit('message', {
      room: chatId,
      message: text,
      senderName: currentUser.name,
      senderId: currentUser.id,
      time: timestamp
    });
  };

  const requestSwap = (targetUserId, skillOffered, skillRequested) => {
    // Optional implementation here
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, chats, swaps, 
      login, logout, updateProfile, sendMessage, requestSwap 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
