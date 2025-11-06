// src/pages/Register.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

function Register() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.displayName });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: data.displayName,
        email: data.email,
        phone: data.phone || '',
        rating: 0,
        ratingCount: 0,
        favorites: [],
      });
      navigate('/');
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        setError('email', { message: 'Этот email уже используется' });
      } else {
        setError('form', { message: error.message });
      }
    }
  };

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
        Регистрация
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="glass" sx={{ p: 3, borderRadius: 'var(--radius)', maxWidth: '500px', mx: 'auto' }}>
        <TextField
          label="Имя"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('displayName', { required: 'Обязательное поле' })}
          error={!!errors.displayName}
          helperText={errors.displayName?.message}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('email', { required: 'Обязательное поле', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Неверный email' } })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('password', { required: 'Обязательное поле', minLength: { value: 6, message: 'Минимум 6 символов' } })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          label="Номер телефона (необязательно)"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('phone')}
        />
        {errors.form && (
          <Typography color="error" sx={{ mb: 2 }}>{errors.form.message}</Typography>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ background: 'var(--gradient)', color: 'var(--text)', fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'var(--text)' }} /> : 'Зарегистрироваться'}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default Register;