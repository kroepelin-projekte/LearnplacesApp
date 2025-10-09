import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvent } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { getMapCenter, getMapZoom, setMapCenter, setMapZoom } from '../state/containers/containersSlice';

export function CourseMap({ learnplaces }: { learnplaces: LearnplaceInterface[] }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const mapCenter = useSelector(getMapCenter);
    const mapZoom = useSelector(getMapZoom);

    // Helper-Component: Lauscht auf Map-Events und dispatcht aktuelle Werte in den Redux Store
    function MapSyncToRedux() {
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