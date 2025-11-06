// src/pages/Register.js — ПОЛНЫЙ РАБОЧИЙ КОД С ПЕРВОЙ ДО ПОСЛЕДНЕЙ СТРОКИ
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
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

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        createdAt: new Date().toISOString(),
        favorites: [],
      });

      navigate('/', { replace: true });
    } catch (err) {
      let message = 'Ошибка регистрации. Попробуйте снова.';

      if (err.code === 'auth/email-already-in-use') {
        message = 'Этот email уже используется';
      } else if (err.code === 'auth/weak-password') {
        message = 'Пароль должен быть не менее 6 символов';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Некорректный email';
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
          Регистрация
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Имя"
            fullWidth
            autoComplete="name"
            {...register('name', {
              required: 'Введите имя',
              minLength: { value: 2, message: 'Минимум 2 символа' },
              maxLength: { value: 50, message: 'Максимум 50 символов' },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
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
            autoComplete="new-password"
            {...register('password', {
              required: 'Введите пароль',
              minLength: { value: 6, message: 'Минимум 6 символов' },
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

          <TextField
            label="Подтвердите пароль"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (value) =>
                value === password || 'Пароли не совпадают',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowConfirmPassword}
                    edge="end"
                    sx={{ color: 'var(--muted)' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

          <TextField
            label="Телефон (необязательно)"
            fullWidth
            placeholder="+7 (999) 123-45-67"
            autoComplete="tel"
            {...register('phone', {
              pattern: {
                value: /^[+]?[0-9\s\-()]{10,18}$/,
                message: 'Некорректный номер',
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={{
              mb: 3,
              '& .MuiInputLabel-root': { color: 'var(--muted)' },
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
                'Зарегистрироваться'
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
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Войти
            </Link>
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

export default Register;