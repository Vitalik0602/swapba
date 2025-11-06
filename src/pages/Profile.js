// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../firebase/firebase';
import {
  Box,
  Typography,
  Button,
  Avatar,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { Edit, Save, Cancel, CameraAlt, Phone, Mail, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import AdCard from '../components/AdCard';

function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [favoriteAds, setFavoriteAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [alert, setAlert] = useState({ type: '', message: '' });

  // Загрузка данных профиля и объявлений
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Профиль пользователя
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setProfile(userData);
        setName(userData.name || user.displayName || '');
        setPhone(userData.phone || '');
        setAvatarPreview(user.photoURL || '');

        // Мои объявления
        const myAdsQuery = query(
          collection(db, 'ads'),
          where('userId', '==', user.uid)
        );
        const myAdsSnap = await getDocs(myAdsQuery);
        const myAdsList = myAdsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          sellerName: userData.name || user.displayName || 'Продавец',
        }));
        setMyAds(myAdsList);

        // Избранное
        const favorites = userData.favorites || [];
        const favAdsList = [];
        for (const adId of favorites) {
          const adDoc = await getDoc(doc(db, 'ads', adId));
          if (adDoc.exists()) {
            const adData = adDoc.data();
            const sellerDoc = await getDoc(doc(db, 'users', adData.userId));
            const sellerName = sellerDoc.exists()
              ? (sellerDoc.data().name || 'Продавец')
              : 'Продавец';
            favAdsList.push({
              id: adDoc.id,
              ...adData,
              sellerName,
            });
          }
        }
        setFavoriteAds(favAdsList);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setAlert({ type: 'error', message: 'Не удалось загрузить данные' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Обработчик аватара
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Сохранение профиля
  const handleSave = async () => {
    setSaving(true);
    try {
      let photoURL = user.photoURL;

      // Загрузка аватара
      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
        await updateProfile(user, { photoURL });
      }

      // Обновление в Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        phone: phone.trim(),
      });

      setProfile((prev) => ({ ...prev, name: name.trim(), phone: phone.trim() }));
      setEditing(false);
      setAlert({ type: 'success', message: 'Профиль обновлён!' });
      setTimeout(() => setAlert({}), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка сохранения' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress size={60} sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  const displayName = name.trim() || 'Продавец';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      sx={{ py: 4, maxWidth: 1200 }}
    >
      {/* Обложка */}
      <Box
        sx={{
          height: { xs: 160, md: 220 },
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, var(--accent) 0%, #ff8a00 100%)',
          mb: -7,
          position: 'relative',
          overflow: 'hidden',
        }}
      />

      {/* Аватар и основная информация */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar
              src={avatarPreview || '/default-avatar.png'}
              alt={displayName}
              sx={{
                width: 160,
                height: 160,
                border: '8px solid var(--bg-1)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                mx: { xs: 'auto', md: 0 },
              }}
            >
              {displayName[0]}
            </Avatar>
          </motion.div>

          {editing && (
            <Button
              variant="outlined"
              component="label"
              startIcon={<CameraAlt />}
              sx={{ mt: 2, color: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              Сменить фото
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          {editing ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  InputProps={{ startAdornment: <Person sx={{ color: 'var(--muted)', mr: 1 }} /> }}
                  sx={{ '& .MuiOutlinedInput-root': { background: 'var(--glass-strong)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  fullWidth
                  InputProps={{ startAdornment: <Phone sx={{ color: 'var(--muted)', mr: 1 }} /> }}
                  sx={{ '& .MuiOutlinedInput-root': { background: 'var(--glass-strong)' } }}
                />
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: 'var(--font-heading)' }}>
                {displayName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, color: 'var(--muted)' }}>
                <Mail fontSize="small" />
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              {phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--muted)' }}>
                  <Phone fontSize="small" />
                  <Typography variant="body1">{phone}</Typography>
                </Box>
              )}
              <Typography variant="body2" sx={{ color: 'var(--muted)', mt: 1 }}>
                На Swapix с {new Date(user.metadata.creationTime).toLocaleDateString('ru-RU')}
              </Typography>
            </>
          )}

          <Box sx={{ mt: 4 }}>
            {editing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ mr: 1, background: 'var(--gradient)' }}
                >
                  Сохранить
                </Button>
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                sx={{ background: 'var(--gradient)' }}
              >
                Редактировать профиль
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Алерт */}
      {alert.message && (
        <Alert severity={alert.type} sx={{ mb: 4 }} onClose={() => setAlert({})}>
          {alert.message}
        </Alert>
      )}

      <Divider sx={{ my: 5 }} />

      {/* Статистика */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Статистика</Typography>
        <Grid container spacing={3}>
          {[
            { label: 'Объявлений', value: myAds.length, color: 'var(--accent)' },
            { label: 'В избранном', value: favoriteAds.length, color: '#ff1744' },
            { label: 'Просмотров', value: myAds.reduce((s, a) => s + (a.views || 0), 0), color: '#00c853' },
          ].map((stat, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ color: 'var(--muted)' }}>{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Мои объявления */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Мои объявления</Typography>
          <Button
            variant="text"
            onClick={() => navigate('/create')}
            sx={{ color: 'var(--accent)' }}
          >
            + Создать
          </Button>
        </Box>

        {myAds.length > 0 ? (
          <Grid container spacing={3}>
            {myAds.map((ad) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
                <AdCard ad={ad} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', background: 'var(--bg-2)', border: '1px dashed var(--stroke)' }}>
            <Typography sx={{ color: 'var(--muted)', mb: 2 }}>У вас нет объявлений</Typography>
            <Button variant="contained" sx={{ background: 'var(--gradient)' }} onClick={() => navigate('/create')}>
              Разместить объявление
            </Button>
          </Paper>
        )}
      </Box>

      {/* Избранное */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Избранное</Typography>
        {favoriteAds.length > 0 ? (
          <Grid container spacing={3}>
            {favoriteAds.map((ad) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
                <AdCard ad={ad} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', background: 'var(--bg-2)', border: '1px solid var(--stroke)' }}>
            <Typography sx={{ color: 'var(--muted)' }}>Избранное пусто</Typography>
          </Paper>
        )}
      </Box>
    </motion.div>
  );
}

export default Profile;