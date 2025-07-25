import {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker} from 'react-leaflet';
import L, { Map as LeafletMap, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Loader } from '../Loader';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {RootState, store} from '../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {useSelector} from 'react-redux';

L.Icon.Default.mergeOptions({
  shadowUrl: iconShadow,
});

export const MapPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learnplace, setLearnplace] = useState<LearnplaceInterface | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const position: number[]|null = useSelector((state: RootState) => state.geolocation.position);
  const heading: number|null = useSelector((state: RootState) => state.geolocation.heading);

  useEffect(() => {
    function fetchJson() {
      const accessToken = store.getState().auth.accessToken;

      fetch(`${apiBaseUrl}/learnplaces/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[Map] Failed to fetch learnplace: ' + res.statusText);
          }
          return res.json();
        })
        .then((data) => data.data)
        .then((data) => setLearnplace(data))
        .catch(() => console.log('[Map] Fetch error or offline.'));
    }

    fetchJson();
  }, [navigate, id]);

  const customIcon = (heading: number) => {
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="transform: rotate(${heading}deg); transition: transform 0.3s linear; border-radius: 50%; width: 48px; height: 48px;">
          <svg width="48px" height="48px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="arrowUpIconTitle" stroke="#13305c" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"> <title id="arrowUpIconTitle">Arrow Up</title> <path d="M18 9l-6-6-6 6"/> <path d="M12 21V4"/> <path stroke-linecap="round" d="M12 3v1"/> </svg>
        </div>`
      ,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  if (!learnplace) {
    return (
      <div className="loading-map">
        <Loader />
      </div>
    );
  }

  return (
    <div className="map">
      {/* Buttons zum Steuern der Karte */}
      <div className="button-container">
        <button
          className="map-button"
          onClick={() => {
            if (mapRef.current && position) {
              const [lat, lng] = position;
              if (lat !== null && lng !== null) {
                mapRef.current.flyTo(
                  [lat, lng],
                  17, // Zoom-Level für Position
                  { duration: 2 }
                );
              }
            }
          }}
        >
          Eigene Position anzeigen
        </button>
        <button
          className="map-button"
          onClick={() => {
            if (mapRef.current && learnplace) {
              mapRef.current.flyTo(
                [learnplace.location.latitude, learnplace.location.longitude],
                  learnplace.location.zoom,
                { duration: 2 }
              );
            }
          }}
        >
          Lernort anzeigen
        </button>
      </div>

      {/* Karte */}
      <MapContainer
        center={{ lat: learnplace.location.latitude, lng: learnplace.location.longitude } as LatLngExpression} // Startpunkt auf learnplace
        zoom={learnplace.location.zoom}
        style={{ height: "calc(100svh - 110px)", width: "100%", marginBottom: "30px" }}
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
            // setMapReady(true);
          }
        }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Nutzerposition */}
        {position && (
          <Marker position={position as LatLngExpression} icon={customIcon(heading ?? 0)}>
            <Circle
              center={position as LatLngExpression}
              radius={50}
              color="hsla(220, 100%, 40%, 1)"
              fillColor="hsla(220, 100%, 40%, 0.3)"
              fillOpacity={1}
            />
            <Popup>
              Du bist hier!
              {heading !== null && <div>Richtung: {heading.toFixed(2)}°</div>}
            </Popup>
          </Marker>
        )}

        {/* Learnplace radius */}
        <Circle
          center={{ lat: learnplace.location.latitude, lng: learnplace.location.longitude }}
          radius={learnplace.location.radius}
          color="green"
          fillColor="green"
          fillOpacity={0.4}
        />

        {/* Learnplace point */}
        <CircleMarker
          center={{ lat: learnplace.location.latitude, lng: learnplace.location.longitude }}
          radius={5}
          color="darkgreen"
          fillColor="darkgreen"
          fillOpacity={1}
        />
      </MapContainer>
    </div>
  );
}

