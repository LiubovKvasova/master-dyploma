import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Star, Shield } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type UserInfoType = {
  username: string;
  email: string;
  role: string;
  rating?: number;
};

export function UserInfo() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch(`/users/${userId}`);
        if (!res.ok) {
          throw new Error('Не вдалося отримати інформацію про користувача');
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Завантаження інформації...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-destructive">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Користувача не знайдено
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start p-8">
      <Card className="w-full max-w-md shadow-md border">
        <CardHeader className="flex flex-col items-center text-center">
          <User className="w-12 h-12 text-primary mb-2" />
          <CardTitle className="text-xl font-semibold">{user.username}</CardTitle>
          <p className="text-sm text-muted-foreground">ID: {userId}</p>
        </CardHeader>

        <CardContent className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="capitalize">
              {user.role === 'worker' ? 'Працівник' : user.role === 'employer' ? 'Роботодавець' : user.role}
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
    </div>
  );
}
