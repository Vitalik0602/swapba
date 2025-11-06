// src/pages/Category.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import AdCard from '../components/AdCard';
import Filters from '../components/Filters';
import { motion } from 'framer-motion';

function Category() {
  const { id } = useParams();

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['ads', id],
    queryFn: async () => {
      const q = query(collection(db, 'ads'), where('category', '==', id));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const handleFilter = (filters) => {
    console.log('Применены фильтры:', filters);
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
        <Typography color="error">Ошибка загрузки объявлений: {error.message}</Typography>
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
        sx={{ color: 'var(--text)', mb: 3, fontFamily: 'Montserrat', fontWeight: 700 }}
      >
        Категория: {id.charAt(0).toUpperCase() + id.slice(1)}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Filters onFilter={handleFilter} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <AdCard ad={ad} />
                </Grid>
              ))
            ) : (
              <Typography sx={{ color: 'var(--muted)' }}>Объявления не найдены</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Category;