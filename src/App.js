// src/App.js — ПОЛНЫЙ, РАБОЧИЙ, БЕЗ ОШИБОК (убран style jsx)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';

// Компоненты
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Category from './pages/Category';
import CreateAd from './pages/CreateAd';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Search from './pages/Search';
import AdDetails from './pages/AdDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import './App.css';

// Настройка React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      cacheTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Тема MUI (тёмная)
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6d00',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          color: '#e0e0e0',
        },
      },
    },
  },
});

// Защищённый маршрут
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: '6px solid #333',
            borderTop: '6px solid #ff6d00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Гостевой маршрут
const GuestRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: '6px solid #333',
            borderTop: '6px solid #ff6d00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Публичные */}
                <Route path="/" element={<Home />} />
                <Route path="/category/:id" element={<Category />} />
                <Route path="/search" element={<Search />} />
                <Route path="/ad/:id" element={<AdDetails />} />

                {/* Гостевые */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />

                {/* Защищённые */}
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreateAd />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>

        {/* Глобальные стили спиннера */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;