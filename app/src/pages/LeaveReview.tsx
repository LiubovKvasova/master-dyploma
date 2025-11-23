import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

type Review = {
  _id: string;
  rating: number;
  comment?: string;
}

type Person = {
  _id: string;
  fullname: string;
  username: string;
  email: string;

  review?: Review;
};

type LeaveReviewProps = {
  user: {
    id: string;
    role: string;
  };
};

export function LeaveReview({ user }: LeaveReviewProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReview, setOpenReview] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPeople = async () => {
    setLoading(true);
    const res = await apiFetch('/reviews/people-to-review');

    if (res.ok) {
      const data = await res.json();
      setPeople(data);
    } else {
      alert('Не вдалося отримати список людей для оцінки');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchPeople();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (personId: string) => {
    if (!rating) {
      alert('Будь ласка, оберіть оцінку від 1 до 5');
      return;
    }

    setSubmitting(true);
    let res: Response;

    if (reviewId) {
      res = await apiFetch(`/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rating, comment }),
      });
    } else {
      res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          targetId: personId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
    }

    if (res.ok) {
      alert('Відгук успішно надіслано!');
      await fetchPeople();
      setOpenReview(null);
      setRating(0);
      setComment('');
      setReviewId(null);
    } else {
      alert('Не вдалося надіслати відгук');
    }

    setSubmitting(false);
  };

  const editButtonHandler = (personId: string, review?: Review) => {
    setOpenReview((prev) => {
      const isDialogOpen = prev === personId;
      const clearExistingReview = (isDialogOpen || !review);

      setRating((clearExistingReview) ? 0 : review.rating);
      setComment((clearExistingReview) ? '' : review.comment ?? '');
      setReviewId((clearExistingReview) ? null : review._id);

      return isDialogOpen ? null : personId;
    });
  }

  if (loading) {
    return <p className="text-center mt-6">Завантаження...</p>;
  }

  if (!people.length) {
    return <p className="text-center mt-6">Немає користувачів, яким можна залишити відгук</p>;
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2 text-center">Лишити відгук</h1>

      {people.map((person) => (
        <Card key={person._id} className="p-3">
          <CardContent className="p-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{person.fullname}</p>
                <p className="text-sm text-muted-foreground">@{person.username}</p>
              </div>

              <Button
                variant="secondary"
                onClick={() => editButtonHandler(person._id, person.review)}
              >
                {openReview === person._id ?
                  'Скасувати' :
                  person.review ?
                    'Редагувати' :
                    'Лишити коментар'}
              </Button>
            </div>

            {person.review && (
              <div className={cn(
                'mt-3 p-3 bg-muted rounded-xl text-sm',
                'transition-all ease-in-out duration-500 overflow-hidden',
                openReview === person._id ? 'max-h-0 opacity-0 p-0 m-0' : 'max-h-[500px] opacity-100 mt-3'
              )}>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i <= (person.review?.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }
                    />
                  ))}
                </div>
                {person.review.comment ? (
                  <p className="italic text-muted-foreground">{person.review.comment}</p>
                ) : (
                  <p className="text-muted-foreground">Без коментаря</p>
                )}
              </div>
            )}

            {/* Анімована секція */}
            <div
              className={cn(
                'review-panel transition-all ease-in-out duration-500 overflow-hidden',
                openReview === person._id ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
              )}
            >
              <div className="flex gap-1 mb-3 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={cn(
                      'cursor-pointer transition-colors duration-500',
                      (hoverRating || rating) >= star ?
                        'text-yellow-400 fill-yellow-400' :
                        'text-gray-400'
                    )}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <label className="block text-sm mb-1 text-muted-foreground">
                Коментар (необов’язкове поле)
              </label>
              <Textarea
                placeholder="Ваш коментар..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-3"
              />

              <Button
                onClick={() => handleSubmit(person._id)}
                disabled={submitting}
              >
                {submitting ? 'Надсилання...' : 'Надіслати'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
