import { useState } from 'react';

export default function RouteForm({ onSubmit }) {
  const [start, setStart] = useState('');
  const [distance, setDistance] = useState('');
  const [type, setType] = useState('loop');
  const [error, setError] = useState(null);

  // Takes the provided address and geo locates it 
  const geocodeAddress = async (address) => {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Pathway/1.0' },
    });

    // Codes it 
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (data.length === 0) throw new Error('Location not found');

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  // Submits
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

  // The form that we generate routes with
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded shadow p-4">
      <input
        type="text"
        placeholder="Starting Point"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Distance (miles)"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="loop">Loop</option>
        <option value="out-and-back">Out and Back</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
      >
        Generate Routes
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </form>
  );
}
