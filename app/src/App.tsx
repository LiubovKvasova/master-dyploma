import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";

import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { apiFetch } from '@/lib/api';
import { USER_COOKIE_NAME } from '@/lib/constants';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogin = async (data: any) => {
    const expirationDate = new Date(data.expires);
    const user = data?.user;

    await window.cookieStore.set({
      name: USER_COOKIE_NAME,
      value: JSON.stringify(user),
      expires: expirationDate.getTime()
    });

    setUser(user);
  };

  const handleLogout = async () => {
    const res = await apiFetch('/auth/logout');

    if (res?.ok) {
      await window.cookieStore.delete(USER_COOKIE_NAME);
      setUser(null);
    }
  };

  useEffect(() => {
    // async IIFE to prevent passing async function to useEffect
    (async () => {
      const user = await window.cookieStore.get(USER_COOKIE_NAME);

      if (user) {
        const parsedUser = JSON.parse(user.value);
        setUser(parsedUser);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      {
        (loading) ?
          (
            <p>Loading...</p>
          ) : (
            <BrowserRouter>
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </BrowserRouter>
          )
      }
    </ThemeProvider>
  );
};

export default App;
