import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      alert('Реєстрація успішна!');
      navigate('/login');
    } else {
      alert('Не вдалось зареєструватись');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-2 max-w-sm">
      <h1 className="text-xl font-bold">Реєстрація</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2">
        Register
      </button>
    </form>
  );
}
