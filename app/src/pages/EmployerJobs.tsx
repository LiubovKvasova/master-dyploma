import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { CENTER_OF_UKRAINE, SCALE } from '@/lib/constants';
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
};

type EmployerJobsProps = {
  user: {
    role: string;
    coordinates?: [number, number];
    address?: object;
  };
};

export function EmployerJobs({ user }: EmployerJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    (async () => {
      const res = await apiFetch('/jobs/my');
      const data = await res.json();
      setJobs(data);
    })();
  }, []);

  if (user?.role !== 'employer') {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цю роботу?')) return;
    const res = await apiFetch(`/jobs/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } else {
      alert('Помилка при видаленні');
    }
  };

  return (
    <div className="flex gap-6 p-6">
      <div className="w-1/2 overflow-y-auto max-h-[90vh] flex flex-col gap-4">
        {jobs.map((job) => (
          <div key={job._id} ref={(el) => {listRefs.current[job._id] = el}}>
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
                <Button
                  variant="destructive"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job._id);
                  }}
                >
                  Видалити
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="w-1/2 h-[90vh] border rounded-md overflow-hidden">
        <Map jobs={jobs} selectedJobId={selectedJobId} onSelect={setSelectedJobId} listRefs={listRefs} />
      </div>
    </div>
  );
}

// Компонент для плавного перельоту карти
function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, SCALE.BUILDING);
    }
  }, [coords, map]);

  return null;
}

function Map({ jobs, selectedJobId, onSelect, listRefs }: any) {
  const selectedJob = jobs.find((j: Job) => j._id === selectedJobId) || null;

  // Коли клікаємо на Card, також скролимо список
  useEffect(() => {
    if (selectedJob) {
      listRefs.current[selectedJob._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedJob]);

  return (
    <MapContainer
      center={CENTER_OF_UKRAINE}
      zoom={SCALE.COUNTRY}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {jobs.map((job: Job) => {
        return (
          <Marker
            key={job._id}
            position={job.coordinates}
            eventHandlers={{
              click: () => onSelect(job._id),
            }}
          >
            <Tooltip permanent direction='right'>{job.title}</Tooltip>
          </Marker>
        );
      })}
      <FlyTo coords={selectedJob ? selectedJob.coordinates : null} />
    </MapContainer>
  );
}
