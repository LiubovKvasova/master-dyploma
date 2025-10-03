import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import { ChevronDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { JOB_CATEGORIES } from '@/lib/constants';
import { apiFetch } from '@/lib/api';
import { SCALE } from '@/lib/constants';
import { getCategoryName } from '@/lib/utils';

type Job = {
  _id: string;
  title: string;
  description: string;
  category: string;
  hourRate: number;
  duration: {
    hoursPerDay: number;
    daysPerWeek: number;
    weeks: number;
  };
  coordinates: [number, number]; // [lng, lat]

  // Calculated for Leaflet environment
  distance?: number;
};

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
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
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

    const res = await apiFetch(`/jobs/nearby?${params.toString()}`);

    if (res.ok) {
      const data = await res.json();

      // Filter out jobs that are out of bounds
      const filtered = data
        .map((job: Job) => {
          const distance = L.latLng(lat, lng).distanceTo(
            L.latLng(job.coordinates[0], job.coordinates[1])
          );

          return { ...job, distance };
        })
        .filter((job: Job) => job.distance! <= maxDistance);

      setSelectedJobId(null);
      setJobs(filtered);
      setSearchRadius(maxDistance);
    } else {
      alert('Не вдалося отримати роботи поблизу');
    }
  };

  const toggleCategory = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((category) => category !== value));
    } else {
      setSelectedCategories([...selectedCategories, value]);
    }
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
          <div className="mb-4">
            <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <span>Категорія роботи</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {JOB_CATEGORIES.filter(
                  (cat) => !selectedCategories.includes(cat.value)
                ).map((cat) => (
                  <DropdownMenuItem
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* обрані категорії (pill buttons) */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((value) => {
                const cat = JOB_CATEGORIES.find((c) => c.value === value);
                if (!cat) return null;
                return (
                  <Button
                    key={value}
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleCategory(value)}
                  >
                    {cat.label} ✕
                  </Button>
                );
              })}
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
                <p>{job.description}</p>
                <p>Категорія: {getCategoryName(job.category)}</p>
                <p>Ставка: {job.hourRate} грн/год</p>
                <p>Тривалість: {JSON.stringify(job.duration)}</p>

                {typeof job.distance === 'number' && (
                  <p>Відстань: {Math.round(job.distance)} м</p>
                )}
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
