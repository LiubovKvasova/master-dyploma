import { useEffect, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import { User, MapPin, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { SCALE } from '@/lib/constants';
import { getCategoryName, stringifyAddress } from '@/lib/utils';
import { formatDuration } from '@/lib/language';

type JobRecommendationsProps = {
  user: {
    role: string;
    coordinates?: [number, number];
  };
};

export function JobRecommendations({ user }: JobRecommendationsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (user?.role !== 'worker') {
    return <Navigate to="/" replace />;
  }

  if (!user.coordinates || user.coordinates.length < 2) {
    return <Navigate to="/location" replace />;
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await apiFetch('/jobs/recommendations');
        if (res.ok) {
          const data = await res.json();
          const [lat, lng] = user.coordinates as [number, number];

          const mapped = data.map((job: any) => {
            const distance = L.latLng(lat, lng).distanceTo(L.latLng(job.coordinates[0], job.coordinates[1]));
            const fullAddress = stringifyAddress(job.address);
            return { ...job, distance, fullAddress };
          });

          setJobs(mapped);
        } else {
          alert('Не вдалося отримати рекомендації по роботах');
        }
      } catch (err) {
        console.error('Помилка при отриманні рекомендацій:', err);
      }
    };

    fetchRecommendations();
  }, [user.coordinates]);

  const handleApply = async (jobId: string) => {
    if (!jobId) return;

    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        alert('Ваша заявка успішно відправлена!');
        setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, hasApplied: true } : j)));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Помилка: ${data.message || 'Не вдалося подати заявку'}`);
      }
    } catch (error) {
      console.error('Помилка при подачі заявки:', error);
      alert('Не вдалося з’єднатися з сервером');
    }
  };

  return (
    <div className="flex gap-6 p-6">
      <div className="w-1/2 overflow-y-auto max-h-[90vh] flex flex-col gap-4">
        <h2 className="text-2xl font-semibold mb-4">Рекомендовані роботи</h2>

        {jobs.map((job) => (
          <div key={job._id} ref={(el) => { listRefs.current[job._id] = el }}>
            <Card
              className={`cursor-pointer transition-colors ${selectedJobId === job._id ? 'border-primary shadow-lg' : ''}`}
              onClick={() => setSelectedJobId(job._id)}
            >
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-gray-600">{job.description}</p>

                <p><strong>Категорія:</strong> {getCategoryName(job.category)}</p>
                <p><strong>Ставка:</strong> {job.hourRate} грн/год</p>
                <p><strong>Тривалість:</strong> {formatDuration(job.duration)}</p>

                {typeof job.distance === 'number' && (
                  <p><strong>Відстань:</strong> {Math.round(job.distance)} м</p>
                )}

                <div className="flex items-center gap-2 mt-3 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{job.fullAddress}</span>
                </div>

                {job.owner && (
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <User className="h-4 w-4" />
                    <Link
                      to={`/user-info/${job.owner._id}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {job.owner.fullname} (рейтинг: {job.owner.rating ?? '—'})
                    </Link>
                  </div>
                )}

                {/* 🧩 приховані деталі score */}
                <details className="mt-3 text-sm text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700 transition-colors">Показати деталі оцінки</summary>
                  <div className="mt-2 space-y-1 pl-2 border-l border-gray-300">
                    <p><strong>Загальний бал:</strong> {job.score?.toFixed(3)}</p>
                    <p><strong>Оцінка зарплати:</strong> {job.salaryScore?.toFixed(3)}</p>
                    <p><strong>Оцінка відстані:</strong> {job.distanceScore?.toFixed(3)}</p>
                    <p><strong>Оцінка категорії:</strong> {job.categoryScore?.toFixed(3)}</p>
                    <p><strong>Оцінка репутації:</strong> {job.reputationScore?.toFixed(3)}</p>
                  </div>
                </details>

                <div className="mt-4">
                  {job.hasApplied ? (
                    <Button className="w-full" disabled variant="secondary">
                      Ви вже відгукнулись
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleApply(job._id)}>
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
        />
      </div>
    </div>
  );
}

function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, SCALE.BUILDING);
  }, [coords, map]);
  return null;
}

function Map({ jobs, userCoords, selectedJobId, onSelect, listRefs }: any) {
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

      <Marker position={userCoords}>
        <Tooltip permanent direction="top">Ви тут</Tooltip>
      </Marker>

      {jobs.map((job: Job) => (
        <Marker
          key={job._id}
          position={job.coordinates}
          eventHandlers={{ click: () => onSelect(job._id) }}
        >
          <Tooltip permanent direction="right">{job.title}</Tooltip>
        </Marker>
      ))}

      <FlyTo coords={selectedJob ? selectedJob.coordinates : null} />
    </MapContainer>
  );
}
