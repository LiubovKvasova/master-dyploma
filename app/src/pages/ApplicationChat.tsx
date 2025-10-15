import { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type ApplicationChatProps = {
  user: {
    id: string;
    role: string;
  };
};

export function ApplicationChat({ user }: ApplicationChatProps) {
  const { applicationId } = useParams();
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [agreeLoading, setAgreeLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    const res = await apiFetch(`/applications/messages/${applicationId}`);
    if (res.ok) {
      const data = await res.json();
      setApplication(data);
    } else {
      alert('Не вдалося отримати повідомлення');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [applicationId]);

  // автопрокрутка донизу після кожного оновлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [application?.messages?.length]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSend = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const res = await apiFetch(`/applications/messages/${applicationId}`, {
      method: 'POST',
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      await fetchMessages();
    } else {
      alert('Не вдалося відправити повідомлення');
    }
  };

  const handleAgree = async () => {
    setAgreeLoading(true);
    const res = await apiFetch(`/applications/agree/${applicationId}`, {
      method: 'PATCH',
    });
    setAgreeLoading(false);

    if (res.ok) {
      await fetchMessages();
    } else {
      alert('Не вдалося погодитись на співпрацю');
    }
  };

  if (loading) {
    return <p>Завантаження...</p>;
  }

  if (!application) {
    return <p>Заявку не знайдено</p>;
  }

  const addressee = (user.role === 'employer') ?
    application?.workerId :
    application?.employerId;

  const addresseeName = addressee?.username;
  const addresseeId = addressee?._id;

  const hasAgreed = (user.role === 'employer') ?
    application.employerAgreed :
    application.workerAgreed;

  return (
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto p-4">
      {/* Верхній блок з кнопкою "До всіх" */}
      <div className="flex items-center mb-4">
        <Link
          to={user.role === 'employer' ? '/employer-applications' : '/applications'}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          До всіх
        </Link>
      </div>

      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-semibold mb-2">
          {application.jobId?.title} — {' '}
          <Link
            to={`/user-info/${addresseeId}`}
            className="hover:text-blue-400 transition-colors"
          >
            {addresseeName}
          </Link>
        </h2>

        {application.status === 'in_progress' ? (
          <p className="text-green-600 font-medium mb-2">
            ✅ Співпраця розпочата
          </p>
        ) : application.status === 'closed' ? (
          <p className="text-green-700 font-medium mb-2">
            ✅ Діяльність завершено успішно
          </p>
        ) : application.status === 'failed' ? (
          <p className="text-red-600 font-medium mb-2">
            ❌ Діяльність завершено з провалом
          </p>
        ) : (
          <div className="mb-3">
            <Button
              onClick={handleAgree}
              disabled={hasAgreed || agreeLoading}
              variant={hasAgreed ? 'ghost' : 'default'}
            >
              {hasAgreed
                ? 'Ви погодились на співпрацю'
                : agreeLoading
                ? 'Обробка...'
                : 'Погодитись на співпрацю'}
            </Button>
          </div>
        )}
      </div>

      <Card className="flex-1 overflow-y-auto p-3 space-y-3">
        {application.messages.length === 0 && (
          <p className="text-center text-muted-foreground italic">
            Повідомлень поки що немає
          </p>
        )}

        {application.messages.map((msg: any) => {
          const isOwn = msg.sender === user.id;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  isOwn
                    ? 'bg-blue-500 text-white self-end'
                    : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {new Date(msg.timestamp).toLocaleString('uk-UA')}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </Card>

      {/* поле вводу */}
      <div className="flex mt-3 gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введіть повідомлення..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Надіслати</Button>
      </div>
    </div>
  );
}
