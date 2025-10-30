import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  User,
  Mail,
  Star,
  Shield,
  PhoneIcon,
  Briefcase,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { formatDuration } from '@/lib/language';
import { getCategoryName, stringifyAddress } from '@/lib/utils';

type ReviewType = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: {
    _id: string;
    fullname: string;
    username: string;
    rating?: number;
  };
};

type UserInfoType = {
  _id: string;
  username: string;
  email: string;
  phone: string;
  fullname: string;
  role: string;
  rating?: number;
  reviews?: ReviewType[];
  activeJobs?: Job[];
};

export function UserInfo() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [visibleJobs, setVisibleJobs] = useState(5);

  const fetchUser = async () => {
    try {
      const res = await apiFetch(`/users/${userId}`);
      if (!res.ok) throw new Error('Не вдалося отримати інформацію про користувача');
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const handleApply = async (jobId: string) => {
    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        throw new Error('Не вдалося податись на вакансію');
      }

      alert('Ви успішно подались на вакансію!');
      await fetchUser(); // оновити статус вакансій
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Завантаження інформації...
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-[60vh] text-destructive">{error}</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Користувача не знайдено
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      {/* Основна інформація */}
      <Card className="w-full max-w-2xl shadow-md border">
        <CardHeader className="flex flex-col items-center text-center">
          <User className="w-12 h-12 text-primary mb-2" />
          <CardTitle className="text-xl font-semibold">
            {user.fullname} ({user.username})
          </CardTitle>
          <p className="text-sm text-muted-foreground">ID: {userId}</p>
        </CardHeader>

        <CardContent className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-muted-foreground" />
            <span>{user.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="capitalize">
              {user.role === 'worker'
                ? 'Працівник'
                : user.role === 'employer'
                ? 'Роботодавець'
                : user.role}
            </span>
          </div>

          {typeof user.rating === 'number' && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span>{user.rating.toFixed(1)} / 5</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Відгуки */}
      {user.reviews && user.reviews.length > 0 && (
        <Card className="w-full max-w-2xl shadow-sm border">
          <CardHeader className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>Відгуки ({user.reviews.length})</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {user.reviews.slice(0, visibleReviews).map((rev) => (
              <div key={rev._id} className="border-b pb-2 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{rev.author.fullname}</div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    {rev.rating}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rev.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(rev.createdAt), 'd MMMM yyyy', { locale: uk })}
                </p>
              </div>
            ))}

            {visibleReviews < user.reviews.length && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleReviews((v) => v + 5)}
                >
                  Показати більше
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Активні вакансії */}
      {user.activeJobs && user.activeJobs.length > 0 && (
        <Card className="w-full max-w-2xl shadow-sm border">
          <CardHeader className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <CardTitle>Активні вакансії ({user.activeJobs.length})</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4">
            {user.activeJobs.slice(0, visibleJobs).map((job) => (
              <Card key={job._id}>
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

                  {job.duration && (
                    <p className="mb-1">
                      <strong>Тривалість:</strong>
                      <span className="ml-1">{formatDuration(job.duration)}</span>
                    </p>
                  )}

                  {job.address && (
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{stringifyAddress(job.address)}</span>
                    </div>
                  )}

                  <div className="mt-4">
                    {job.hasApplied ? (
                      <Button className="w-full" disabled variant="secondary">
                        Ви уже відгукнулись
                      </Button>
                    ) : (
                      <Button
                        className="w-full cursor-pointer"
                        onClick={() => handleApply(job._id)}
                        disabled={!job._id}
                      >
                        Відгукнутись на вакансію
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {visibleJobs < user.activeJobs.length && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleJobs((v) => v + 5)}
                >
                  Показати більше
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
