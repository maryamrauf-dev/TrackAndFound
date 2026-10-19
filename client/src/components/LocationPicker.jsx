import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAMPUS } from '../config.js';

const icon = L.divIcon({
  className: '',
  html: '<span class="pin pin-pick"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function Clicker({ onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  return (
    <MapContainer center={[CAMPUS.lat, CAMPUS.lng]} zoom={16} className="map map-small">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Clicker onPick={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={icon} />}
    </MapContainer>
  );
}
