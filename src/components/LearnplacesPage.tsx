import {useCallback, useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {useDispatch} from 'react-redux';
import { FiSearch, FiXCircle } from "react-icons/fi";
import {AppDispatch, store} from '../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {setAccessToken} from '../state/auth/authSlice.ts';
import React from 'react';

export const LearnplacesPage = () => {
  const [learnplaces, setlearnplaces] = useState<LearnplaceInterface[]>([]);
  const [filteredLearnplaces, setFilteredLearnplaces] = useState<LearnplaceInterface[]>([]);
  const [containers, setContainers] = useState<ContainerInterface[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  const handleLearnplaceList =  useCallback((containerIdString: string) => {
      const containerId = parseInt(containerIdString);
      const accessToken = store.getState().auth.accessToken;
      fetch(`${apiBaseUrl}/containers/${containerId}`, {
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
        .then((data) => {
          setlearnplaces(data.learn_places);
          setFilteredLearnplaces(data.learn_places);
        })
        .catch((err: Error) => console.log('[All Learnplaces] Fetch error or offline.', err));
    }, [dispatch]
  );

  useEffect(() => {
    function fetchContainer() {
      const accessToken = store.getState().auth.accessToken;
      fetch(`${apiBaseUrl}/containers`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[All Learnplaces - Containers] Failed to fetch learnplace: ' + res.statusText);
          }
          return res.json();
        })
        .then((data) => data.data)
        .then((data) => {
          setContainers(data);
          if (data.length > 0) {
            handleLearnplaceList(data[0].ref_id.toString());
          }
        })
        .catch((err: Error) => console.log('[All Learnplaces - Containers] Fetch error or offline.', err));
    }

    fetchContainer();
  }, [handleLearnplaceList]);

  const handleSearch = useCallback(() => {
    setIsSearching(false);
    const searchString = searchRef.current?.value;
    if (!searchString) {
      setFilteredLearnplaces(learnplaces);
      return;
    }
    setIsSearching(true);
    setFilteredLearnplaces(
      learnplaces.filter((learnplace: LearnplaceInterface) => {
        return learnplace.title.trim().toLowerCase().includes(searchString.trim().toLowerCase());
      }));
  }, [learnplaces]);

  const handleResetSearch = useCallback(() => {
    if (searchRef.current === null) {
      return;
    }
    searchRef.current.value = '';
    setIsSearching(false);
    setFilteredLearnplaces(learnplaces);
    searchRef.current.focus();
  }, [learnplaces]);

  if (learnplaces.length === 0 || containers.length === 0) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <h1>Übersicht</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1>Übersicht</h1>

        <select onChange={(e) => handleLearnplaceList(e.target.value)}>
          {containers.map((container: ContainerInterface) => {
            return <option key={container.ref_id} value={container.ref_id}>{container.title}</option>;
          })}
        </select>

        <div className="search-bar">
          <input type="text" placeholder="Suche" onChange={handleSearch} ref={searchRef} />
          {
            isSearching
              ? <FiXCircle onClick={handleResetSearch} />
              : <FiSearch />
          }
        </div>

        <ul>
          {filteredLearnplaces.map((learnplace: LearnplaceInterface) => {
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
