import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleCloseJob = async (applicationId: string, reopen = false) => {
    const route = reopen
      ? `/applications/fail/${applicationId}`
      : `/applications/close/${applicationId}`;
    const res = await apiFetch(route, { method: 'PATCH' });

    if (res.ok) {
      setDialogOpen(false);
      setSelectedApplication(null);
      await fetchApplications();
    } else {
      alert('Не вдалося оновити статус діяльності');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Заявки на ваші оголошення</h1>

      {jobs.length === 0 && (
        <p className="text-gray-500 italic">Поки що немає створених оголошень або заявок.</p>
      )}

      {jobs.map((job) => (
        <Card
          key={job._id}
          className="m-2 hover:bg-muted/30 cursor-pointer transition-colors relative"
        >
          <CardHeader className="flex flex-row justify-between items-center cursor-pointer">
            <div onClick={() => toggleExpand(job._id)}>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <p className="text-sm">{job.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {job.status === 'in_progress' && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-100"
                  onClick={() => {
                    const appInProgress = job.applications.find(
                      (a: any) => a.status === 'in_progress'
                    );
                    if (appInProgress) {
                      setSelectedApplication(appInProgress);
                      setDialogOpen(true);
                    }
                  }}
                >
                  Завершити діяльність
                </Button>
              )}

              {job.status === 'closed' && (
                <Button variant="outline" disabled className="text-red-500 border-red-500">
                  Роботу завершено
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleExpand(job._id)}
              >
                {expandedJobs[job._id] ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </CardHeader>

          <div
            className={cn(
              'transition-[max-height,opacity] ease-in-out overflow-hidden',
              expandedJobs[job._id]
                ? 'max-h-[1000px] opacity-100 duration-500'
                : 'max-h-0 opacity-0 duration-300'
            )}
          >
            <CardContent className="flex flex-col gap-3 border-t pt-3">
              {job.applications.length === 0 && (
                <p className="text-gray-500 italic">Наразі ніхто не подав заявку.</p>
              )}

              {job.applications.map((app: any) => {
                const lastMessage = getLastMessage(app.messages);
                const lastEventDate = lastMessage
                  ? new Date(lastMessage.timestamp)
                  : new Date(app.createdAt);

                const statusLabel =
                  app.status === 'in_progress'
                    ? '✅ Співпраця розпочата'
                    : app.status === 'closed'
                    ? '✅ Діяльність завершено успішно'
                    : app.status === 'failed'
                    ? '❌ Діяльність завершено з провалом'
                    : null;

                const username = (app.workerData) ?
                  `${app.workerData.fullname} (${app.workerData.username})` :
                  'Невідомий користувач';

                return (
                  <div
                    key={app._id}
                    className="flex justify-between items-start border rounded-md p-3 hover:bg-muted/20 transition cursor-pointer"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {username}
                      </p>

                      <div className="text-sm mt-1">
                        {statusLabel ? (
                          <p
                            className={cn(
                              'font-medium',
                              app.status === 'failed' && 'text-red-600',
                              app.status === 'closed' && 'text-green-600'
                            )}
                          >
                            {statusLabel}
                          </p>
                        ) : lastMessage ? (
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
                      </div>
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

      {/* Діалог завершення діяльності */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершення діяльності</DialogTitle>
            <DialogDescription>
              Чи була робота задовільною?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-between">
            <Button
              variant="default"
              onClick={() => handleCloseJob(selectedApplication._id, false)}
            >
              Так, закрити оголошення
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleCloseJob(selectedApplication._id, true)}
            >
              Ні, перевідкрити оголошення
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
