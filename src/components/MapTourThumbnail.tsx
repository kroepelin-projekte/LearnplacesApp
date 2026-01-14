import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
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
    map.fitBounds(bounds, { padding: [10, 10], maxZoom: 16 });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map, learnplaces]);

  return null;
}

export function MapTourThumbnail({ title, learnplaces }: TourMapProps) {
  return (
    <div className="map-tile-card" style={{
      display: 'flex',
      alignItems: 'center',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      cursor: 'pointer',
      height: '250px'
    }}>
      {/* Linke Seite: Quadratische Mini-Map */}
      <div style={{ width: '250px', height: '250px', flexShrink: 0 }}>
        <MapContainer
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          touchZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <FitBounds learnplaces={learnplaces} />
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {learnplaces.map((lp) => (
            <div key={lp.id}>
              <CircleMarker
                center={[lp.latitude, lp.longitude]}
                radius={4}
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

      {/* Rechte Seite: Titel */}
      <div style={{ padding: '0 16px', flexGrow: 1, overflow: 'hidden' }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#333'
        }}>
          {title}
        </h3>
      </div>
    </div>
  );
}