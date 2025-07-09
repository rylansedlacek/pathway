import { useState } from 'react';
import RouteForm from './components/RouteForm';
import MapView from './components/MapView';

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(null);

  // To generate loops
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
 
  // Random route names, will make these more location specific FIXME
  const generateRouteName = () => {
    const adjectives = ['Riverside', 'Colonial', 'Wooded', 'Echo', 'Fox Hollow', 'Millstone'];
    const nouns = ['Trail', 'Loop', 'Run', 'Path', 'Circuit', 'Track'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  // Generate the actual route, complex
  const generateRoute = async ({ startCoords, distance, type }) => {
    const [lat, lon] = startCoords;
    const dist = parseFloat(distance) * 0.43;
    const generatedRoutes = [];

    for (let i = 0; i < 10; i++) {
      const bearing1 = Math.random() * 360;
      const bearing2 = (bearing1 + 120 + Math.random() * 60) % 360;

      const [wp1Lat, wp1Lon] = offsetCoordinates(lat, lon, dist * 0.4, bearing1);
      const [wp2Lat, wp2Lon] = offsetCoordinates(lat, lon, dist * 0.4, bearing2);

      let coordsStr =
        type === 'loop'
          ? `${lon},${lat};${wp1Lon},${wp1Lat};${wp2Lon},${wp2Lat};${lon},${lat}`
          : `${lon},${lat};${wp1Lon},${wp1Lat}`;

          // Temp DOCKER link
      const url = `http://localhost:5001/route/v1/foot/${coordsStr}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok') {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const finalCoords =
            type === 'out-and-back' ? [...coords, ...[...coords].reverse().slice(1)] : coords;

          generatedRoutes.push({
            name: generateRouteName(),
            coords: finalCoords,
            type,
            distance: (data.routes[0].distance / 1609).toFixed(2),
          });
        }
      } catch (err) {
        console.warn(`Route ${i + 1} failed: ${err.message}`);
      }
    }

    setRoutes(generatedRoutes);
    setActiveRouteIndex(0);
  };

  // The homepage... FIXME for Computer 
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold text-blue-600 mb-6">Pathway</h1>
      <div className="w-full px-4 md:px-12 lg:px-100">
        <RouteForm onSubmit={generateRoute} />
        <div className="mt-6 grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="space-y-2">
            {routes.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRouteIndex(i)}
                className={`w-full text-left p-3 rounded border transition ${
                  i === activeRouteIndex
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
