import { useEffect, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import { User, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelectDropdown } from '@/components/multiselect-dropdown';
import { JOB_CATEGORIES } from '@/lib/constants';
import { apiFetch } from '@/lib/api';
import { SCALE } from '@/lib/constants';
import { getCategoryName, stringifyAddress } from '@/lib/utils';
import { formatDuration } from '@/lib/language';

type JobSearchProps = {
  user: {
    role: string;
    coordinates?: [number, number];
    address?: object;
  };
};

export function JobSearch({ user }: JobSearchProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(1000);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (user?.role !== 'worker') {
    return <Navigate to="/" replace />;
  }

  if (!user.coordinates || user.coordinates.length < 2) {
    return <Navigate to="/location" replace />;
  }

  const handleSearch = async () => {
    const [lat, lng] = user.coordinates as [number, number];

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      maxDistance: String(maxDistance),
    });

    for (const category of selectedCategories) {
      params.append('category', category);
    }

    for (const duraton of selectedDurations) {
      params.append('duration', duraton);
    }

    const res = await apiFetch(`/jobs/nearby?${params.toString()}`);

    if (res.ok) {
      const data = await res.json();

      // Filter out jobs that are out of bounds
      const filtered = data
        .map((job: Job) => {
          const distance = L.latLng(lat, lng).distanceTo(
            L.latLng(job.coordinates[0], job.coordinates[1])
          );
          const fullAddress = stringifyAddress(job.address);

          return { ...job, distance, fullAddress };
        })
        .filter((job: Job) => job.distance! <= maxDistance);

      setSelectedJobId(null);
      setJobs(filtered);
      setSearchRadius(maxDistance);
    } else {
      alert('Не вдалося отримати роботи поблизу');
    }
  };

  const handleApply = async (jobId: string) => {
    if (!jobId) return;

    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        alert('Ваша заявка успішно відправлена!');
        await handleSearch();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Помилка: ${data.message || 'Не вдалося подати заявку'}`);
      }
    } catch (error) {
      console.error('Помилка при подачі заявки:', error);
      alert('Не вдалося з’єднатися з сервером');
    }
  };

  const toggleDuration = (value: string) => {
    setSelectedDurations((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="flex gap-6 p-6">
      <div className="w-1/2 overflow-y-auto max-h-[90vh] flex flex-col gap-4">
        {/* форма пошуку */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="mb-4">
            <Label htmlFor="duration">Відстань, м</Label>
            <Input
              type="number"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              placeholder="Макс. відстань (м)"
            />
          </div>

          {/* фільтр по категоріях */}
          <MultiSelectDropdown
            label="Категорія роботи"
            className="mb-4"
            options={JOB_CATEGORIES}
            values={selectedCategories}
            setValues={setSelectedCategories}
          />

          {/* фільтр по тривалості */}
          <div className="mb-4">
            <Label>Тривалість</Label>
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDurations.includes("day")}
                  onCheckedChange={() => toggleDuration("day")}
                />
                <span>В межах дня</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDurations.includes("week")}
                  onCheckedChange={() => toggleDuration("week")}
                />
                <span>В межах тижня</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDurations.includes("weeks")}
                  onCheckedChange={() => toggleDuration("weeks")}
                />
                <span>Кілька тижнів</span>
              </label>
            </div>
          </div>

          <Button className="w-1/2 self-center" onClick={handleSearch}>Пошук</Button>
        </div>

        {jobs.map((job) => (
          <div key={job._id} ref={(el) => { listRefs.current[job._id] = el }}>
            <Card
              className={`cursor-pointer ${selectedJobId === job._id ? 'border-primary' : ''}`}
              onClick={() => setSelectedJobId(job._id)}
            >
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{job.description}</p>

                <p className="mb-1">
                  <strong>Категорія:</strong>
                  <span className="ml-1">{getCategoryName(job.category)}</span>
                </p>

                <p className="mb-1">
                  <strong>Ставка:</strong>
                  <span className="ml-1">{job.hourRate} грн/год</span>
                </p>

                <p className="mb-1">
                  <strong>Тривалість:</strong>
                  <span className="ml-1">{formatDuration(job.duration)}</span>
                </p>

                {typeof job.distance === 'number' && (
                  <p>
                    <strong>Відстань:</strong>
                    <span className="ml-1">{Math.round(job.distance)} м</span>
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {job.fullAddress}
                  </span>
                </div>

                {job.owner && (
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <User className="h-4 w-4" />
                    <Link
                      to={`/user-info/${job.owner._id}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {job.owner.fullname} ({job.owner.username})
                    </Link>
                  </div>
                )}

                {/* кнопка "Відгукнутись" */}
                <div className="mt-4">
                  {job.hasApplied ? (
                    <Button className="w-full" disabled variant="secondary">
                      Ви уже відгукнулись
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleApply(job._id)}
                      disabled={!job._id}
                    >
                      Відгукнутись на вакансію
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="w-1/2 h-[90vh] border rounded-md overflow-hidden">
        <Map
          jobs={jobs}
          userCoords={user.coordinates}
          selectedJobId={selectedJobId}
          onSelect={setSelectedJobId}
          listRefs={listRefs}
          searchRadius={searchRadius}
        />
      </div>
    </div>
  );
}

// плавний переліт до вибраної роботи
function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, SCALE.BUILDING);
    }
  }, [coords, map]);

  return null;
}

function Map({ jobs, userCoords, selectedJobId, onSelect, listRefs, searchRadius }: any) {
  const selectedJob = jobs.find((j: Job) => j._id === selectedJobId) || null;

  useEffect(() => {
    if (selectedJob) {
      listRefs.current[selectedJob._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedJob]);

  return (
    <MapContainer
      center={userCoords}
      zoom={SCALE.BUILDING}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* маркер юзера */}
      <Marker position={userCoords}>
        <Tooltip permanent direction="top">Ви тут</Tooltip>
      </Marker>

      {/* круг пошуку */}
      {searchRadius && (
        <Circle
          center={userCoords}
          radius={searchRadius}
          pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.08 }}
        />
      )}

      {/* маркери робіт */}
      {jobs.map((job: Job) => (
        <Marker
          key={job._id}
          position={job.coordinates}
          eventHandlers={{
            click: () => onSelect(job._id),
          }}
        >
          <Tooltip permanent direction="right">{job.title}</Tooltip>
        </Marker>
      ))}

      <FlyTo coords={selectedJob ? selectedJob.coordinates : null} />
    </MapContainer>
  );
}
