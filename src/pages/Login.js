// src/pages/Login.js — ПОЛНЫЙ, С СВЯЗЬЮ С РЕГИСТРАЦИЕЙ
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/', { replace: true });
    } catch (err) {
      let message = 'Неверный email или пароль';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Неверный email или пароль';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Слишком много попыток. Попробуйте позже';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container"
    >
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          p: { xs: 3, sm: 4 },
          background: 'var(--bg-2)',
          border: '1px solid var(--stroke)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: 3,
            fontWeight: 700,
            background: 'var(--gradient)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Вход
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            autoComplete="email"
            {...register('email', {
              required: 'Введите email',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Некорректный email',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                background: 'var(--glass-strong)',
                borderRadius: 'var(--radius)',
              },
              input: { color: 'var(--text)' },
            }}
          />

          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            {...register('password', {
              required: 'Введите пароль',
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: 'var(--muted)' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                background: 'var(--glass-strong)',
                borderRadius: 'var(--radius)',
              },
              input: { color: 'var(--text)' },
            }}
          />

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                background: 'var(--gradient)',
                color: 'var(--text)',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 'var(--radius)',
                mt: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'var(--text)' }} />
              ) : (
                'Войти'
              )}
            </Button>
          </motion.div>

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 3,
              color: 'var(--muted)',
            }}
          >
            Нет аккаунта?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Зарегистрироваться
            </Link>
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

export default Login;