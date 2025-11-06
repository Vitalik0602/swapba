// src/components/Navbar.js — ПОЛНЫЙ, РАБОЧИЙ, БЕЗ ОШИБОК
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  AddCircle,
  Favorite,
  Message,
  AccountCircle,
  Logout,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Главная', path: '/', icon: null },
  { label: 'Создать', path: '/create', icon: <AddCircle />, protected: true },
  { label: 'Избранное', path: '/favorites', icon: <Favorite />, protected: true },
  { label: 'Сообщения', path: '/messages', icon: <Message />, protected: true },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleProfileMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'var(--accent)' }}>
        Swapix
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {navItems.map((item) => {
          if (item.protected && !user) return null;
          return (
            <ListItem
              key={item.path}
              button
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                justifyContent: 'center',
                '&.Mui-selected': {
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  '&:hover': { backgroundColor: '#e65c00' },
                },
              }}
            >
              {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
              <ListItemText primary={item.label} />
            </ListItem>
          );
        })}
        {user ? (
          <>
            <ListItem button onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} />
              <ListItemText primary="Профиль" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              <ListItemText primary="Выйти" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={handleLogin}>
            <LoginIcon sx={{ mr: 1 }} />
            <ListItemText primary="Войти" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  if (loading) {
    return null; // Или лоадер
  }

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--stroke)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Логотип */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.5px',
              }}
            >
              Swapix
            </Typography>
          </Box>

          {/* Поиск */}
          <Box
            sx={{
              flexGrow: 1,
              maxWidth: 500,
              mx: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Search />}
                onClick={() => navigate('/search')}
                sx={{
                  borderColor: 'var(--stroke)',
                  color: 'var(--text)',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.2,
                  '&:hover': { borderColor: 'var(--accent)', background: 'rgba(255,109,0,0.05)' },
                }}
              >
                Поиск...
              </Button>
            </motion.div>
          </Box>

          {/* Десктоп меню */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => {
              if (item.protected && !user) return null;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: isActive(item.path) ? 'var(--accent)' : 'var(--text)',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    textTransform: 'none',
                    '&:hover': { color: 'var(--accent)' },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {user ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    sx={{ width: 36, height: 36 }}
                  >
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      background: 'var(--bg-2)',
                      border: '1px solid var(--stroke)',
                      mt: 1,
                    },
                  }}
                >
                  <MenuItem onClick={handleProfile}>
                    <AccountCircle sx={{ mr: 1 }} /> Профиль
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} /> Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleLogin}
                sx={{
                  background: 'var(--gradient)',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Войти
              </Button>
            )}
          </Box>

          {/* Мобильный поиск */}
          <IconButton
            color="inherit"
            onClick={() => navigate('/search')}
            sx={{ display: { md: 'none' } }}
          >
            <Search />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Мобильное меню */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            background: 'var(--bg-1)',
            borderRight: '1px solid var(--stroke)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;