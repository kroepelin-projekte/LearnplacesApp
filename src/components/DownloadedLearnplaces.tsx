import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

export const DownloadedLearnplaces = () => {
  const [cachedLearnplaces, setCachedLearnplaces] = useState<LearnplaceInterface[]>([]);

  useEffect(() => {
    const fetchCachedLearnplaces = async () => {
      const cacheName = "page-cache";
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      const learnplaces: LearnplaceInterface[] = [];

      for (const request of requests) {
        const response = await cache.match(request);
        if (response && response.ok) {
          try {
            const data = await response.json();
            const learnplace = data.data;
            learnplaces.push(learnplace);
          } catch (error) {
            console.error(`Fehler beim Parsen von JSON für ${request.url}:`, error);
          }
        }
      }

      setCachedLearnplaces(learnplaces);
    };

    fetchCachedLearnplaces();
  }, []);


  return (
    <div className="downloads">
      <section>
        <h1>Offline verfügbare Lernorte</h1>

        {cachedLearnplaces.length > 0 ? (
          <ul className="fade-in">
            {cachedLearnplaces.map((learnplace) => (
              <li key={learnplace.id}>
                <Link to={`/lernort/${learnplace.id}`}>{learnplace.title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Es sind keine heruntergeladenen Lernorte verfügbar.</p>
        )}
      </section>
    </div>
  );

}