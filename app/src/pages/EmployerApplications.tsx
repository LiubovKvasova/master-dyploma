import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type EmployerApplicationsProps = {
  user: {
    role: string;
  };
};

export function EmployerApplications({ user }: EmployerApplicationsProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const fetchApplications = async () => {
    const res = await apiFetch('/applications');
    if (res.ok) {
      const data = await res.json();
      setJobs(data);
    } else {
      alert('Не вдалося отримати дані заявок');
    }
  };

  useEffect(() => {
    if (user?.role !== 'employer') {
      return;
    }

    fetchApplications();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'employer') {
    return <Navigate to="/applications" replace />;
  }

  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const getLastMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Заявки на ваші оголошення</h1>

      {jobs.length === 0 && (
        <p className="text-gray-500 italic">Поки що немає створених оголошень або заявок.</p>
      )}

      {jobs.map((job) => (
        <Card key={job._id} className="m-2 hover:bg-muted/30 cursor-pointer transition-colors relative">
          <CardHeader
            className="flex flex-row justify-between items-center cursor-pointer"
            onClick={() => toggleExpand(job._id)}
          >
            <div>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <p className="text-sm">{job.description}</p>
            </div>
            {expandedJobs[job._id] ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>

          <div className={cn(
            'transition-[max-height,opacity] ease-in-out overflow-hidden',
             expandedJobs[job._id] ?
              'max-h-[1000px] opacity-100 duration-500' :
              'max-h-0 opacity-0 duration-300'
          )}>
            <CardContent className="flex flex-col gap-3 border-t pt-3">
              {job.applications.length === 0 && (
                <p className="text-gray-500 italic">Наразі ніхто не подав заявку.</p>
              )}

              {job.applications.map((app: any) => {
                const lastMessage = getLastMessage(app.messages);
                const lastEventDate = lastMessage
                  ? new Date(lastMessage.timestamp)
                  : new Date(app.createdAt);

                return (
                  <div
                    key={app._id}
                    className="flex justify-between items-start border rounded-md p-3 hover:bg-muted/20 transition cursor-pointer"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {app.workerData?.username || 'Невідомий користувач'}
                      </p>
                      <p className="text-sm mt-1">
                        {lastMessage ? (
                          <>
                            <span className="font-semibold">
                              {lastMessage.sender === app.workerId
                                ? app.workerData?.username || 'Працівник'
                                : 'Ви'}
                              :
                            </span>{' '}
                            {lastMessage.content}
                          </>
                        ) : (
                          <span className="italic">Без повідомлень</span>
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(lastEventDate), {
                        addSuffix: true,
                        locale: uk,
                      })}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
