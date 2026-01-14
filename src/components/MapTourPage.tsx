import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {RootState} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import {MapTour} from "./MapTour.tsx";
import DOMPurify from 'dompurify';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const MapTourPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken || !id) return;
    setIsLoading(true);

    fetch(`${apiBaseUrl}/maps-tour/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Tour Fetch Error');
      })
      .then(data => {
        setTour(data.data);
      })
      .catch(error => {
        console.error('Fetch Error /maps-tour/:id', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken, id]);

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-page-loader-container">
          <Loader />
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <p>Tour wurde nicht gefunden.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1>Tour</h1>
        <h2>{tour.title}</h2>

        <div className="tour-container" style={{ marginBottom: '30px' }}>
          <MapTour learnplaces={tour.tour_learnplaces} />
        </div>

        {tour.description && (
          <div
            className="tour-description"
            style={{ marginBottom: '20px', lineHeight: '1.5' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.description) }}
          />
        )}

      </section>
    </div>
  );
}