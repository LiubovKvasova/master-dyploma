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
import { DEFAULT_PREFERENCE_ORDER, JOB_CATEGORIES, PREFERENCE_LABELS } from '@/lib/constants';
import { ReorderableList } from '@/components/reorderable-list';
import { MultiSelectDropdown } from '@/components/multiselect-dropdown';
import { EditRichText } from '@/components/edit-rich-text';

export const UserSettings = ({ user, setUser }: { user: any, setUser: Dispatch<any> }) => {
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [phone, setPhone] = useState(user?.phone);
  const [fullname, setFullname] = useState(user?.fullname);
  const [preferenceOrder, setPreferenceOrder] = useState(user?.preferenceOrder ?? DEFAULT_PREFERENCE_ORDER);
  const [interestedCategories, setInterestedCategories] = useState<string[]>(user?.interestedCategories ?? []);
  const [aboutMe, setAboutMe] = useState(user?.aboutMe ?? '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [role, setRole] = useState(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- Handlers ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await apiFetch('/users/update', {
      method: 'PUT',
      body: JSON.stringify({ username, email, phone, fullname, preferenceOrder, interestedCategories }),
    });

    if (res.ok) {
      const newUser = await res.json();
      await storageHelper.updateUser(newUser);
      setUser((oldValue: object) => ({ ...oldValue, ...newUser }));

      alert('Профіль оновлено!');
    } else {
      alert('Виникла помилка при оновленні профілю');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/users/update/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.ok) {
      alert('Пароль оновлено!');
    } else {
      alert('Виникла помилка при оновленні паролю');
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
      setUser((oldValue: object) => ({ ...oldValue, ...newUser }));

      alert('Роль оновлено!');
    } else {
      alert('Виникла помилка при оновленні ролі');
    }
  };

  return (
    <div className="container mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Дані профілю</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Ім'я користувача</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Номер телефону</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullname">Повне ім'я</Label>
              <Input id="fullname" type="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} />
            </div>

            {user?.role === 'worker' &&
              <>
                <div className="grid gap-2">
                  <Label htmlFor="criteria">Пріоритетність критеріїв</Label>
                  <ReorderableList
                    id="criteria"
                    className="text-sm"
                    items={preferenceOrder}
                    setItems={setPreferenceOrder}
                    labels={PREFERENCE_LABELS}
                  />
                </div>

                <div className="grid gap-2">
                  <MultiSelectDropdown
                    label="Бажані категорії"
                    className="mb-4"
                    options={JOB_CATEGORIES}
                    values={interestedCategories}
                    setValues={setInterestedCategories}
                  />
                </div>
              </>
            }
            <CardFooter>
              <Button type="submit">Зберегти</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Про себе</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <EditRichText
                value={aboutMe}
                onChange={setAboutMe}
                placeholder="Напишіть про себе та про власний досвід"
              />
            </div>
            <CardFooter>
              <Button type="submit">Зберегти</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зміна паролю</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="oldPassword">Старий пароль</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Новий пароль</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <CardFooter>
              <Button type="submit">Оновити</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зміна ролі</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRoleUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Працівник</SelectItem>
                  <SelectItem value="employer">Роботодавець</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardFooter>
              <Button type="submit">Оновити роль</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
