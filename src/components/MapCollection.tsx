import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import L from 'leaflet';
import { FiMaximize2, FiX, FiCheck } from "react-icons/fi";
import { renderToStaticMarkup } from "react-dom/server";
import { createPortal } from "react-dom";

interface CollectionMapProps {
  learnplaces: CollectionLearnplace[];
}

function FitBounds({ learnplaces }: { learnplaces: CollectionLearnplace[] }) {
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

export function MapCollection({ learnplaces }: CollectionMapProps) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const legendItems = useMemo(() => {
    const seen = new Set();
    return learnplaces
      .filter(lp => {
        const key = `${lp.color}-${lp.tag_name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(lp => ({ color: lp.color, tag: lp.tag_name || "Allgemein" }));
  }, [learnplaces]);

  const sortedLearnplaces = useMemo(() => {
    return [...learnplaces].sort((a, b) => (a.render_index || 0) - (b.render_index || 0));
  }, [learnplaces]);

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

  // Funktion zum Erstellen des Icons mit Check-Badge (analog zu MapTour)
  const createCollectionIcon = (lp: CollectionLearnplace) => {
    const calcIndex = Math.max(0, (lp.render_index || 1) - 1);
    const baseSize = Math.max(12, 56 - (calcIndex * 8));
    const color = lp.color || '#34499a';

    let checkIconHtml = '';
    if (lp.visited && lp.render_index === 1) {
      checkIconHtml = renderToStaticMarkup(
        <div style={{
          position: 'absolute',
          top: '-15%', // Nutzt Prozent, damit es bei jeder Kreisgröße passt
          right: '-15%',
          background: '#4caf50',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          zIndex: 2
        }}>
          <FiCheck size={14} strokeWidth={4} />
        </div>
      );
    }

    return L.divIcon({
      className: 'custom-collection-marker',
      html: `
        <div style="position: relative; width: ${baseSize}px; height: ${baseSize}px;">
          ${checkIconHtml}
          <div style="
            background-color: ${color};
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
          </div>
        </div>`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
    });
  };

  const mapContent = (
    <div className={`tour-map-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`} style={{
      position: isFullscreen ? 'fixed' : 'relative',
      top: 0,
      left: 0,
      width: isFullscreen ? '100vw' : '100%',
      height: isFullscreen ? '100vh' : 'auto',
      zIndex: isFullscreen ? 99999 : 1
    }}>
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
          borderRadius: '2px',
          padding: '6px',
          display: 'flex',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
      >
        {isFullscreen ? <FiX size={18} strokeWidth={4}/> : <FiMaximize2 size={18} strokeWidth={4} />}
      </button>

      {isFullscreen && (
        <div className="map-legend" style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 100000,
          background: '#ffffff',
          padding: '12px',
          borderRadius: '2px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '200px',
          fontSize: '16px',
          color: '#34499a'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', borderBottom: '1px solid #ddd' }}>Legende</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {legendItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  flexShrink: 0
                }} />
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#000000'
                }}>
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <FitBounds learnplaces={sortedLearnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />

        {sortedLearnplaces.map((lp) => (
          <div key={`${lp.id}-${lp.render_index}`}>
            {lp.render_index <= 1 && lp.radius > 0 && (
              <Circle
                center={[lp.latitude, lp.longitude]}
                radius={lp.radius}
                pathOptions={{
                  color: '#636363',
                  fillColor: '#858585',
                  fillOpacity: 0.2,
                  weight: 2
                }}
                interactive={false}
              />
            )}

            <Marker
              position={[lp.latitude, lp.longitude]}
              icon={createCollectionIcon(lp)}
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