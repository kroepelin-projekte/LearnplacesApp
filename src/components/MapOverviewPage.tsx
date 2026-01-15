import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState, AppDispatch} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import {MapTourThumbnail} from "./MapTourThumbnail.tsx";
import {Link} from "react-router-dom";
import {MapCollectionThumbnail} from "./MapCollectionThumbnail.tsx";
import { setMapType } from "../state/mapType/mapTypeSlice.ts";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const MapOverviewPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useSelector((state: RootState) => state.mapType.activeTab);
  const [tours, setTours] = useState<Tour[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);

    const fetchData = async <T,>(
      endpoint: string,
      cacheName: string,
      setter: (data: T) => void
    ) => {
      const url = `${apiBaseUrl}${endpoint}`;

      // 1. Stale: Versuche Daten aus dem Cache zu laden
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(url);
        if (cachedResponse && cachedResponse.ok) {
          const cachedData = await cachedResponse.json();
          setter(cachedData.data as T);
          // Wir setzen isLoading hier noch NICHT auf false,
          // damit der Loader bleibt, bis wir sicher sind, ob wir Netz haben.
        }
      } catch (cacheError) {
        console.warn(`Cache access error for ${endpoint}:`, cacheError);
      }

      // 2. Revalidate: Frische Daten vom Server holen
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
        });

        if (response.ok) {
          const freshData = await response.json();
          setter(freshData.data as T);

          // Cache im Hintergrund aktualisieren
          const cache = await caches.open(cacheName);
          await cache.put(url, new Response(JSON.stringify(freshData)));
        } else {
          console.error(`Server returned ${response.status} for ${endpoint}`);
        }
      } catch (error) {
        console.error(`Network Fetch Error ${endpoint}:`, error);
      }
    };

    // Beide Requests parallel starten
    Promise.all([
      fetchData<Tour[]>('/maps-tour', 'maps-tour-cache', setTours),
      fetchData<Collection[]>('/maps-collection', 'maps-collection-cache', setCollections)
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [accessToken]);

  if (isLoading && tours.length === 0 && collections.length === 0) {
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
        <h1>Übersicht</h1>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            onClick={() => dispatch(setMapType('tour'))}
            className={activeTab === 'tour' ? 'active-tab' : ''}
          >
            Touren
          </button>
          <button
            onClick={() => dispatch(setMapType('collection'))}
            className={activeTab === 'collection' ? 'active-tab' : ''}
          >
            Sammlungen
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'tour' ? (
          <div className="tab-content">
            {tours.length === 0 ? (
              <p>Keine Touren gefunden.</p>
            ) : (
              tours.map(tour => (
                <Link
                  key={tour.map_id}
                  to={`/tour/${tour.map_id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="tour-container" style={{ marginBottom: '20px' }}>
                    <MapTourThumbnail title={tour.title} learnplaces={tour.tour_learnplaces} />
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="tab-content">
            {collections.length === 0 ? (
              <p>Keine Sammlungen gefunden.</p>
            ) : (
              collections.map(collection => (
                <Link
                  key={collection.map_id}
                  to={`/sammlung/${collection.map_id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="tour-container" style={{ marginBottom: '20px' }}>
                    <MapCollectionThumbnail
                      title={collection.title}
                      learnplaces={collection.collection_learnplaces}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

      </section>
    </div>
  );
}
