// src/pages/NotFound.js — НОВЫЙ ФАЙЛ (404)
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      sx={{ textAlign: 'center', py: 12 }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '6rem',
          fontWeight: 800,
          background: 'var(--gradient)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ color: 'var(--text)', mb: 3 }}>
        Страница не найдена
      </Typography>

      <Typography sx={{ color: 'var(--muted)', mb: 4, maxWidth: 500, mx: 'auto' }}>
        Возможно, вы ввели неправильный адрес или страница была удалена.
      </Typography>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{
            background: 'var(--gradient)',
            px: 4,
            py: 1.5,
            fontWeight: 600,
          }}
          className="pulse"
        >
          На главную
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default NotFound;