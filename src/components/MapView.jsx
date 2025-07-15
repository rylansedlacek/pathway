import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import startFlag from '../assets/start.png';
import checkeredFlag from '../assets/finish.png';

// Icon setup
const startIcon = new L.Icon({
  iconUrl: startFlag,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const endIcon = new L.Icon({
  iconUrl: checkeredFlag,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Center map on new route
function SetMapCenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.length) map.setView(coords[0], 13);
  }, [coords, map]);
  return null;
}

// Arrow layer using leaflet-polylinedecorator
function RouteArrows({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (!coords?.length) return;

    const arrowLayer = L.polylineDecorator(L.polyline(coords), {
      patterns: [
        {
          offset: 0,
          repeat: 50,
          symbol: L.Symbol.arrowHead({
            pixelSize: 10,
            polygon: false,
            pathOptions: { stroke: true, color: 'white' },
          }),
        },
      ],
    });

    arrowLayer.addTo(map);
    return () => {
      arrowLayer.remove();
    };
  }, [coords, map]);

  return null;
}

export default function MapView({ route }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn('Geolocation error:', err)
    );
  }, []);

  const center = route?.[0] || userLocation || [38.3004, -77.4588];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-[20rem] max-h-[28rem] w-full rounded border border-gray-300 shadow"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && <Marker position={userLocation} />}
      {route && (
        <>
          <Polyline positions={route} color="blue" />
          <Marker position={route[0]} icon={startIcon} />
          <Marker position={route[route.length - 1]} icon={endIcon} />
          <RouteArrows coords={route} />
        </>
      )}
      <SetMapCenter coords={route} />
    </MapContainer>
  );
}
