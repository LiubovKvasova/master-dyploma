import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { apiFetch } from '@/lib/api';
import { USER_COOKIE_NAME } from './lib/constants';

const App = () => {
  const [user, setUser] = useState<any>(null);

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
      setUser(null);
      await window.cookieStore.delete(USER_COOKIE_NAME);
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
    })();
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
