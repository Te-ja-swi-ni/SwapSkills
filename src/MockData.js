export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    teaching: ['UI Design', 'Figma', 'User Research'],
    learning: ['Python', 'Data Science'],
    rating: 4.8,
    exchanges: 12
  },
  {
    id: 'u2',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    teaching: ['Spanish', 'Guitar', 'Cooking'],
    learning: ['Web Development', 'React'],
    rating: 4.9,
    exchanges: 8
  },
  {
    id: 'u3',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    teaching: ['Web Development', 'React', 'Node.js'],
    learning: ['Financial Planning', 'Public Speaking'],
    rating: 5.0,
    exchanges: 15
  },
  {
    id: 'u4',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    teaching: ['Photography', 'Video Editing', 'Adobe Premiere'],
    learning: ['Spanish', 'Marketing'],
    rating: 4.7,
    exchanges: 6
  }
];

export const MOCK_CHATS = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Sarah Chen',
    lastMessage: 'I can help you with Figma components!',
    time: '12:45 PM',
    unread: 2,
    messages: [
      { text: "Hi! I saw you're looking to learn Figma.", sender: 'them', time: '12:30 PM' },
      { text: "Yes! I want to improve my UI skills.", sender: 'me', time: '12:35 PM' },
      { text: "I can help you with Figma components!", sender: 'them', time: '12:45 PM' },
    ]
  },
  {
    id: 'c2',
    userId: 'u2',
    userName: 'James Wilson',
    lastMessage: 'Let\'s schedule a Spanish session.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { text: "Hola! Ready for some Spanish?", sender: 'them', time: 'Yesterday' },
    ]
  }
];
