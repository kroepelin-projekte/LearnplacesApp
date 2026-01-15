import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import L from 'leaflet';
import { FiMaximize2, FiX } from "react-icons/fi";
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

  // WICHTIG: Aufsteigende Sortierung nach render_index (1, 2, 3...).
  // Leaflet rendert in der Reihenfolge des Arrays.
  // Index 1 (groß) wird zuerst gezeichnet, Index 2 (kleiner) darüber.
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

      {/* Legende (Nur im Fullscreen) */}
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

        {sortedLearnplaces.map((lp) => {
          // Logik für die abnehmende Größe:
          // Index 1 -> 28px
          // Index 2 -> 24px
          // Index 3 -> 20px
          const calcIndex = Math.max(0, (lp.render_index || 1) - 1);
          const markerRadius = Math.max(6, 28 - (calcIndex * 4));

          return (
            <div key={`${lp.id}-${lp.render_index}`}>
              {/* Großer Radius-Kreis (nur für den ersten Index anzeigen) */}
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

              {/* Der Farbige Ring / Marker */}
              <CircleMarker
                center={[lp.latitude, lp.longitude]}
                radius={markerRadius}
                pathOptions={{
                  fillColor: lp.color || '#34499a',
                  fillOpacity: 1,
                  stroke: false // Entfernt den weißen Rand
                }}
                interactive={isFullscreen}
                eventHandlers={isFullscreen ? {
                  click: () => {
                    navigate(`/lernort/${lp.id}`);
                  }
                } : {}}
              />

              {/* Häkchen (als kleiner weißer Punkt in der Mitte beim obersten Element) */}
              {lp.visited && isFullscreen && (
                <CircleMarker
                  center={[lp.latitude, lp.longitude]}
                  radius={4}
                  pathOptions={{
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                    stroke: false
                  }}
                  interactive={false}
                />
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );

  if (isFullscreen) {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}