import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';

import { apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

type ApplicationsListProps = {
  user: {
    id: string;
    role: string;
  };
};

export function ApplicationsList({ user }: ApplicationsListProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      const res = await apiFetch('/applications');

      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      } else {
        alert('Не вдалося отримати список заявок');
      }

      setLoading(false);
    };

    fetchApplications();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'worker') {
    return <Navigate to="/employer-applications" replace />;
  }

  if (loading) {
    return <p>Завантаження...</p>;
  }

  if (!applications.length) {
    return <p>У вас поки що немає поданих заявок</p>;
  }

  return (
    <div className="flex flex-col gap-2 max-w-3xl mx-auto p-4">
      {applications.map((app) => {
        const lastMessage = app.messages[app.messages.length - 1];
        const messageSender = (lastMessage?.sender?._id === user.id) ?
          'Ви' : lastMessage?.sender?.username;

        const displayMessage = lastMessage
          ? `${messageSender}: ${lastMessage.content}`
          : <i>Ви подали заявку</i>;

        const lastEventDate = lastMessage
          ? new Date(lastMessage.timestamp)
          : new Date(app.createdAt);

        return (
          <Card
            key={app._id}
            onClick={() => navigate(`/applications/${app._id}`)}
            className="p-3 hover:bg-muted/30 cursor-pointer transition-colors relative"
          >
            <CardContent className="p-0">
              {/* Верхній рядок */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {app.jobId?.owner?.username || 'Невідомий'} — {app.jobId?.title}
                  </p>

                  {app.status === 'in_progress' ? (
                    <p className="text-sm text-green-600">
                      ✅ Співпраця розпочата
                    </p>
                  ) : app.status === 'closed' ? (
                    <p className="text-sm text-green-700">
                      ✅ Діяльність завершено успішно
                    </p>
                  ) : app.status === 'failed' ? (
                    <p className="text-sm text-red-600">
                      ❌ Діяльність завершено з провалом
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground truncate">
                      {displayMessage}
                    </p>
                  )}
                </div>

                {/* Дата */}
                <p className="text-xs text-muted-foreground ml-3 whitespace-nowrap">
                  {formatDistanceToNow(lastEventDate, {
                    addSuffix: true,
                    locale: uk
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
