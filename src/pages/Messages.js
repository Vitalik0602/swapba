// src/pages/Messages.js
import React from 'react';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';

function Messages() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
      style={{ padding: '30px' }}
    >
      <Typography variant="h4" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        Сообщения
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
        Функция сообщений будет добавлена в будущем обновлении.
      </Typography>
    </motion.div>
  );
}

export default Messages;