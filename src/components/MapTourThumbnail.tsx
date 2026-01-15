import { MapContainer, TileLayer, CircleMarker, useMap, Circle } from "react-leaflet";
import { useEffect } from "react";
import L from 'leaflet';

interface TourMapProps {
  title: string;
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

export function MapTourThumbnail({ title, learnplaces }: TourMapProps) {
  return (
    <div className="tour-map-wrapper" style={{ position: 'relative', width: '100%', height: 'auto', zIndex: 1 }}>
      <h2 style={{ marginBottom: '10px', color: 'black', fontSize: '26px' }}>{title}</h2>
      <MapContainer
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "8px",
          cursor: 'pointer'
        }}
      >
        <FitBounds learnplaces={learnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {learnplaces.map((lp) => (
          <div key={lp.id}>
            {/* Optionaler Radius-Kreis für Touren (falls vorhanden) */}
            {lp.radius > 0 && (
              <Circle
                center={[lp.latitude, lp.longitude]}
                radius={lp.radius}
                pathOptions={{
                  color: lp.visited ? "#4caf50" : "#34499A",
                  fillOpacity: 0.2,
                  weight: 2
                }}
                interactive={false}
              />
            )}

            {/* Marker-Punkt */}
            <CircleMarker
              center={[lp.latitude, lp.longitude]}
              radius={6}
              pathOptions={{
                fillColor: lp.visited ? "#2e7d32" : "#1a237e",
                fillOpacity: 1,
                stroke: false
              }}
              interactive={false}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}