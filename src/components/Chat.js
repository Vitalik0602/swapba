// src/components/Chat.js — ПОЛНЫЙ, НЕ СОКРАЩЁННЫЙ, ИСПРАВЛЕННЫЙ КОД
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

function Chat({ adId }) {
  const user = auth.currentUser;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // === ПОЛУЧЕНИЕ ИЛИ СОЗДАНИЕ ЧАТА ===
  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', adId, user?.uid],
    queryFn: async () => {
      if (!user || !adId) return null;

      // Поиск существующего чата
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('adId', '==', adId),
        where('participants', 'array-contains', user.uid)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const chatDoc = snapshot.docs[0];
        return { id: chatDoc.id, ...chatDoc.data() };
      }

      // Получаем владельца объявления
      const adDoc = await getDoc(doc(db, 'ads', adId));
      if (!adDoc.exists()) {
        throw new Error('Объявление не найдено');
      }

      const adOwnerId = adDoc.data().userId;
      if (!adOwnerId) {
        throw new Error('Владелец объявления не найден');
      }

      // Создаём новый чат
      const newChatRef = await addDoc(collection(db, 'chats'), {
        adId,
        participants: [user.uid, adOwnerId],
        lastMessageAt: serverTimestamp(),
        lastMessage: '',
      });

      return { id: newChatRef.id, participants: [user.uid, adOwnerId] };
    },
    enabled: !!user && !!adId,
  });

  // === РЕАЛТАЙМ СООБЩЕНИЯ ===
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chat?.id) return;

    const messagesRef = collection(db, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chat?.id]);

  // === ОТПРАВКА СООБЩЕНИЯ ===
  const sendMessage = useMutation({
    mutationFn: async (text) => {
      if (!text.trim() || !chat?.id) return;

      const messagesRef = collection(db, 'chats', chat.id, 'messages');
      await addDoc(messagesRef, {
        text: text.trim(),
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['chats']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate(message);
  };

  // === АВТОСКРОЛЛ ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // === ЗАГРУЗКА ===
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  // === НЕ АВТОРИЗОВАН ===
  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'var(--muted)' }}>
        <Typography variant="body1">Войдите, чтобы писать сообщения</Typography>
      </Box>
    );
  }

  // === ОСНОВНОЙ UI ===
  return (
    <Box
      sx={{
        mt: 4,
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--bg-2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid var(--stroke)',
          background: 'var(--bg-1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--accent)' }}>
          {chat?.participants?.find(p => p !== user.uid)?.[0]?.toUpperCase() || '?'}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Чат с продавцом
        </Typography>
      </Box>

      {/* Сообщения */}
      <Box
        sx={{
          height: 400,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          background: 'var(--bg-2)',
        }}
      >
        {messages.length === 0 ? (
          <Typography
            sx={{
              color: 'var(--muted)',
              textAlign: 'center',
              mt: 8,
              fontSize: '0.95rem',
            }}
          >
            Напишите первое сообщение
          </Typography>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`message-bubble ${msg.senderId === user.uid ? 'sent' : 'received'}`}
            >
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {msg.text}
              </Typography>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Поле ввода */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: '1px solid var(--stroke)',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          background: 'var(--bg-1)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sendMessage.isPending}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)',
              fontSize: '0.95rem',
            },
            input: { color: 'var(--text)' },
          }}
        />
        <IconButton
          type="submit"
          disabled={!message.trim() || sendMessage.isPending}
          sx={{
            color: message.trim() ? 'var(--accent)' : 'var(--muted)',
            transition: 'color 0.2s',
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;