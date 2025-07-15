import { useState } from 'react';
import RouteForm from './components/RouteForm';
import MapView from './components/MapView';

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(null);

  function offsetCoordinates(lat, lon, distanceMiles, bearingDeg) {
    const R = 3958.8;
    const d = distanceMiles / R;
    const bearing = (bearingDeg * Math.PI) / 180;

    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lon * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );

    return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
  }

  const generateRouteName = () => {
    const adjectives = ['Riverside', 'Colonial', 'Wooded', 'Echo', 'Fox Hollow', 'Millstone'];
    const nouns = ['Trail', 'Loop', 'Run', 'Path', 'Circuit', 'Track'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  const generateRoute = async ({ startCoords, distance, type }) => {
    const [lat, lon] = startCoords;
    const target = parseFloat(distance);
    const radius = type === 'loop' ? target / (2.8 * Math.PI) : target / 2.1;

    let generatedRoutes = [];
    let attempts = 0;

    while (generatedRoutes.length < 5 && attempts < 3) {
      attempts++;
      for (let i = 0; i < 30 && generatedRoutes.length < 10; i++) {
        let coordsStr;

        if (type === 'loop') {
          const wp = [];
          const baseBearing = Math.random() * 360;
          for (let j = 0; j < 4; j++) {
            const bearing = baseBearing + j * 90 + (Math.random() * 10 - 5); 
            wp.push(offsetCoordinates(lat, lon, radius, bearing));
          }
          coordsStr = `${lon},${lat};${wp.map(p => `${p[1]},${p[0]}`).join(';')};${lon},${lat}`;

        } else {
          const bearing = Math.random() * 360;
          const [midLat, midLon] = offsetCoordinates(lat, lon, radius, bearing);
          coordsStr = `${lon},${lat};${midLon},${midLat}`;
        }

        const url = `http://localhost:5001/route/v1/foot/${coordsStr}?overview=full&geometries=geojson`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.code !== 'Ok') continue;

          const miles = data.routes[0].distance / 1609;
          if (miles < target - 0.3 || miles > target + 0.5) continue;

          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const finalCoords =
            type === 'out-and-back'
              ? [...coords, ...[...coords].reverse().slice(1)]
              : coords;

          generatedRoutes.push({
            name: generateRouteName(),
            coords: finalCoords,
            type,
            distance: miles.toFixed(2),
          });

        } catch (err) {
          // continue on error
        }
      }
    }

    setRoutes(generatedRoutes);
    setActiveRouteIndex(0);
  };


  return (
    <div className="min-h-screen w-full max-w-screen-lg mx-auto bg-white text-gray-800 flex flex-col items-center p-4 md:p-8">
      <h1 className="text-2xl md:text-5xl font-bold text-orange-600 mb-6">Aquila</h1>
      <div className="w-full px-4 md:px-12 lg:px-24">
        <RouteForm onSubmit={generateRoute} />
        <div className="mt-6 grid md:grid-cols-[1fr_2fr] gap-6 items-start">
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {routes.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRouteIndex(i)}
                className={`w-full text-left p-3 rounded border transition ${i === activeRouteIndex
                  ? 'bg-blue-100 border-blue-500'
                  : 'border-gray-300 hover:bg-blue-50'
                  }`}
              >
                <div className="font-semibold text-blue-600 text-sm md:text-base">{r.name}</div>
                <div className="text-sm text-gray-600">{r.distance} mi – {r.type}</div>
              </button>
            ))}
          </div>
          <MapView route={routes[activeRouteIndex]?.coords} />
        </div>
      </div>
    </div>
  );
}
