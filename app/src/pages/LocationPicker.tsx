import { useState } from 'react';
import type { Dispatch } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { MapPicker } from '@/components/map-picker';
import { apiFetch } from '@/lib/api';
import { updateUser } from '@/lib/storageHelper';
import { filterObjectKeys } from '@/lib/utils';
import { ADDRESS_FIELDS } from '@/lib/constants';

export const LocationPicker = ({ user, setUser }: { user: any, setUser: Dispatch<any> }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [coords, setCoords] = useState<[number, number] | undefined>(user?.coordinates);
  const [address, setAddress] = useState<any>(user?.address);

  const handleSelect = async (coordinates: [number, number]) => {
    setCoords(coordinates);

    const [lat, lon] = coordinates;
    const result = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=uk`);

    if (result?.ok) {
      const response = await result.json();
      setAddress(response.address);
    }
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
      setUser((oldValue: object) => Object.assign(oldValue, newUser));

      alert('Локацію збережено!');
    } else {
      alert('Помилка збереження');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Налаштування розміщення</h1>
      <MapPicker onSelect={handleSelect} coords={coords} />

      <p>{coords?.join(', ')}</p>

      {
        address && Object.entries(address).map(
          ([key, value]) => <p key={key}>{key}: {value as any}</p>
        )
      }

      <Button
        onClick={handleSave}
        // className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Зберегти локацію
      </Button>
    </div>
  );
}
