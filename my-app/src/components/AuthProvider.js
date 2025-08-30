// src/components/AuthProvider.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store.js';

const AuthProvider = ({ children }) => {
  const { checkAuth, isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return children;
};

export default AuthProvider;