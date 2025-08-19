import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

type MapProps = {
  onSelect: (coords: [number, number]) => void;
  coords?: [number, number];
};

function LocationMarker({ onSelect, coords }: MapProps) {
  const [position, setPosition] = useState<[number, number] | undefined>(coords);

  useMapEvents({
    click(e: any) {
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

export const MapPicker = ({ onSelect, coords }: MapProps) => {
  const mapCenter = coords ?? [50.4501, 30.5234];
  const zoom = (coords) ? 15 : 6;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onSelect={onSelect} coords={coords} />
    </MapContainer>
  );
}
