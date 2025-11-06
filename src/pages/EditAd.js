// src/pages/EditAd.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/firebase';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress } from '@mui/material';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { motion } from 'framer-motion';

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [addressData, setAddressData] = React.useState({ address: '', lat: null, lng: null });

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const adRef = doc(db, 'ads', id);
      const adSnap = await getDoc(adRef);
      if (!adSnap.exists()) {
        throw new Error('Объявление не найдено');
      }
      return { id: adSnap.id, ...adSnap.data() };
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = ad.imageUrl;
      if (data.image && data.image[0]) {
        const imageRef = ref(storage, `images/${auth.currentUser.uid}/${data.image[0].name}`);
        await uploadBytes(imageRef, data.image[0]);
        imageUrl = await getDownloadURL(imageRef);
      }
      await updateDoc(doc(db, 'ads', id), {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        imageUrl,
        location: addressData.lat && addressData.lng ? [addressData.lat, addressData.lng] : ad.location,
        address: addressData.address || ad.address,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ad', id]);
      queryClient.invalidateQueries(['userAds', auth.currentUser?.uid]);
      navigate(`/ad/${id}`);
    },
    onError: (error) => {
      console.error('Ошибка при обновлении объявления:', error);
      alert('Ошибка при обновлении объявления');
    },
  });

  React.useEffect(() => {
    if (ad) {
      reset({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        category: ad.category,
      });
      setAddressData({
        address: ad.address || '',
        lat: ad.location ? ad.location[0] : null,
        lng: ad.location ? ad.location[1] : null,
      });
    }
  }, [ad, reset]);

  const onSubmit = (data) => {
    if (!auth.currentUser) {
      alert('Войдите в аккаунт');
      navigate('/login');
      return;
    }
    if (ad.userId !== auth.currentUser.uid) {
      alert('Вы не можете редактировать это объявление');
      navigate(`/ad/${id}`);
      return;
    }
    updateAdMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Ошибка: {error.message}</Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2, background: 'var(--gradient)', color: 'var(--text)' }}
          >
            Вернуться на главную
          </Button>
        </motion.div>
      </Box>
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
        Редактировать объявление
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
            sx={{ color: 'var(--text)', background: 'var(--bg-2)' }}
          >
            <MenuItem value="auto">Автомобили</MenuItem>
            <MenuItem value="realty">Недвижимость</MenuItem>
            <MenuItem value="clothes">Одежда</MenuItem>
            <MenuItem value="electronics">Электроника</MenuItem>
            <MenuItem value="services">Услуги</MenuItem>
          </Select>
        </FormControl>
        <AddressAutocomplete value={addressData.address} onChange={setAddressData} />
        <TextField
          type="file"
          fullWidth
          sx={{ mb: 2 }}
          {...register('image')}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ background: 'var(--gradient)', color: 'var(--text)', fontWeight: 600 }}
          >
            Сохранить изменения
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default EditAd;