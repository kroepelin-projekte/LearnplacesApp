import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from 'leaflet';
import { FiMaximize2, FiX, FiCheck } from "react-icons/fi";
import { renderToStaticMarkup } from "react-dom/server";
import { createPortal } from "react-dom";

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

  // Funktion zum Erstellen des nummerierten Icons mit Check-Badge
  const createNumberedIcon = (index: number, visited: boolean) => {
    const baseSize = isFullscreen ? 36 : 32;
    const color = visited ? "#2e7d32" : "#1a237e";

    // Check-Icon HTML generieren
    let checkIconHtml = '';
    if (visited) {
      checkIconHtml = renderToStaticMarkup(
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          background: '#4caf50',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          zIndex: 2
        }}>
          <FiCheck size={12} strokeWidth={4} />
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
            padding: 0 6px;
            border-radius: ${baseSize / 2}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${baseSize * 0.5}px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            white-space: nowrap;
          ">
            ${index + 1}
          </div>
        </div>`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
    });
  };

  const mapContent = (
    <div
      className={`tour-map-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 99999 : 1
      }}
    >
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
        {isFullscreen ? <FiX size={18} strokeWidth={4} /> : <FiMaximize2 size={18} strokeWidth={4} />}
      </button>

      <MapContainer
        key={isFullscreen ? 'fs' : 'inline'}
        dragging={isFullscreen}
        zoomControl={isFullscreen}
        scrollWheelZoom={isFullscreen}
        touchZoom={isFullscreen}
        attributionControl={false}
        style={{
          height: isFullscreen ? "100vh" : "300px",
          width: "100%",
          borderRadius: isFullscreen ? "0" : "8px"
        }}
      >
        <FitBounds learnplaces={learnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />

        {learnplaces.map((lp, index) => (
          <div key={lp.id}>
            <Circle
              center={[lp.latitude, lp.longitude]}
              radius={lp.radius}
              color={lp.visited ? "#4caf50" : "#34499A"}
              fillOpacity={0.15}
              interactive={false}
            />

            <Marker
              position={[lp.latitude, lp.longitude]}
              icon={createNumberedIcon(index, lp.visited)}
              interactive={isFullscreen}
              eventHandlers={isFullscreen ? {
                click: () => {
                  navigate(`/lernort/${lp.id}`);
                }
              } : {}}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );

  return isFullscreen ? createPortal(mapContent, document.body) : mapContent;
}