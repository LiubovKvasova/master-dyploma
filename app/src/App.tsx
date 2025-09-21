import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { UserSettings } from '@/pages/UserSettings';
import { LocationPicker } from '@/pages/LocationPicker';
import { CreateJob } from '@/pages/CreateJob';
import { JobSearch } from '@/pages/JobSearch';

import { apiFetch } from '@/lib/api';
import * as storageHelper from '@/lib/storageHelper';
import { EmployerJobs } from './pages/EmployerJobs';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogin = async (data: any) => {
    const expirationDate = new Date(data.expires);
    const user = data?.user;

    await storageHelper.setUser(user, expirationDate.getTime());
    setUser(user);
  };

  const handleLogout = async () => {
    await apiFetch('/auth/logout');
    await storageHelper.removeUser();
    setUser(null);
  };

  useEffect(() => {
    // async IIFE to prevent passing async function to useEffect
    (async () => {
      const user = await storageHelper.getUser();

      if (user) {
        setUser(user);
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
                <Route path="/settings" element={<UserSettings user={user} setUser={setUser} />}></Route>
                <Route path="/location" element={<LocationPicker user={user} setUser={setUser} />}></Route>
                <Route path="/create-job" element={<CreateJob user={user} />}></Route>
                <Route path="/myjobs" element={<EmployerJobs user={user} />}></Route>
                <Route path="/search-job" element={<JobSearch user={user} />}></Route>
              </Routes>
            </BrowserRouter>
          )
      }
    </ThemeProvider>
  );
};

export default App;
