// src/components/Chat.js
import React, { useEffect } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Box, TextField, Button, List, ListItem, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function Chat({ adId, sellerId }) {
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!adId || !sellerId) return;

    const q = query(collection(db, `chats/${adId}_${sellerId}`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [adId, sellerId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, `chats/${adId}_${sellerId}`), {
        text: newMessage,
        userId: auth.currentUser.uid,
        sellerId,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass"
      style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h6" sx={{ color: 'var(--text)', padding: '10px', borderBottom: '1px solid var(--stroke)' }}>
        Чат
      </Typography>
      <List sx={{ flexGrow: 1, overflowY: 'auto', padding: 0 }}>
        {messages.map((msg) => (
          <ListItem key={msg.id} sx={{ justifyContent: msg.userId === auth.currentUser.uid ? 'flex-end' : 'flex-start' }}>
            <Box sx={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 'var(--radius)', background: msg.userId === auth.currentUser.uid ? 'var(--accent)' : 'var(--glass-strong)', color: 'var(--text)' }}>
              <Typography variant="body2">{msg.text}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : 'Отправляется...'}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
      <form onSubmit={sendMessage} style={{ padding: '10px', borderTop: '1px solid var(--stroke)' }}>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': { background: 'var(--glass-strong)', borderRadius: 'var(--radius)' }
            }}
          />
          <Button type="submit" variant="contained" disabled={loading || !newMessage.trim()} sx={{ background: 'var(--accent)' }}>
            Отправить
          </Button>
        </Box>
      </form>
    </motion.div>
  );
}

export default Chat;