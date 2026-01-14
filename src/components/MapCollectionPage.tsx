import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Link, useParams} from "react-router-dom";
import {RootState} from "../state/store.ts";
import {Loader} from "./Loader.tsx";
import DOMPurify from 'dompurify';
import {MapCollection} from "./MapCollection.tsx";
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
        <h1>{collection.title}</h1>

        {collection.description && (
          <div
            className="collection-description"
            style={{ marginBottom: '20px', lineHeight: '1.5' }}
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

          return Object.entries(grouped).map(([tagName, learnplaces]) => (
            <div key={tagName} className="tag-group" style={{ marginBottom: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                {tagName}
              </h3>
              {learnplaces.map((lp) => (
                <div className="collection-learnplace" key={lp.id} style={{ marginBottom: '8px' }}>
                  <Link
                    to={`/lernort/${lp.id}`}
                    className="btn"
                    style={{
                      display: 'block',
                      padding: '10px',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      color: 'black',
                      borderLeft: `5px solid ${lp.color || '#34499a'}`
                    }}
                  >
                    {lp.title}
                  </Link>
                </div>
              ))}
            </div>
          ));
        })()}

      </section>
    </div>
  );
}