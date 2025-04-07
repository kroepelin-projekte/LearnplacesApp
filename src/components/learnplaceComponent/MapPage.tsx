import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Loader } from '../Loader';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {store} from '../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

L.Icon.Default.mergeOptions({
  shadowUrl: iconShadow,
});

export const MapPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learnplace, setLearnplace] = useState<LearnplaceInterface | null>(null);
  const [position, setPosition] = useState<number[] | null>(null);
  const [heading, setHeading] = useState<number>(0);

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

  useEffect(() => {
    if (navigator.geolocation) {
      console.log("[Map] Geolocation is supported by this browser. Start watching position.");

      // Watch position
      const watchId = navigator.geolocation.watchPosition(
        (location) => {
          const { latitude, longitude, heading } = location.coords;
          setPosition([latitude, longitude]);
          if (heading !== undefined && heading !== null && heading != 0) {
            setHeading(heading);
          }
        },
        (err) => console.error("[Map] Error retrieving location:", err),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("[Map] Geolocation is not supported by this browser.");
    }
  }, [learnplace]);

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

  if (!position || !learnplace) {
    return <div className="loading-map">
      <p>
        Karte wird geladen...
      </p>
      <Loader />
    </div>;
  }

  return (
    <div className="map">
      <MapContainer
        center={position as LatLngExpression}
        zoom={17}
        style={{ height: "calc(100svh - 130px)", width: "100%", marginBottom: "30px", }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={position as LatLngExpression} icon={customIcon(heading)}>
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

        <Circle
          center={{ lat:learnplace.location.latitude, lng:learnplace.location.longitude }}
          radius={learnplace.location.radius}
          color="green"
          fillColor="green"
          fillOpacity={0.4}
        />

      </MapContainer>
    </div>
  );
}

