import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import {MapTourThumbnail} from "./MapTourThumbnail.tsx";
import {Link} from "react-router-dom";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface Collection {
  map_id: number;
  title: string;
  description: string;
  context_ref_id: number;
  collection_learnplaces: {
    id: number;
    title: string;
    latitude: number;
    longitude: number;
    radius: number;
    visited: boolean;
    color: string;
    render_index: number;
  }[]
}

export const MapOverviewPage = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);

    fetch(`${apiBaseUrl}/maps-tour`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Tour Maps Error');
      })
      .then(data => {
        const rawTours = Object.values(data.data || {}) as Tour[];

        const formattedTours = rawTours.map((tour: Tour) => ({
          ...tour,
          tour_learnplaces: tour.tour_learnplaces.map(lp => ({
            ...lp,
            lat: lp.latitude,
            lng: lp.longitude
          }))
        }));

        setTours(formattedTours);
      })
      .catch(error => {
        console.error('Fetch Error /tours', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    fetch(`${apiBaseUrl}/maps-collection`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Collection Maps Error');
      })
      .then(data => {
        const rawTours = Object.values(data.data || {}) as Collection[];

        const formattedCollections = rawTours.map((collection: Collection) => ({
          ...collection,
          collection_learnplaces: collection.collection_learnplaces.map(lp => ({
            ...lp,
            lat: lp.latitude,
            lng: lp.longitude
          }))
        }));

        setCollections(formattedCollections);
      })
      .catch(error => {
        console.error('Fetch Error /maps-collection', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-page-loader-container">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1>Touren</h1>

        {tours.length === 0 ? (
          <p>Keine Touren gefunden.</p>
        ) : (
          tours.map(tour => (
            <Link
              key={tour.map_id}
              to={`/tour/${tour.map_id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="tour-container" style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>{tour.title}</h2>
                <MapTourThumbnail learnplaces={tour.tour_learnplaces} />
              </div>
            </Link>
          ))
        )}

        {collections.length === 0 ? (
          <p>Keine Sammlungen gefunden.</p>
        ) : (
          collections.map(collection => (
            <Link
              key={collection.map_id}
              to={`/tour/${collection.map_id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="tour-container" style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>{collection.title}</h2>
                <MapTourThumbnail learnplaces={collection.collection_learnplaces} />
              </div>
            </Link>
          ))
        )}

      </section>
    </div>
  );
}
