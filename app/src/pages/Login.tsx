import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }).toString(),
    });

    if (res.ok) {
      const data = await res.json();
      onLogin(data);
      navigate('/');
    } else {
      alert('Не вдалось ввійти в систему');
    }
  }

  return (
    <Card className="max-w-sm mx-auto mt-8">
      <CardHeader>
        <CardTitle>Вхід</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Ім'я користувача чи email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Login</Button>
        </form>
      </CardContent>
    </Card>
  );
}
