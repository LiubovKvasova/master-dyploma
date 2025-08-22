import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { MapPicker } from '@/components/map-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, geoFetch } from '@/lib/api';

type CreateJobProps = {
  user: {
    role: string;
    coordinates?: [number, number];
    address?: object;
  };
};

export function CreateJob({ user }: CreateJobProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [hourRate, setHourRate] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [coords, setCoords] = useState<[number, number] | undefined>(user?.coordinates);
  const [address, setAddress] = useState<any>(user?.address);

  if (user?.role !== 'employer') {
    return <Navigate to="/" replace />;
  }

  const handleSelect = async (coordinates: [number, number]) => {
    setCoords(coordinates);

    const [lat, lon] = coordinates;
    const result = await geoFetch(lat, lon);

    if (result) {
      setAddress(result);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coords) {
      alert('Будь ласка, оберіть місце роботи на карті!');
      return;
    }

    try {
      const res = await apiFetch(`/jobs/create`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          hourRate,
          address,
          duration: {
            value: duration,
            representation: `${duration} години`,
          },
          coordinates: coords,
        }),
      });

      if (!res.ok) {
        throw new Error('Не вдалося створити роботу');
      }

      setTitle('');
      setDescription('');
      setCategory('');
      setHourRate('');
      setDuration('');
      setCoords(undefined);

      alert('Роботу створено успішно!');
    } catch (err) {
      console.error(err);
      alert('Сталася помилка при створенні роботи.');
    }
  };

  return (
    <div className="flex gap-6 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/2">
        <div>
          <Label htmlFor="title">Назва роботи</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Опис</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Категорія</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="hourRate">Оплата за годину (грн)</Label>
          <Input
            id="hourRate"
            type="number"
            value={hourRate}
            onChange={(e) => setHourRate(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Тривалість (у годинах)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
          />
        </div>

        <Button type="submit" className="mt-2">
          Створити роботу
        </Button>
      </form>

      <div className="w-1/2 h-[500px] border rounded-md">
        <MapPicker
          onSelect={handleSelect}
          coords={coords}
          style={{ width: "100%", height: "100%" }}
        />

        <p>{coords?.join(', ')}</p>

        {
          address && Object.entries(address).map(
            ([key, value]) => <p key={key}>{key}: {value as any}</p>
          )
        }
      </div>
    </div>
  );
}
