import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvent, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { getMapCenter, getMapZoom, setMapCenter, setMapZoom } from '../state/containers/containersSlice';
import {useEffect, useRef} from "react";
import L from 'leaflet';

export function CourseMap({ learnplaces }: { learnplaces: LearnplaceInterface[] }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const mapCenter = useSelector(getMapCenter);
    const mapZoom = useSelector(getMapZoom);

    // Helper-Component: Lauscht auf Map-Events und dispatcht aktuelle Werte in den Redux Store
    function MapSyncToRedux() {

      const map = useMap();
      const lastIds = useRef<string>("");

      useEffect(() => {
        if (learnplaces.length === 0) return;

        // Nur zoomen, wenn sich die IDs der Lernorte wirklich geändert haben
        const currentIds = learnplaces.map(lp => lp.id).sort().join(",");
        if (currentIds !== lastIds.current) {
          const bounds = L.latLngBounds(learnplaces.map(lp => [lp.location.latitude, lp.location.longitude]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          lastIds.current = currentIds;
        }
      }, [map]); // Jetzt mit learnplaces in den Dependencies

      useMapEvent("moveend", (event) => {
            const c = event.target.getCenter();
            dispatch(setMapCenter({ lat: c.lat, lng: c.lng }));
        });
        useMapEvent("zoomend", (event) => {
            dispatch(setMapZoom(event.target.getZoom()));
        });
        return null;
    }

    return (
        <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            dragging={false}
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            style={{ height: "400px", width: "100%", marginBottom: "30px", borderRadius: "4px" }}
        >
            <MapSyncToRedux />

            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {learnplaces.map((learnplace) => {
                const circleCenter = {
                    lat: learnplace.location.latitude,
                    lng: learnplace.location.longitude
                };
                return (
                    <div key={learnplace.id}>
                        <Circle
                            center={circleCenter}
                            radius={learnplace.location.radius}
                            color="green"
                            fillColor="green"
                            fillOpacity={0.4}
                            weight={2}
                        />

                        <CircleMarker
                            center={circleCenter}
                            radius={5}
                            color="darkgreen"
                            fillColor="darkgreen"
                            fillOpacity={1}
                            eventHandlers={{
                                click: () => navigate(`/lernort/${learnplace.id}`)
                            }}
                        />
                    </div>
                );
            })}
        </MapContainer>
    );
}