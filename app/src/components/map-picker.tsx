import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, type CSSProperties } from 'react';
import type { LeafletMouseEvent } from 'leaflet';

import { CENTER_OF_UKRAINE, SCALE } from '@/lib/constants';

type MapProps = {
  onSelect: (coords: [number, number]) => void;
  coords?: [number, number];
};

type StyleProp = {
  style: CSSProperties;
};

function LocationMarker({ onSelect, coords }: MapProps) {
  const [position, setPosition] = useState<[number, number] | undefined>(coords);

  useMapEvents({
    click(e: LeafletMouseEvent) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      onSelect(coords);
    },
  });

  if (!position) {
    return null;
  }

  return <Marker position={[position[0], position[1]]}></Marker>;
}

export const MapPicker = ({ onSelect, coords, style }: MapProps & StyleProp) => {
  const mapCenter = coords ?? CENTER_OF_UKRAINE;
  const zoom = (coords) ? SCALE.BUILDING : SCALE.COUNTRY;

  return (
    <MapContainer center={mapCenter} zoom={zoom} style={style}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onSelect={onSelect} coords={coords} />
    </MapContainer>
  );
}
