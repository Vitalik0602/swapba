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
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: 'var(--neon)' }}
    >
      <Card
        component={Link}
        to={`/category/${category.id}`}
        sx={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', textDecoration: 'none' }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <img
            src={image || '/images/no-image.png'}
            alt={category.name}
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
          />
          <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginTop: '10px' }}>
            {category.name}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CategoryCard;