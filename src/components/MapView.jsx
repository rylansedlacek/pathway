/**
 * @author Rylan 
 * Displays the Map on the Home Screen, will soon be depreacted.
 */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// helper to update map center
function SetMapCenter({ coords }) { 
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13); // dont ask why this works
  }, [coords, map]);
  return null;
}

export default function MapView({ route }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => { // this geo locates the user to show map
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn('Geolocation error:', err)
    );
  }, []);

  const center = route?.[0] || userLocation || [40.73061, -73.935242]; // defaults to NYC, if no local

  return (
    <MapContainer center={center} zoom={13} className="h-96 w-full"> 
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && <Marker position={userLocation} />}
      {route && (
        <>
          <Polyline positions={route} color="blue" /> {/* Draws */}
          <Marker position={route[0]} />
        </>
      )}
      <SetMapCenter coords={center} />
    </MapContainer>
  );
}
