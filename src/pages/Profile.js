// src/pages/Profile.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Tabs, Tab, Box, Typography, Button } from '@mui/material';
import AdCard from '../components/AdCard';
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';

function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [tabValue, setTabValue] = React.useState(0);

  const { data: userAds = [] } = useQuery({
    queryKey: ['userAds', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const adsCollection = collection(db, 'ads');
      const q = query(adsCollection, where('userId', '==', user.uid));
      const adsSnapshot = await getDocs(q);
      return adsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '30px' }}>
        <Typography color="error">Войдите в аккаунт</Typography>
        <Button onClick={() => navigate('/login')}>Войти</Button>
      </div>
    );
  }

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
      style={{ padding: '30px' }}
    >
      <Typography variant="h4" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        Профиль: {user.email}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'var(--stroke)', marginBottom: '20px' }}>
        <Tabs value={tabValue} onChange={handleChange} sx={{ '& .MuiTab-root': { color: 'var(--muted)' }, '& .Mui-selected': { color: 'var(--accent)' } }}>
          <Tab label="Мои объявления" />
          <Tab label="Избранное" />
          <Tab label="Сообщения" />
        </Tabs>
      </Box>
      <Grid container spacing={3}>
        {tabValue === 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ color: 'var(--text)', marginBottom: '20px' }}>
              Мои объявления ({userAds.length})
            </Typography>
            <Grid container spacing={3}>
              {userAds.map(ad => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <AdCard ad={ad} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        {tabValue === 1 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ color: 'var(--text)', marginBottom: '20px' }}>
              Избранное
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
              Функция в разработке
            </Typography>
          </Grid>
        )}
        {tabValue === 2 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ color: 'var(--text)', marginBottom: '20px' }}>
              Сообщения
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
              Функция в разработке
            </Typography>
          </Grid>
        )}
      </Grid>
    </motion.div>
  );
}

export default Profile;