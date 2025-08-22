import { useState } from 'react';
import type { Dispatch } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { MapPicker } from '@/components/map-picker';
import { apiFetch, geoFetch } from '@/lib/api';
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
    const result = await geoFetch(lat, lon);

    if (result) {
      setAddress(result);
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
      setUser((oldValue: object) => ({...oldValue, ...newUser}));

      alert('Локацію збережено!');
    } else {
      alert('Помилка збереження');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Налаштування розміщення</h1>
      <MapPicker onSelect={handleSelect} coords={coords}
        style={{ minHeight: "300px", height: "60vh", width: "100%" }} />

      <p>{coords?.join(', ')}</p>

      {
        address && Object.entries(address).map(
          ([key, value]) => <p key={key}>{key}: {value as any}</p>
        )
      }

      <Button onClick={handleSave}>
        Зберегти локацію
      </Button>
    </div>
  );
}
