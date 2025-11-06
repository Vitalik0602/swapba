// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge } from '@mui/material';
import { Home, Favorite, Chat, Person, ExitToApp, AddCircle } from '@mui/icons-material';
import { auth, db } from '../firebase/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

function Navbar({ user }) {
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessages', user?.uid],
    queryFn: async () => {
      if (!user) return 0;
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      let count = 0;
      for (const chatDoc of chatsSnapshot.docs) {
        const messagesRef = collection(db, `chats/${chatDoc.id}/messages`);
        const unreadMessagesQuery = query(
          messagesRef,
          where('recipientId', '==', user.uid),
          where('read', '==', false)
        );
        const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
        count += unreadMessagesSnapshot.size;
      }
      return count;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" className="AppBar-root">
        <Toolbar className="Toolbar-root">
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text)' }}
          >
            Swapix
          </Typography>
          <div className="navbar-desktop">
            <Button component={Link} to="/" sx={{ color: 'var(--text)' }}>
              Главная
            </Button>
            {user ? (
              <>
                <Button component={Link} to="/create" sx={{ color: 'var(--text)' }}>
                  Создать
                </Button>
                <Button component={Link} to="/profile/favorites" sx={{ color: 'var(--text)' }}>
                  Избранное
                </Button>
                <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2, '.MuiBadge-badge': { background: 'var(--accent)' } }}>
                  <Button component={Link} to="/profile/messages" sx={{ color: 'var(--text)' }}>
                    Сообщения
                  </Button>
                </Badge>
                <Button component={Link} to="/profile" sx={{ color: 'var(--text)' }}>
                  Профиль
                </Button>
                <Button onClick={handleLogout} sx={{ color: 'var(--text)' }}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" sx={{ color: 'var(--text)' }}>
                  Войти
                </Button>
                <Button component={Link} to="/register" sx={{ color: 'var(--text)' }}>
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <div className="mobile-nav">
        <div className="nav-items">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton component={Link} to="/">
              <Home sx={{ color: 'var(--text)' }} />
              <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Главная</Typography>
            </IconButton>
          </motion.div>
          {user && (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton component={Link} to="/create">
                  <AddCircle sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Создать</Typography>
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton component={Link} to="/profile/favorites">
                  <Favorite sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Избранное</Typography>
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Badge badgeContent={unreadCount} color="error" sx={{ '.MuiBadge-badge': { background: 'var(--accent)' } }}>
                  <IconButton component={Link} to="/profile/messages">
                    <Chat sx={{ color: 'var(--text)' }} />
                    <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Сообщения</Typography>
                  </IconButton>
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton component={Link} to="/profile">
                  <Person sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Профиль</Typography>
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton onClick={handleLogout}>
                  <ExitToApp sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Выйти</Typography>
                </IconButton>
              </motion.div>
            </>
          )}
          {!user && (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton component={Link} to="/login">
                  <Person sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Войти</Typography>
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton component={Link} to="/register">
                  <Person sx={{ color: 'var(--text)' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Регистрация</Typography>
                </IconButton>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;