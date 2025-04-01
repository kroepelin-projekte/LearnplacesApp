import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from './Loader';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const LearnplacesPage = () => {
  const [learnplaces, setLearnplaces] = useState<LearnplaceInterface[]>([]);
  const navigate = useNavigate();

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  // load learnplaces data
  useEffect(() => {
    function fetchJson() {
      //const jwt = localStorage.getItem('access_token');
      const jwt = 'test';
      fetch(`${apiBaseUrl}/learnplaces`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + jwt,
        }
      })
        .then((res) => {
          //const jwt = res.headers.get('Learnplaces_token');
          const jwt = 'test';
          if (!res.ok || !jwt) {
            console.log(res.ok, jwt);
            throw new Error('[All Learnplaces] Failed to fetch learnplace: ' + res.statusText);
          }
          if (res.status === 401) {
            navigate('/logout', { replace: true });
            return;
          }
          localStorage.setItem('learnplacesToken', jwt);
          return res.json();
        })
        .then((data) => data.data)
        .then((data) => setLearnplaces(data))
        .catch((err: Error) => console.log('[All Learnplaces] Fetch error or offline.', err));
    }

    fetchJson();
  }, [navigate]);

  if (!learnplaces) {
    console.log('no learnplaces');
    return <Loader />;
  }

  return (
    <div className="home-page">
      <section>
        <h1>Lernorte Übersicht</h1>

        <ul>
          {learnplaces.map((learnplace: LearnplaceInterface) => {
            return (
              <li key={learnplace.id}>
                <Link to={`/lernort/${learnplace.id}`} onClick={vibrate}>
                  <div className="card">
                    <div className="card-header">
                      <h2>{learnplace.title}</h2>
                    </div>
                    <div className="card-body">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(learnplace.description) }} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

      </section>
    </div>
  );
}
