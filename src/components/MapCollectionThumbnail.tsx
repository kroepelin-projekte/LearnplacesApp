import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from 'leaflet';
import { FiCheck } from "react-icons/fi";
import { renderToStaticMarkup } from "react-dom/server";

interface MapCollectionThumbnailProps {
  title: string;
  learnplaces: CollectionLearnplace[];
}

function FitBounds({ learnplaces }: { learnplaces: CollectionLearnplace[] }) {
  const map = useMap();

  useEffect(() => {
    if (learnplaces.length === 0) return;
    const bounds = L.latLngBounds(learnplaces.map(lp => [lp.latitude, lp.longitude]));
    map.fitBounds(bounds, { padding: [10, 10] });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map, learnplaces]);

  return null;
}

export function MapCollectionThumbnail({ title, learnplaces }: MapCollectionThumbnailProps) {
  const sortedLearnplaces = useMemo(() => {
    return [...learnplaces].sort((a, b) => (a.render_index || 0) - (b.render_index || 0));
  }, [learnplaces]);

  const createThumbnailIcon = (lp: CollectionLearnplace) => {
    const calcIndex = Math.max(0, (lp.render_index || 1) - 1);
    const baseSize = Math.max(12, 32 - (calcIndex * 8));
    const color = lp.color || '#34499a';

    let checkIconHtml = '';
    if (lp.visited) {
      checkIconHtml = renderToStaticMarkup(
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          background: '#4caf50',
          borderRadius: '50%',
          width: '14px',
          height: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: '1px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          zIndex: 2
        }}>
          <FiCheck size={10} strokeWidth={5} />
        </div>
      );
    }

    return L.divIcon({
      className: 'custom-collection-thumbnail-marker',
      html: `
        <div style="position: relative; width: ${baseSize}px; height: ${baseSize}px;">
          ${checkIconHtml}
          <div style="
            background-color: ${color};
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          ">
          </div>
        </div>`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
    });
  };
  return (
    <div className="map-collection-thumbnail" style={{
      width: "100%",
      height: "150px",
      borderRadius: "8px",
      overflow: "hidden",
      position: "relative"
    }}>
      <h2 style={{ marginBottom: '10px', color: 'black', fontSize: '26px' }}>{title}</h2>
      <MapContainer
        center={[0, 0]}
        zoom={13}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <FitBounds learnplaces={sortedLearnplaces} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {sortedLearnplaces.map((lp) => (
          <Marker
            key={`${lp.id}-${lp.render_index}`}
            position={[lp.latitude, lp.longitude]}
            icon={createThumbnailIcon(lp)}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
}