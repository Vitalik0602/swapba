// src/pages/Messages.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ref, onValue, push, update } from 'firebase/database';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth, realtimeDb } from '../firebase/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItem, TextField, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

function Messages() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialChatId = queryParams.get('chat');

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // === Загрузка списка чатов ===
  const { data: chats = [], isLoading, error } = useQuery({
    queryKey: ['chats', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const chatsSnapshot = await getDocs(chatsQuery);

      const chatsData = await Promise.all(
        chatsSnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const adId = chatData.adId;
          const adRef = doc(db, 'ads', adId);
          const adSnap = await getDoc(adRef);
          return {
            id: chatDoc.id,
            adTitle: adSnap.exists() ? adSnap.data().title : 'Объявление удалено',
            participants: chatData.participants || [],
          };
        })
      );
      return chatsData;
    },
    enabled: !!user,
  });

  // === Загрузка сообщений конкретного чата ===
  useEffect(() => {
    if (!selectedChat && !initialChatId) return;

    const chatId = selectedChat?.id || initialChatId;
    const chatRef = ref(realtimeDb, `chats/${chatId}`);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
        setMessages(messagesArray);

        // Отметка сообщений как прочитанных
        messagesArray.forEach((msg) => {
          if (!msg.read && msg.recipientId === user?.uid) {
            update(ref(realtimeDb, `chats/${chatId}/${msg.id}`), { read: true });
          }
        });
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedChat, initialChatId, user]);

  // === Автовыбор чата из параметра URL ===
  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === initialChatId);
      if (chat) setSelectedChat(chat);
    }
  }, [initialChatId, chats]);

  // === Отправка сообщения ===
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const recipientId = selectedChat.participants?.find((id) => id && id !== user.uid);

      if (!recipientId) {
        console.error('❌ recipientId не найден. selectedChat:', selectedChat);
        alert('Ошибка: не удалось определить получателя сообщения');
        return;
      }

      const chatRef = ref(realtimeDb, `chats/${selectedChat.id}`);
      await push(chatRef, {
        senderId: user.uid,
        recipientId,
        message: newMessage.trim(),
        timestamp: Date.now(),
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Ошибка отправки сообщения');
    }
  };

  // === Если не авторизован ===
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'var(--font-heading)', mb: 2 }}>
          Войдите в аккаунт, чтобы просматривать сообщения
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ background: 'var(--gradient)', color: 'var(--text)' }}
          >
            Войти
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // === Загрузка чатов ===
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  // === Ошибка загрузки чатов ===
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Ошибка загрузки чатов: {error.message}</Typography>
      </Box>
    );
  }

  // === Интерфейс ===
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="container"
    >
      <Typography
        variant="h4"
        sx={{ color: 'var(--text)', mb: 3, fontFamily: 'var(--font-heading)', fontWeight: 700 }}
      >
        Сообщения
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* --- Список чатов --- */}
        <Box sx={{ width: { xs: '100%', md: '30%' }, minWidth: '200px' }}>
          <Typography
            variant="h6"
            sx={{ color: 'var(--text)', mb: 2, fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            Чаты
          </Typography>

          <List className="chat-list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ backgroundColor: 'rgba(255, 109, 0, 0.1)' }}
                >
                  <ListItem
                    button
                    onClick={() => setSelectedChat(chat)}
                    sx={{
                      background: selectedChat?.id === chat.id ? 'rgba(255, 109, 0, 0.2)' : 'transparent',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <Typography sx={{ color: 'var(--text)' }}>{chat.adTitle}</Typography>
                  </ListItem>
                </motion.div>
              ))
            ) : (
              <Typography sx={{ color: 'var(--muted)' }}>Нет активных чатов</Typography>
            )}
          </List>
        </Box>

        {/* --- Окно сообщений --- */}
        <Box sx={{ flex: 1 }}>
          {selectedChat ? (
            <>
              <Typography
                variant="h6"
                sx={{ color: 'var(--text)', mb: 2, fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Чат: {selectedChat.adTitle}
              </Typography>

              <Box
                sx={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'var(--bg-2)',
                  borderRadius: 'var(--radius)',
                  p: 2,
                  mb: 2,
                }}
              >
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <Box
                      key={msg.id}
                      className={`message-bubble ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                    >
                      <Typography sx={{ fontSize: '0.9rem' }}>{msg.message}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--muted)', textAlign: 'center' }}>
                    Сообщений пока нет
                  </Typography>
                )}
              </Box>

              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                <TextField
                  fullWidth
                  placeholder="Напишите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  sx={{
                    mb: 2,
                    input: { color: 'var(--text)' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--muted)' },
                      '&:hover fieldset': { borderColor: 'var(--accent)' },
                    },
                  }}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ background: 'var(--gradient)', color: 'var(--text)', fontWeight: 600 }}
                  >
                    Отправить
                  </Button>
                </motion.div>
              </Box>
            </>
          ) : (
            <Typography sx={{ color: 'var(--muted)' }}>Выберите чат для общения</Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

export default Messages;
