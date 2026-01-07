import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import {TourMap} from "./TourMap.tsx";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface TourLearnplace {
  id: number;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  radius: number;
  title: string;
  visited: boolean;
}

interface Tour {
  context_ref_id: number;
  title: string;
  tour_learnplaces: TourLearnplace[];
}

export const MapOverviewPage = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);

    fetch(`${apiBaseUrl}/maps`, {
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
        console.error('Fetch Error /refresh', error);
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
            <div key={tour.context_ref_id} className="tour-container" style={{ marginBottom: '30px' }}>
              <h2 style={{ marginBottom: '10px' }}>{tour.title}</h2>
              <TourMap learnplaces={tour.tour_learnplaces} />
            </div>
          ))
        )}

      </section>
    </div>
  );
}
