import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from 'leaflet';

interface CollectionMapProps {
  title: string;
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

export function MapCollectionThumbnail({ title, learnplaces }: CollectionMapProps) {
  console.log(title);
  // WICHTIG: Aufsteigende Sortierung nach render_index (1, 2, 3...).
  // Index 1 (groß) wird zuerst gezeichnet, Index 2 (kleiner) darüber.
  const sortedLearnplaces = useMemo(() => {
    return [...learnplaces].sort((a, b) => (a.render_index || 0) - (b.render_index || 0));
  }, [learnplaces]);

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
          cursor: 'pointer'
        }}
      >
        <FitBounds learnplaces={sortedLearnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />

        {sortedLearnplaces.map((lp) => {
          // Identische Logik wie in MapCollection:
          // Index 1 -> 28px (hier etwas kleiner für Thumbnail: 20px)
          // Index 2 -> 16px
          // Index 3 -> 12px
          const calcIndex = Math.max(0, (lp.render_index || 1) - 1);
          // Wir nutzen im Thumbnail etwas kleinere Basis-Radien (20 statt 28),
          // damit es in der kleinen Ansicht nicht zu gedrungen wirkt.
          const markerRadius = Math.max(4, 20 - (calcIndex * 4));

          return (
            <div key={`${lp.id}-${lp.render_index}`}>
              {/* Radius-Kreis (nur für das erste Element) */}
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
                  stroke: false
                }}
                interactive={false}
              />

              {/* Häkchen (optional im Thumbnail, hier als kleiner weißer Punkt) */}
              {lp.visited && (
                <CircleMarker
                  center={[lp.latitude, lp.longitude]}
                  radius={2}
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
}