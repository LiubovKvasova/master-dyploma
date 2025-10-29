import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { LocationSettings } from '@/components/location-settings';
import { ReorderableList } from '@/components/reorderable-list';
import { apiFetch } from '@/lib/api';
import { JOB_CATEGORIES, DEFAULT_PREFERENCE_ORDER, PREFERENCE_LABELS } from '@/lib/constants';
import { updateUser } from '@/lib/storageHelper';

export function OnboardingFlow({ user, setUser }: { user: any, setUser: any }) {
  const existingLocationData: any = {};

  if (user?.coordinates?.length && user?.address) {
    existingLocationData.coordinates = user.coordinates;
    existingLocationData.address = user.address;
  }

  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<any>(existingLocationData);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCE_ORDER);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (step === 1 && !selectedCategories.length)
      return alert('Оберіть хоча б одну категорію');
    if (step === 2 && (!locationData.coordinates || !locationData.address))
      return alert('Оберіть місце розташування');
    if (step < 3) setStep(step + 1);
    else await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setSaving(true);
    const res = await apiFetch('/users/onboarding', {
      method: 'PUT',
      body: JSON.stringify({
        interestedCategories: selectedCategories,
        coordinates: locationData.coordinates,
        address: locationData.address,
        preferenceOrder: preferences,
        introduced: true,
      }),
    });

    if (res.ok) {
      alert('Успішно пройдено!');
      const newUser = await res.json();
      await updateUser(newUser);
      setUser((oldValue: any) => ({ ...oldValue, ...newUser }));
    } else {
      alert('Помилка збереження');
    }
    setSaving(false);
  };

  return (
    <Card className="max-w-4xl mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {step === 1 && 'Обери категорії, які тебе цікавлять'}
          {step === 2 && 'Обери своє місцезнаходження, щоб знайти роботу поруч'}
          {step === 3 && 'Розстав пріоритетність щодо критеріїв робіт (перше - найбільш важливе)'}
        </CardTitle>
      </CardHeader>
      <Separator className="mb-4" />

      <CardContent>
        {step === 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                className="cursor-pointer text-base px-3 py-1"
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat.value)
                      ? prev.filter((c) => c !== cat.value)
                      : [...prev, cat.value],
                  )
                }
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        )}

        {step === 2 && (
          <LocationSettings user={user} onChange={(data) => setLocationData(data)} />
        )}

        {step === 3 && (
          <div>
            <h3 className="text-center mb-3 font-semibold">Пріоритетність критеріїв</h3>
            <ReorderableList items={preferences} setItems={setPreferences} labels={PREFERENCE_LABELS} />
          </div>
        )}
      </CardContent>

      <div className="flex justify-end mt-4">
        <Button onClick={handleNext} disabled={saving}>
          {saving ? 'Збереження...' : step < 3 ? 'Далі' : 'Завершити'}
        </Button>
      </div>
    </Card>
  );
}
