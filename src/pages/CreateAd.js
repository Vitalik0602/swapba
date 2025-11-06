// src/pages/CreateAd.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/firebase';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress } from '@mui/material';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { motion } from 'framer-motion';

function CreateAd() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      image: null,
    },
  });
  const [addressData, setAddressData] = React.useState({ address: '', lat: null, lng: null });
  const [imagePreview, setImagePreview] = React.useState(null);

  // Функция onSubmit для обработки отправки формы
  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!auth.currentUser) throw new Error('Войдите в аккаунт');
      let imageUrl = '';
      if (data.image && data.image[0]) {
        const imageRef = ref(storage, `images/${auth.currentUser.uid}/${data.image[0].name}`);
        await uploadBytes(imageRef, data.image[0]);
        imageUrl = await getDownloadURL(imageRef);
      }
      const adData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        imageUrl,
        userId: auth.currentUser.uid,
        location: addressData.lat && addressData.lng ? [addressData.lat, addressData.lng] : null,
        address: addressData.address || '',
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'ads'), adData);
      return docRef.id;
    },
    onSuccess: (adId) => {
      reset();
      setAddressData({ address: '', lat: null, lng: null });
      setImagePreview(null);
      navigate(`/ad/${adId}`);
    },
    onError: (error) => {
      console.error('Ошибка при создании объявления:', error);
      alert('Ошибка при создании объявления: ' + error.message);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!auth.currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'var(--font-heading)', mb: 2 }}>
          Войдите в аккаунт, чтобы создать объявление
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ background: 'var(--gradient)', color: 'var(--text)' }}
          >
            Войти
          </Button>
        </motion.div>
      </motion.div>
    );
  }

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
        Создать объявление
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="glass" sx={{ p: 3, borderRadius: 'var(--radius)' }}>
        <TextField
          label="Заголовок"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('title', { required: 'Обязательное поле' })}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <TextField
          label="Описание"
          multiline
          rows={4}
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('description', { required: 'Обязательное поле' })}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <TextField
          label="Цена (₽)"
          type="number"
          fullWidth
          sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
          {...register('price', { required: 'Обязательное поле', min: 0 })}
          error={!!errors.price}
          helperText={errors.price?.message}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: 'var(--muted)' }}>Категория</InputLabel>
          <Select
            {...register('category', { required: 'Обязательное поле' })}
            defaultValue=""
            sx={{ color: 'var(--text)', background: 'var(--bg-2)' }}
            error={!!errors.category}
          >
            <MenuItem value="" disabled>
              Выберите категорию
            </MenuItem>
            <MenuItem value="auto">Автомобили</MenuItem>
            <MenuItem value="realty">Недвижимость</MenuItem>
            <MenuItem value="clothes">Одежда</MenuItem>
            <MenuItem value="electronics">Электроника</MenuItem>
            <MenuItem value="services">Услуги</MenuItem>
          </Select>
          {errors.category && (
            <Typography sx={{ color: 'red', fontSize: '0.75rem', mt: 0.5 }}>{errors.category.message}</Typography>
          )}
        </FormControl>
        <AddressAutocomplete value={addressData.address} onChange={setAddressData} />
        <TextField
          type="file"
          fullWidth
          sx={{ mb: 2 }}
          {...register('image')}
          onChange={handleImageChange}
        />
        {imagePreview && (
          <Box sx={{ mb: 2 }}>
            <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
          </Box>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={mutation.isLoading}
            sx={{ background: 'var(--gradient)', color: 'var(--text)', fontWeight: 600 }}
          >
            {mutation.isLoading ? <CircularProgress size={24} sx={{ color: 'var(--text)' }} /> : 'Опубликовать'}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default CreateAd;