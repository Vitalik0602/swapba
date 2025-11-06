// src/pages/EditAd.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/firebase';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { motion } from 'framer-motion';

const categories = [
  { id: 'auto', name: 'Автомобили' },
  { id: 'realty', name: 'Недвижимость' },
  { id: 'clothes', name: 'Одежда' },
  { id: 'electronics', name: 'Электроника' },
  { id: 'services', name: 'Услуги' },
];

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const [addressData, setAddressData] = React.useState({
    address: '',
    lat: null,
    lng: null,
  });
  const [imagePreview, setImagePreview] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');

  // --- Получение объявления ---
  const {
    data: ad,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const adRef = doc(db, 'ads', id);
      const snap = await getDoc(adRef);
      if (!snap.exists()) throw new Error('Объявление не найдено');
      return { id: snap.id, ...snap.data() };
    },
  });

  // --- Заполнение формы при загрузке ---
  React.useEffect(() => {
    if (!ad) return;

    // Проверка прав
    if (ad.userId !== user?.uid) {
      navigate(`/ad/${id}`);
      return;
    }

    reset({
      title: ad.title || '',
      description: ad.description || '',
      price: ad.price || '',
      category: ad.category || '',
    });

    setAddressData({
      address: ad.address || '',
      lat: ad.location?.lat ?? null,
      lng: ad.location?.lng ?? null,
    });

    setImagePreview(ad.imageUrl || '');
  }, [ad, user, reset, navigate, id]);

  // --- Обновление объявления ---
  const updateAd = useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error('Требуется авторизация');

      let imageUrl = ad.imageUrl;
      if (data.image?.[0]) {
        const file = data.image[0];

        // Валидация
        if (!file.type.startsWith('image/')) {
          throw new Error('Выберите изображение');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Изображение не более 5 МБ');
        }

        const uniqueName = `${Date.now()}-${file.name}`;
        const imageRef = ref(storage, `images/${user.uid}/${uniqueName}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      const updateData = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category,
        imageUrl,
        address: addressData.address || null,
        location:
          addressData.lat && addressData.lng
            ? { lat: addressData.lat, lng: addressData.lng }
            : null,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'ads', id), updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ad', id]);
      queryClient.invalidateQueries(['userAds', user?.uid]);
      queryClient.invalidateQueries(['ads']);
      navigate(`/ad/${id}`);
    },
    onError: (err) => {
      setUploadError(err.message);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Выберите изображение');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Изображение не более 5 МБ');
      return;
    }

    setUploadError('');
    setValue('image', e.target.files);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- Рендер ---
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {fetchError.message}
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2, background: 'var(--gradient)', color: 'var(--text)' }}
          >
            На главную
          </Button>
        </motion.div>
      </Box>
    );
  }

  if (!user || ad?.userId !== user.uid) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Доступ запрещён
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/ad/${id}`)}
          sx={{ mt: 2, background: 'var(--gradient)', color: 'var(--text)' }}
        >
          К объявлению
        </Button>
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
        sx={{
          color: 'var(--text)',
          mb: 4,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        Редактировать объявление
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit((data) => updateAd.mutate(data))}
        className="glass"
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 'var(--radius)',
          maxWidth: 700,
          mx: 'auto',
        }}
      >
        {/* Ошибки */}
        {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}

        {/* Заголовок */}
        <TextField
          label="Заголовок"
          fullWidth
          {...register('title', {
            required: 'Укажите заголовок',
            minLength: { value: 5, message: 'Минимум 5 символов' },
          })}
          error={!!errors.title}
          helperText={errors.title?.message}
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

        {/* Описание */}
        <TextField
          label="Описание"
          multiline
          rows={4}
          fullWidth
          {...register('description', {
            required: 'Опишите товар',
            minLength: { value: 20, message: 'Минимум 20 символов' },
          })}
          error={!!errors.description}
          helperText={errors.description?.message}
          sx={{
            mb: 3,
            '& .MuiInputLabel-root': { color: 'var(--muted)' },
            '& .MuiOutlinedInput-root': {
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)',
            },
            textarea: { color: 'var(--text)' },
          }}
        />

        {/* Цена */}
        <TextField
          label="Цена (₽)"
          type="number"
          fullWidth
          {...register('price', {
            required: 'Укажите цену',
            min: { value: 0, message: 'Цена не может быть отрицательной' },
          })}
          error={!!errors.price}
          helperText={errors.price?.message}
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

        {/* Категория */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: 'var(--muted)' }}>Категория</InputLabel>
          <Select
            {...register('category', { required: 'Выберите категорию' })}
            sx={{
              color: 'var(--text)',
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)',
            }}
            error={!!errors.category}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
          {errors.category && (
            <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
              {errors.category.message}
            </Typography>
          )}
        </FormControl>

        {/* Адрес */}
        <Box sx={{ mb: 3 }}>
          <AddressAutocomplete
            value={addressData.address}
            onChange={setAddressData}
          />
        </Box>

        {/* Изображение */}
        <Box sx={{ mb: 3 }}>
          {imagePreview && (
            <Box
              sx={{
                mb: 2,
                p: 1,
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius)',
                display: 'inline-block',
              }}
            >
              <img
                src={imagePreview}
                alt="Текущее"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius)',
                }}
              />
            </Box>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 0',
              color: 'var(--text)',
              fontFamily: 'Inter',
            }}
          />
        </Box>

        {/* Кнопка */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={updateAd.isPending}
            sx={{
              background: 'var(--gradient)',
              color: 'var(--text)',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 'var(--radius)',
              '&:hover': { background: 'var(--accent-2)' },
            }}
          >
            {updateAd.isPending ? (
              <CircularProgress size={24} sx={{ color: 'var(--text)' }} />
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default EditAd;