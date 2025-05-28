import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import DOMPurify from 'dompurify';
import { vibrate } from '../utils/Navigator.ts';
import {FiCheck} from 'react-icons/fi';

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

      const sortedLearnplaces = learnplaces.sort((a: {title: string}, b: {title: string}) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
      });

      setCachedLearnplaces(sortedLearnplaces);
    };

    fetchCachedLearnplaces();
  }, []);

  return (
    <div className="downloads">
      <section>
        <h1>Downloads</h1>

        {cachedLearnplaces.length > 0 ? (
          <ul>
            {cachedLearnplaces.map((learnplace) => (
              <li key={learnplace.id}>
                <Link to={`/lernort/${learnplace.id}`} onClick={vibrate}>
                  <div className="card">
                    <div className="card-header">
                      <h2>{learnplace.title}</h2>
                      <div className="learnplace-visited-status">
                        {learnplace.visited ? <FiCheck size={40} /> : ''}
                      </div>
                    </div>
                    <div className="card-body">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(learnplace.description) }} />
                    </div>
                  </div>
                </Link>
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