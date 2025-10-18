import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, phone, fullname }),
    });

    if (res.ok) {
      alert('Реєстрація успішна!');
      navigate('/login');
    } else {
      alert('Не вдалось зареєструватись');
    }
  }

  return (
    <Card className="max-w-sm mx-auto mt-8">
      <CardHeader>
        <CardTitle>Реєстрація</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Ім'я користувача"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Електронна пошта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Номер телефону"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            placeholder="Повне ім'я"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Зареєструватись</Button>
        </form>
      </CardContent>
    </Card>
  );
}
