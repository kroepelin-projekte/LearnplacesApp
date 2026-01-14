import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from 'leaflet';
import { FiMaximize2, FiX } from "react-icons/fi";
import {createPortal} from "react-dom";

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

export function MapTour({ learnplaces }: TourMapProps) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFullscreen]);

  const mapContent = (
    <div className={`tour-map-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`} style={{ position: isFullscreen ? 'fixed' : 'relative', top: 0, left: 0, width: isFullscreen ? '100vw' : '100%', height: isFullscreen ? '100vh' : 'auto', zIndex: isFullscreen ? 99999 : 1 }}>
      <button
        onClick={toggleFullscreen}
        className="map-fullscreen-btn"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 100000,
          background: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
          display: 'flex',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}
      >
        {isFullscreen ? <FiX size={20} /> : <FiMaximize2 size={20} />}
      </button>

      <MapContainer
        key={isFullscreen ? 'fs' : 'inline'}
        dragging={isFullscreen}
        zoomControl={isFullscreen}
        scrollWheelZoom={isFullscreen}
        touchZoom={isFullscreen}
        style={{
          height: isFullscreen ? "100vh" : "300px",
          width: "100%",
          borderRadius: isFullscreen ? "0" : "8px"
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
              interactive={false} // Kreise in der Übersicht nicht interaktiv machen
            />
            <CircleMarker
              center={[lp.latitude, lp.longitude]}
              radius={isFullscreen ? 8 : 6}
              color={lp.visited ? "#2e7d32" : "#1a237e"}
              fillOpacity={1}
              interactive={isFullscreen} // Nur im Fullscreen interaktiv
              eventHandlers={isFullscreen ? {
                click: () => {
                  navigate(`/lernort/${lp.id}`);
                }
              } : {}} // Leere Handlers, wenn nicht im Fullscreen
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );

  // Wenn Fullscreen, rendern wir via Portal am Ende des Body-Tags
  if (isFullscreen) {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}