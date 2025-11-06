// src/components/AdForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/firebase';
import { TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import AddressAutocomplete from './AddressAutocomplete';

function AdForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    { id: 'auto', name: 'Авто' },
    { id: 'realty', name: 'Недвижимость' },
    { id: 'clothes', name: 'Одежда' },
    { id: 'electronics', name: 'Электроника' },
    { id: 'services', name: 'Услуги' },
    { id: 'job', name: 'Работа' },
    { id: 'home', name: 'Для дома' },
    { id: 'business', name: 'Для бизнеса' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('Войдите, чтобы создать объявление');
      return;
    }
    if (!location.address) {
      setError('Укажите адрес');
      return;
    }
    try {
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'ads'), {
        title,
        description,
        price: Number(price),
        category,
        imageUrl,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        location, // Now an object {address, lat, lng}
      });
      navigate('/');
    } catch (error) {
      setError('Ошибка при создании объявления: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="container glass"
      style={{ padding: '30px', maxWidth: '600px', margin: '30px auto' }}
    >
      <Typography variant="h4" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        Создать объявление
      </Typography>
      {error && <Typography color="error" sx={{ marginBottom: '15px', fontFamily: 'Inter' }}>{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Название"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          label="Описание"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            marginBottom: '20px',
            input: { color: 'var(--text)', fontFamily: 'Inter' },
            textarea: { color: 'var(--text)', fontFamily: 'Inter' },
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
          label="Цена (₽)"
          fullWidth
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
          select
          label="Категория"
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        <AddressAutocomplete value={location.address} onChange={setLocation} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: '20px', color: 'var(--text)', fontFamily: 'Inter' }}
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
          Создать
        </Button>
      </Box>
    </motion.div>
  );
}

export default AdForm;