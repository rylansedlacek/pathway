/**
 * @author Rylan 
 * Main Page
 */

import { useState } from 'react';
import RouteForm from './components/RouteForm';
import MapView from './components/MapView';

export default function App() {
  const [route, setRoute] = useState(null);

  const generateRoute = async ({ startCoords, distance, type }) => {
    const [lat, lon] = startCoords;

    // create a rough endpoint 
    const offset = (parseFloat(distance) / 69) / 2; // ~69 miles per degree dont ask me why this wroks
    const endLat = lat + offset;
    const endLon = lon + offset;

    // use OSRM's demo server to get a walking route, but soon will use custom docker
    const url = `https://router.project-osrm.org/route/v1/foot/${lon},${lat};${endLon},${endLat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 'Ok') throw new Error('No route found');

      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]); // flip for leaflet
      if (type === 'out-and-back') {
        const reversed = [...coords].reverse().slice(1); // avoid duplicate points
        setRoute([...coords, ...reversed]);
      } else {
        setRoute(coords); // TODO just show the one-way route
      }
    } catch (err) {
      alert('Routing error: ' + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pathway</h1>
      <RouteForm onSubmit={generateRoute} />
      <MapView route={route} />
    </div>
  );
}
