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
import { EmployerJobs } from '@/pages/EmployerJobs';
import { JobSearch } from '@/pages/JobSearch';
import { UserInfo } from '@/pages/UserInfo';
import { ApplicationsList } from '@/pages/ApplicationsList';
import { ApplicationChat } from '@/pages/ApplicationChat';
import { EmployerApplications } from '@/pages/EmployerApplications';
import { LeaveReview } from '@/pages/LeaveReview';

import { apiFetch } from '@/lib/api';
import * as storageHelper from '@/lib/storageHelper';

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
              { user?.introduced !== false &&
                <Navbar user={user} onLogout={handleLogout} />
              }

              <Routes>
                <Route path="/" element={<Home user={user} setUser={setUser} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/settings" element={<UserSettings user={user} setUser={setUser} />} />
                <Route path="/location" element={<LocationPicker user={user} setUser={setUser} />} />
                <Route path="/create-job" element={<CreateJob user={user} />} />
                <Route path="/myjobs" element={<EmployerJobs user={user} />} />
                <Route path="/search-job" element={<JobSearch user={user} />} />
                <Route path="/user-info/:userId" element={<UserInfo />} />
                <Route path="/applications" element={<ApplicationsList user={user} />} />
                <Route path="/applications/:applicationId" element={<ApplicationChat user={user} />} />
                <Route path="/employer-applications" element={<EmployerApplications user={user} />} />
                <Route path="/leave-review" element={<LeaveReview user={user} />} />
              </Routes>
            </BrowserRouter>
          )
      }
    </ThemeProvider>
  );
};

export default App;
