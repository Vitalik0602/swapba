// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { TextField, Button, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Ошибка входа: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="container glass"
      style={{ padding: '30px', maxWidth: '400px', margin: '30px auto' }}
    >
      <Typography variant="h4" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        Вход
      </Typography>
      {error && <Typography color="error" sx={{ marginBottom: '15px', fontFamily: 'Inter' }}>{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            marginBottom: '20px',
            input: { color: 'var(--text)', fontFamily: 'Inter' },
            label: { color: 'var(--muted)' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--stroke)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)'
            }
          }}
        />
        <TextField
          label="Пароль"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            marginBottom: '20px',
            input: { color: 'var(--text)', fontFamily: 'Inter' },
            label: { color: 'var(--muted)' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--stroke)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)'
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            background: 'var(--gradient)',
            color: 'var(--text)',
            borderRadius: 'var(--radius)',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            padding: '10px 20px',
            '&:hover': { background: 'var(--accent-2)' }
          }}
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pulse"
        >
          Войти
        </Button>
      </Box>
    </motion.div>
  );
}

export default Login;