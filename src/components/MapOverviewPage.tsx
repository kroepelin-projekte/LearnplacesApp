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
        setTours(data.data);
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
        setCollections(data.data);
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
