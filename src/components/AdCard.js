// src/components/AdCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

function AdCard({ ad }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: 'var(--neon)' }}
    >
      <Card className="glass" sx={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)' }}>
        <CardMedia
          component="img"
          height="160"
          image={ad.imageUrl || 'https://placehold.co/300x160?text=Нет+изображения'}
          alt={ad.title}
          sx={{ borderRadius: 'var(--radius) var(--radius) 0 0', objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', fontWeight: 600 }}>
            {ad.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted)', marginBottom: '10px', fontFamily: 'Inter' }}>
            {ad.description.length > 100 ? ad.description.slice(0, 100) + '...' : ad.description}
          </Typography>
          <Typography variant="h6" sx={{ color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Montserrat' }}>
            {ad.price} ₽
          </Typography>
          <Button
            variant="contained"
            component={motion(Link)}
            to={`/ad/${ad.id}`}
            sx={{
              background: 'var(--gradient)',
              color: 'var(--text)',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              '&:hover': { background: 'var(--accent-2)' }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Подробнее
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AdCard;