/**
 * @author Rylan 
 * Sets location and make the route show on the map.
 */

import { useState } from 'react';

export default function RouteForm({ onSubmit }) {
  const [start, setStart] = useState('');
  const [distance, setDistance] = useState('');
  const [type, setType] = useState('loop');
  const [error, setError] = useState(null);

  // geocodes the address provided, aka starting point
  const geocodeAddress = async (address) => {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`; // soon to be changed to custom server

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Pathway/1.0' }
    });

    if (!res.ok) throw new Error('Geocoding failed'); // oh no

    const data = await res.json();
    if (data.length === 0) throw new Error('Location not found');

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  // Generate pressed
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const coords = await geocodeAddress(start);
      onSubmit({
        startCoords: [coords.lat, coords.lon],
        distance,
        type,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Form will be better 
  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4">
      <input
        type="text"
        placeholder="Starting Point"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="number"
        placeholder="Distance (miles)"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        className="border p-2 w-full"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="loop">Loop</option>
        <option value="out-and-back">Out and Back</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Generate Route
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
