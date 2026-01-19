import { MapContainer, TileLayer, Circle, useMap, Marker } from "react-leaflet";
import { useEffect } from "react";
import L from 'leaflet';
import { renderToStaticMarkup } from "react-dom/server";
import { FiCheck } from "react-icons/fi";

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
  // Funktion zum Erstellen des nummerierten Icons (analog zu MapTour)
  const createNumberedIcon = (index: number, visited: boolean) => {
    const baseSize = 28; // Etwas kleiner für die Thumbnail-Ansicht
    const color = visited ? "#2e7d32" : "#1a237e";

    let checkIconHtml = '';
    if (visited) {
      checkIconHtml = renderToStaticMarkup(
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#4caf50',
          borderRadius: '50%',
          width: '14px',
          height: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: '1.5px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          zIndex: 2
        }}>
          <FiCheck size={10} strokeWidth={4} />
        </div>
      );
    }

    return L.divIcon({
      className: 'custom-tour-marker',
      html: `
        <div style="position: relative; display: inline-block;">
          ${checkIconHtml}
          <div style="
            background-color: ${color};
            min-width: ${baseSize}px;
            height: ${baseSize}px;
            padding: 0 4px;
            border-radius: ${baseSize / 2}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${baseSize * 0.5}px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            white-space: nowrap;
          ">
            ${index + 1}
          </div>
        </div>`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
    });
  };

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

        {learnplaces.map((lp, index) => (
          <div key={lp.id}>
            {/* Optionaler Radius-Kreis für Touren (falls vorhanden) */}
            {lp.radius > 0 && (
              <Circle
                center={[lp.latitude, lp.longitude]}
                radius={lp.radius}
                pathOptions={{
                  color: lp.visited ? "#4caf50" : "#34499A",
                  fillOpacity: 0.15,
                  weight: 2
                }}
                interactive={false}
              />
            )}

            {/* Nummerierter Marker statt CircleMarker */}
            <Marker
              position={[lp.latitude, lp.longitude]}
              icon={createNumberedIcon(index, lp.visited)}
              interactive={false}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}