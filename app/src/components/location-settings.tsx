import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPicker } from '@/components/map-picker';
import { geoFetch } from '@/lib/api';
import { ADDRESS_FIELDS } from '@/lib/constants';
import { filterObjectKeys } from '@/lib/utils';

type LocationSettingsProps = {
  user: any;
  onChange: (data: { coordinates: [number, number]; address: any }) => void;
};

export function LocationSettings({ user, onChange }: LocationSettingsProps) {
  const [coords, setCoords] = useState<[number, number] | undefined>(
    user?.coordinates?.length ? user.coordinates : undefined,
  );

  const [address, setAddress] = useState<any>(
    user?.address ?? {
      city: '',
      road: '',
      house_number: '',
      building: '',
      amenity: '',
    },
  );

  const handleSelect = async (coordinates: [number, number]) => {
    setCoords(coordinates);
    const [lat, lon] = coordinates;
    const result = await geoFetch(lat, lon);

    if (result) {
      const filtered = filterObjectKeys(result, ADDRESS_FIELDS);
      setAddress(filtered);
      onChange({ coordinates, address: { ...address, ...filtered } });
    }
  };

  const handleChange = (key: string, value: string) => {
    const updated = { ...address, [key]: value };
    setAddress(updated);
    if (coords) onChange({ coordinates: coords, address: updated });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* LEFT — Address Form */}
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="city">Місто *</Label>
          <Input
            id="city"
            value={address.city ?? ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Наприклад, Київ"
            required
          />
        </div>

        <div>
          <Label htmlFor="road">Вулиця *</Label>
          <Input
            id="road"
            value={address.road ?? ''}
            onChange={(e) => handleChange('road', e.target.value)}
            placeholder="Наприклад, Хрещатик"
            required
          />
        </div>


        <div>
          <Label htmlFor="house_number">Будинок</Label>
          <Input
            id="house_number"
            value={address.house_number ?? ''}
            onChange={(e) => handleChange('house_number', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="building">Корпус / Будівля</Label>
          <Input
            id="building"
            value={address.building ?? ''}
            onChange={(e) => handleChange('building', e.target.value)}
          />
        </div>


        <div>
          <Label htmlFor="amenity">Орієнтир / Заклад</Label>
          <Input
            id="amenity"
            value={address.amenity ?? ''}
            onChange={(e) => handleChange('amenity', e.target.value)}
            placeholder="Наприклад, ТРЦ Gulliver"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          * Обов’язкові поля для заповнення
        </div>
      </div>

      {/* RIGHT — Map */}
      <div className="rounded-lg overflow-hidden border shadow-sm">
        <MapPicker
          onSelect={handleSelect}
          coords={coords}
          style={{ width: '100%', height: '60vh' }}
        />
      </div>
    </div>
  );
}
