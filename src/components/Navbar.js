// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Search, Favorite, Person, Add } from '@mui/icons-material';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';

function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <AppBar position="sticky" sx={{ background: 'var(--bg-2)', boxShadow: 'var(--neon)' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={motion(Link)}
          to="/"
          sx={{ flexGrow: 1, color: 'var(--text)', fontFamily: 'Montserrat', fontWeight: 600 }}
          whileHover={{ scale: 1.05 }}
        >
          Swapix
        </Typography>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <IconButton component={Link} to="/search" sx={{ color: 'var(--text)' }}>
            <Search />
          </IconButton>
          <IconButton component={Link} to="/profile/favorites" sx={{ color: 'var(--text)' }}>
            <Favorite />
          </IconButton>
          <IconButton component={Link} to="/create" sx={{ color: 'var(--text)' }}>
            <Add />
          </IconButton>
          {user ? (
            <>
              <IconButton component={Link} to="/profile" sx={{ color: 'var(--text)' }}>
                <Person />
              </IconButton>
              <Button
                onClick={handleSignOut}
                sx={{ color: 'var(--text)', fontFamily: 'Inter', fontWeight: 600 }}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" sx={{ color: 'var(--text)', fontFamily: 'Inter' }}>
                Войти
              </Button>
              <Button component={Link} to="/register" sx={{ color: 'var(--text)', fontFamily: 'Inter' }}>
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;