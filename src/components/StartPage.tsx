import { Link } from 'react-router-dom';
import {useEffect} from 'react';
import {store} from '../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const StartPage = () => {

  useEffect(() => {
    const preCacheRequest = async () => {
      const TMP_LEARNPLACES_CACHE = 'tmp-learnplaces-cache';
      const url = `${apiBaseUrl}/learnplaces`;

      try {
        const cache = await caches.open(TMP_LEARNPLACES_CACHE);

        const accessToken = store.getState().auth.accessToken;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        });

        if (response && response.ok) {
          await cache.put(url, response);
        } else {
          console.warn(`[StartPage] Failed to cache learnplace list: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`[StartPage] An error occurred while caching the learnplace list:`, error);
      }
    };

    preCacheRequest();
  }, []);

  return (
    <div className="start-page">
      <section>
        <h1>Willkommen in der Lernorte App</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. At distinctio esse est, facere facilis, inventore laboriosam odio praesentium quam quasi reiciendis sapiente totam, veritatis. Atque!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. At distinctio esse est, facere facilis, inventore laboriosam odio praesentium quam quasi reiciendis sapiente totam, veritatis. Atque!
        </p>

        <div className="center-horizontally mt-12">
          <Link to="/lernorte" className="btn">
            Zu den Lernorten
          </Link>
        </div>

      </section>
    </div>
  );
}
