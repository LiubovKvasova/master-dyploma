import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';

import { MapPicker } from '@/components/map-picker';
import { SlideFade } from '@/components/slide-fade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiFetch, geoFetch } from '@/lib/api';
import { JOB_CATEGORIES } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';

type CreateJobProps = {
  user: {
    role: string;
    coordinates?: [number, number];
    address?: object;
  };
};

type DurationMode = 'day' | 'week' | 'weeks';

export function CreateJob({ user }: CreateJobProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [hourRate, setHourRate] = useState<number | ''>('');
  const [durationMode, setDurationMode] = useState<DurationMode>('day');
  const [duration, setDuration] = useState({
    hoursPerDay: 1,
    daysPerWeek: 1,
    weeks: 1,
  });
  const [coords, setCoords] = useState<[number, number] | undefined>(
    user?.coordinates
  );
  const [address, setAddress] = useState<any>(user?.address);
  const [groupWork, setGroupWork] = useState(false);
  const [maxWorkers, setMaxWorkers] = useState<number | null>(null);

  if (user?.role !== 'employer') {
    return <Navigate to="/" replace />;
  }

  if (!user.coordinates || user.coordinates.length < 2) {
    return <Navigate to="/location" replace />;
  }

  const handleSelect = async (coordinates: [number, number]) => {
    setCoords(coordinates);

    const [lat, lon] = coordinates;
    const result = await geoFetch(lat, lon);

    if (result) {
      setAddress(result);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coords) {
      alert('Будь ласка, оберіть місце роботи на карті!');
      return;
    }

    const data = {
      title,
      description,
      category,
      hourRate,
      address,
      duration,
      coordinates: coords,
      maxWorkers: 1,
    };

    if (groupWork && maxWorkers) {
      data.maxWorkers = maxWorkers;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.append('data', JSON.stringify(data));

    try {
      const res = await apiFetch(`/jobs/create`, {
        method: 'POST',
        body: formData,
      }, {
        multipart: true
      });

      if (!res.ok) {
        throw new Error('Не вдалося створити роботу');
      }

      setTitle('');
      setDescription('');
      setCategory('');
      setHourRate('');
      setDurationMode('day');
      setDuration({ hoursPerDay: 1, daysPerWeek: 1, weeks: 1 });
      setCoords(undefined);

      alert('Роботу створено успішно!');
    } catch (err) {
      console.error(err);
      alert('Сталася помилка при створенні роботи.');
    }
  };

  // Dropdown items generator
  const rangeItems = (max: number, start = 1) =>
    Array.from({ length: (max - start + 1) }, (_, i) => i + start).map((n) => (
      <SelectItem key={n} value={n.toString()}>
        {n}
      </SelectItem>
    ));

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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Оберіть категорію" />
            </SelectTrigger>
            <SelectContent>
              {JOB_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="flex">
          <div className="flex-1 flex items-center space-x-2 my-2">
            <Checkbox
              id="groupWork"
              checked={groupWork}
              onCheckedChange={() => { setGroupWork((value) => !value) }}
            />
            <Label htmlFor="groupWork">Декілька робітників</Label>
          </div>

          <SlideFade className="flex-1" show={groupWork}>
            <Label>Кількість працівників</Label>
            <Select
              value={String(maxWorkers)}
              onValueChange={(value) => { setMaxWorkers(Number(value)); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{rangeItems(20, 2)}</SelectContent>
            </Select>
          </SlideFade>
        </div>

        <div>
          <Label>Тривалість</Label>
          <RadioGroup
            value={durationMode}
            onValueChange={(val: DurationMode) => {
              setDurationMode(val);
              setDuration((d) => ({
                ...d,
                daysPerWeek: val === 'day' ? 1 : d.daysPerWeek,
                weeks: val === 'day' || val === 'week' ? 1 : d.weeks,
              }));
            }}
            className="flex flex-col space-y-2 my-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day" id="mode-day" />
              <Label htmlFor="mode-day">В межах дня</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="week" id="mode-week" />
              <Label htmlFor="mode-week">В межах тижня</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weeks" id="mode-weeks" />
              <Label htmlFor="mode-weeks">Декілька тижнів</Label>
            </div>
          </RadioGroup>

          <div className="flex gap-4 mt-3">
            {/* hours */}
            <div className="flex-1">
              <Label>Годин на день</Label>
              <Select
                value={String(duration.hoursPerDay)}
                onValueChange={(v) =>
                  setDuration((d) => ({ ...d, hoursPerDay: Number(v) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{rangeItems(15)}</SelectContent>
              </Select>
            </div>

            {/* days */}
            <SlideFade
              className="flex-1"
              show={durationMode !== 'day'}
              maxHeight="max-h-20"
            >
              <Label>Днів на тиждень</Label>
              <Select
                value={String(duration.daysPerWeek)}
                onValueChange={(v) =>
                  setDuration((d) => ({ ...d, daysPerWeek: Number(v) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{rangeItems(7)}</SelectContent>
              </Select>
            </SlideFade>


            {/* weeks */}
            <SlideFade
              className="flex-1"
              show={durationMode === 'weeks'}
              maxHeight="max-h-20"
            >
              <Label>Тижні</Label>
              <Select
                value={String(duration.weeks)}
                onValueChange={(v) =>
                  setDuration((d) => ({ ...d, weeks: Number(v) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{rangeItems(52)}</SelectContent>
              </Select>
            </SlideFade>
          </div>

          {/* warning if overtime */}
          <SlideFade
            className="flex items-center text-yellow-600 mt-2 text-sm"
            show={duration.hoursPerDay > 8}
            maxHeight="max-h-10"
          >
            <TriangleAlert className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Обрано понаднормову кількість годин</span>
          </SlideFade>
        </div>

        <div>
          <Label htmlFor="images">Зображення для опису роботи</Label>
          <Input
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/*"
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
