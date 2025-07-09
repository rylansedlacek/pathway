import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import startFlag from '../assets/start.png';
import checkeredFlag from '../assets/finish.png';

function SetMapCenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.length) map.setView(coords[0], 13);
  }, [coords, map]);
  return null;
}

// Icons FIXME
const startIcon = new L.Icon({
  iconUrl: startFlag,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Icons 
const endIcon = new L.Icon({
  iconUrl: checkeredFlag,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function MapView({ route }) {
  const [userLocation, setUserLocation] = useState(null);

  // Locates
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn('Geolocation error:', err)
    );
  }, []);

  const center = route?.[0] || userLocation || [38.3004, -77.4588];

  // Returns the map and the draw on route we generate
  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-80 w-full rounded border border-gray-300 shadow"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && <Marker position={userLocation} />}
      {route && (
        <>
          <Polyline positions={route} color="blue" />
          <Marker position={route[route.length - 1]} icon={endIcon} />
        </>
      )}
      <SetMapCenter coords={route} />
    </MapContainer>
  );
}
