import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import DOMPurify from 'dompurify';
import { vibrate } from '../utils/Navigator.ts';
import {FiCheck} from 'react-icons/fi';

export const DownloadedLearnplaces = () => {
  const [cachedLearnplaces, setCachedLearnplaces] = useState<CachedContainer[]>([]);

  useEffect(() => {
    const fetchCachedLearnplaces = async () => {
      const cacheName = "page-cache";
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      const containerMap: Record<string, LearnplaceInterface[]> = {};

      for (const request of requests) {
        const response = await cache.match(request);
        if (response && response.ok) {
          try {
            const data = await response.json();
            const learnplace = data.data;
            const containerTitle = learnplace.container_title;
            if (!containerMap[containerTitle]) {
              containerMap[containerTitle] = [];
            }
            containerMap[containerTitle].push(learnplace);
          } catch (error) {
            console.error(`Fehler beim Parsen von JSON für ${request.url}:`, error);
          }
        }
      }

      const containers: CachedContainer[] = Object.entries(containerMap).map(([title, learnplaces]) => ({
        title,
        learnplaces: learnplaces.sort((a, b) =>
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        ),
      }));

      setCachedLearnplaces(containers);
    };

    fetchCachedLearnplaces();
  }, []);

  return (
    <div className="downloads">
      <section>
        <h1>Downloads</h1>

        {cachedLearnplaces.length > 0 ? (
          <div>
            {cachedLearnplaces.map((container) => (
              <section key={container.title}>
                <h2>{container.title}</h2>
                <ul>
                  {container.learnplaces.map((learnplace) => (
                    <li key={learnplace.id}>
                      <Link to={`/lernort/${learnplace.id}`} onClick={vibrate}>
                        <div className="card">
                          <div className="card-header">
                            <h3>{learnplace.title}</h3>
                            <div className="learnplace-visited-status">
                              {learnplace.visited ? <FiCheck size={30} /> : ''}
                            </div>
                          </div>
                          <div className="card-body">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(learnplace.description),
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p>Es sind keine heruntergeladenen Lernorte verfügbar.</p>
        )}

      </section>
    </div>
  );
}