// src/components/CategoryCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function CategoryCard({ category, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.1, boxShadow: 'var(--neon)' }}
    >
      <Card
        component={Link}
        to={`/category/${category.id}`}
        sx={{
          background: 'var(--bg-2)',
          borderRadius: 'var(--radius)',
          textDecoration: 'none',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 2 }}>
          <motion.img
            src={image || '/images/no-image.png'}
            alt={category.name}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: 'var(--radius)',
              marginBottom: '10px',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <Typography
            variant="h6"
            sx={{ color: 'var(--text)', fontFamily: 'Montserrat', fontWeight: 600 }}
          >
            {category.name}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CategoryCard;