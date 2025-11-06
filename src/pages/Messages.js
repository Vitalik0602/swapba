// src/pages/Messages.js — ПОЛНЫЙ, ИСПРАВЛЕННЫЙ (убраны Badge, unreadCounts)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Messages() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: 'var(--muted)' }}>
          Войдите, чтобы видеть сообщения
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
        }}
      >
        Сообщения
      </Typography>

      <List sx={{ bgcolor: 'var(--bg-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <Box key={chat.id}>
              <ListItem
                button
                onClick={() => navigate(`/ad/${chat.adId}`)}
                sx={{
                  '&:hover': { background: 'rgba(255, 109, 0, 0.08)' },
                  transition: 'background 0.2s',
                }}
              >
                <ListItemText
                  primary={chat.lastMessage || 'Новое сообщение'}
                  secondary={
                    chat.lastMessageAt
                      ? new Date(chat.lastMessageAt.toDate()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: 'var(--muted)' }}
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: 'var(--muted)', fontSize: '1rem' }}>
              Нет сообщений
            </Typography>
          </Box>
        )}
      </List>
    </motion.div>
  );
}

export default Messages;