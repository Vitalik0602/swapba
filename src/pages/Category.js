// src/pages/Category.js — ПОЛНЫЙ КОД
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import AdCard from '../components/AdCard';
import { motion } from 'framer-motion';

function Category() {
  const { id } = useParams();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads', 'category', id],
    queryFn: async () => {
      const q = query(collection(db, 'ads'), where('category', '==', id));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          textAlign: { xs: 'center', md: 'left' },
          fontFamily: 'Montserrat',
        }}
      >
        {id}
      </Typography>

      {ads.length > 0 ? (
        <Grid container spacing={3}>
          {ads.map((ad) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
              <AdCard ad={ad} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Нет объявлений в этой категории
          </Typography>
        </Box>
      )}
    </motion.div>
  );
}

export default Category;