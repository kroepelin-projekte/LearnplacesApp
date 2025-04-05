import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from './Loader';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {useDispatch} from 'react-redux';
import {AppDispatch, store} from '../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {setAccessToken} from '../state/auth/authSlice.ts';

export const LearnplacesPage = () => {
  const [learnplaces, setLearnplaces] = useState<LearnplaceInterface[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  // load learnplaces data
  useEffect(() => {
    function fetchJson() {
      const accessToken = store.getState().auth.accessToken;
      fetch(`${apiBaseUrl}/learnplaces`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[All Learnplaces] Failed to fetch learnplace: ' + res.statusText);
          }
          const accessToken = res.headers.get('Learnplaces_token');
          if (accessToken) {
            dispatch(setAccessToken(accessToken));
          }
          return res.json();
        })
        .then((data) => data.data)
        .then((data) => setLearnplaces(data))
        .catch((err: Error) => console.log('[All Learnplaces] Fetch error or offline.', err));
    }

    fetchJson();
  }, [dispatch, navigate]);

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
