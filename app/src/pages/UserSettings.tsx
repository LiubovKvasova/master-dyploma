import type { Dispatch } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import * as storageHelper from '@/lib/storageHelper';

export const UserSettings = ({ user, setUser }: { user: any, setUser: Dispatch<any> }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [role, setRole] = useState(user?.role);

  // --- Handlers ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await apiFetch('/users/update', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    });

    if (res.ok) {
      const newUser = await res.json();
      await storageHelper.updateUser(newUser);
      setUser((oldValue: object) => Object.assign(oldValue, newUser));

      alert('Profile updated!');
    } else {
      alert('Error updating profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/users/update/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.ok) {
      alert('Password updated!');
    } else {
      alert('Error updating password');
    }
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/users/update/role', {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      const newUser = await res.json();
      await storageHelper.updateUser(newUser);
      setUser((oldValue: object) => Object.assign(oldValue, newUser));

      alert('Role updated!');
    } else {
      alert('Error updating role');
    }
  };

  return (
    <div className="container mx-auto p-6 grid gap-6">
      {/* --- Profile Update --- */}
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <CardFooter>
              <Button type="submit">Save</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* --- Password Update --- */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <CardFooter>
              <Button type="submit">Update Password</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* --- Role Update --- */}
      <Card>
        <CardHeader>
          <CardTitle>Change Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRoleUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardFooter>
              <Button type="submit">Update Role</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
