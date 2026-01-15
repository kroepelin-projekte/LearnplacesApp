import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Link, useParams} from "react-router-dom";
import {RootState} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import DOMPurify from 'dompurify';
import {MapCollection} from "./MapCollection.tsx";
import {vibrate} from "../utils/Navigator.ts";
import iconCheck from "../assets/images/pin-check_2.svg";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const MapCollectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken || !id) return;
    setIsLoading(true);

    fetch(`${apiBaseUrl}/maps-collection/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Collection Fetch Error');
      })
      .then(data => {
        setCollection( data.data);
      })
      .catch(error => {
        console.error('Fetch Error /maps-collection/:id', error);
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

  if (!collection) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <p>Sammlung wurde nicht gefunden.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1 style={{ fontSize: '32px', marginBottom: '15px' }}>{collection.title}</h1>

        {collection.description && (
          <div
            className="collection-description"
            style={{ marginBottom: '20px', lineHeight: '1.4', color: 'black' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(collection.description) }}
          />
        )}

        <div className="collection-container" style={{ marginBottom: '30px' }}>
          <MapCollection learnplaces={collection.collection_learnplaces} />
        </div>

        {/* Gruppierung der Lernorte vorbereiten */}
        {(() => {
          const grouped: Record<string, CollectionLearnplace[]> = {};

          collection.collection_learnplaces.forEach((lp) => {
            const tagName = lp.tag_name || "Allgemein";
            if (!grouped[tagName]) {
              grouped[tagName] = [];
            }
            grouped[tagName].push(lp);
          });

          return Object.entries(grouped).map(([tagName, learnplaces]) => {
            const groupColor = learnplaces[0]?.color || '#34499a';

            return (
              <div key={tagName} className="tag-group">
                <h3 className="tag-group-title">
                  <span style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: groupColor,
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: 0,
                    marginRight: '10px',
                  }}></span>
                  {tagName}
                </h3>
                <ul>
                  {learnplaces.map((lp) => (
                    <li key={lp.id} style={{ position: 'relative' }}>
                      <Link to={`/lernort/${lp.id}`} onClick={vibrate}>
                        <div className="card" style={{ paddingLeft: '20px' }}>
                          <div className="card-header">
                            <h2>{lp.title}</h2>
                            <div className="learnplace-visited-status">
                              {lp.visited ? <img src={iconCheck} width="36" alt="Lernort besucht" /> : ''}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        })()}

      </section>
    </div>
  );
}