import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from 'leaflet';

interface TourLearnplace {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
  title: string;
  visited: boolean;
}

interface TourMapProps {
  learnplaces: TourLearnplace[];
}

function FitBounds({ learnplaces }: { learnplaces: TourLearnplace[] }) {
  const map = useMap();

  useEffect(() => {
    if (learnplaces.length === 0) return;
    const bounds = L.latLngBounds(learnplaces.map(lp => [lp.latitude, lp.longitude]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map, learnplaces]);

  return null;
}

export function MapTourThumbnail({ learnplaces }: TourMapProps) {
  return (
    <div className="tour-map-wrapper" style={{ position: 'relative', width: '100%', height: 'auto', zIndex: 1 }}>
      <MapContainer
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "8px",
          cursor: 'pointer' // Zeigt an, dass die Karte klickbar ist
        }}
      >
        <FitBounds learnplaces={learnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
        {learnplaces.map((lp) => (
          <div key={lp.id}>
            <Circle
              center={[lp.latitude, lp.longitude]}
              radius={lp.radius}
              color={lp.visited ? "#4caf50" : "#34499A"}
              fillOpacity={0.2}
              interactive={false}
            />
            <CircleMarker
              center={[lp.latitude, lp.longitude]}
              radius={6}
              color={lp.visited ? "#2e7d32" : "#1a237e"}
              fillOpacity={1}
              interactive={false}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
