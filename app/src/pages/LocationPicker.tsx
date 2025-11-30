import { useState } from 'react';
import type { Dispatch } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { LocationSettings } from '@/components/location-settings';
import { apiFetch } from '@/lib/api';
import { updateUser } from '@/lib/storageHelper';
import { filterObjectKeys } from '@/lib/utils';
import { ADDRESS_FIELDS } from '@/lib/constants';

export const LocationPicker = ({ user, setUser }: { user: any, setUser: Dispatch<any> }) => {
  const userCoordinates = user?.coordinates?.length > 0 ? user.coordinates : null;
  const [coords, setCoords] = useState<[number, number] | undefined>(userCoordinates);
  const [address, setAddress] = useState<any>(user?.address);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = async (
    { coordinates, address }: { coordinates: [number, number], address: any }
  ) => {
    setCoords(coordinates);
    setAddress(address);
  }

  const handleSave = async () => {
    if (!coords || !address) {
      return alert('Оберіть місце на карті!');
    }

    const filteredAddress = filterObjectKeys(address, ADDRESS_FIELDS);
    const result = await apiFetch('/users/update/location', {
      method: 'PUT',
      body: JSON.stringify({ coordinates: coords, address: filteredAddress }),
    });

    if (result?.ok) {
      const newUser = await result.json();
      await updateUser(newUser);
      setUser((oldValue: object) => ({...oldValue, ...newUser}));

      alert('Локацію збережено!');
    } else {
      alert('Помилка збереження');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Налаштування розміщення</h1>
      <LocationSettings
        user={user}
        onChange={handleSelect} />

      <Button onClick={handleSave}>
        Зберегти локацію
      </Button>
    </div>
  );
}
