import { useState, useEffect } from 'react';
import { User } from '../types';

const SESSION_KEY = 'mumbleTasksSession';
const ACTIVITY_KEY = 'mumbleTasksLastActivity';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      try {
        const session = localStorage.getItem(SESSION_KEY);
        const lastActivity = localStorage.getItem(ACTIVITY_KEY);

        if (session && lastActivity) {
          const inactiveTime = Date.now() - parseInt(lastActivity);
          // Session expires after 30 days
          if (inactiveTime > 30 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(ACTIVITY_KEY);
            return null;
          }

          const userData = JSON.parse(session);
          if (userData && userData.id && userData.email) {
            // Update last activity
            localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
            return userData;
          }
        }
        return null;
      } catch (error) {
        console.error('Error checking session:', error);
        return null;
      }
    };

    const userData = checkSession();
    setUser(userData);
    setLoading(false);

    // Set up interval to check session periodically
    const interval = setInterval(() => {
      const updatedUser = checkSession();
      if (!updatedUser && user) {
        setUser(null);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const signIn = (email: string, password: string) => {
    try {
      const userId = `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}`;
      const userData = { 
        id: userId,
        email 
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
      setUser(userData);
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error('Failed to sign in. Please try again.');
    }
  };

  const signOut = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ACTIVITY_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, signIn, signOut };
}