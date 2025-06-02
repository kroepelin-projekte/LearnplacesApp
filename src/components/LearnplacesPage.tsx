import {useCallback, useEffect, useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {FiCheck, FiSearch, FiXCircle} from 'react-icons/fi';
import {AppDispatch} from '../state/store.ts';
import { vibrate } from '../utils/Navigator.ts';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchContainers,
  getContainers, getSearchQuery,
  getSelectedContainer,
  getSelectedTag,
  setSearchQuery,
  setSelectedContainer,
  setSelectedTag,
  getContainerLoadingState
} from '../state/containers/containersSlice';
import {fetchLearnplaces, getLearnplaces, getLearnplacesLoadingState} from '../state/learnplaces/learnplacesSlice';
import {Loader} from './Loader.tsx';

export const LearnplacesPage = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const containerIsLoading = useSelector(getContainerLoadingState);
  const learnplaceIsLoading = useSelector(getLearnplacesLoadingState);
  const dispatch = useDispatch<AppDispatch>();
  const containers = useSelector(getContainers);
  const selectedContainer = useSelector(getSelectedContainer); // current selected container
  const selectedTag = useSelector(getSelectedTag); // current selected tag
  const searchQuery = useSelector(getSearchQuery); // current search query
  const learnplaces = useSelector(getLearnplaces);
  const searchRef = useRef<HTMLInputElement>(null);

  // load containers when component is mounted
  useEffect(() => {
    if (containers.length === 0) {
      dispatch(fetchContainers());
    }
  }, [dispatch, containers.length]);

  // load learnplaces when container changes
  useEffect(() => {
    if (selectedContainer) {
      dispatch(fetchLearnplaces(selectedContainer));
    }
  }, [dispatch, selectedContainer]);

  // handler for container change
  const handleContainerChange = (containerIdString: string) => {
    const containerId = parseInt(containerIdString, 10);
    dispatch(setSelectedContainer(containerId)); // Setze den Container in Redux
    dispatch(setSelectedTag(null)); // Zurücksetzen des ausgewählten Tags
  };

  // handler for tag change
  const handleTagChange = (tag: string | null) => {
    dispatch(setSelectedTag(tag)); // Aktualisiere den ausgewählten Tag in Redux
  };

  // filter
  const filterLearnplaces = useCallback((learnplaces: LearnplaceInterface[], selectedTag: string | null, searchQuery: string) => {
    let filtered = [...learnplaces];

    // filter by tag
    if (selectedTag && selectedTag.length > 0) {
      filtered = filtered.filter(learnplace =>
        learnplace.tags.includes(selectedTag)
      );
    }

    // filter by search query
    if (searchQuery && searchQuery.trim().length > 0) {
      filtered = filtered.filter(learnplace =>
        learnplace.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    return filtered;
  }, []);

  const filteredLearnplaces = filterLearnplaces(learnplaces, selectedTag, searchQuery);

  // handler for search query
  const handleSearchInput = useCallback((searchQuery: string) => {
    dispatch(setSearchQuery(searchQuery));
  }, [dispatch]);

  // search reset
  const handleResetSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
    searchRef.current?.focus();
  }, [dispatch]);

  // offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // Event-Listener für Änderungen des Offline-/Online-Status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup der Event-Listener
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // offline message
  if (isOffline) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <h1>Übersicht</h1>
          <p>
          Sie sind offline. Auf der Download-Seite finden Sie alle heruntergeladenen Lernorte.
          </p>
          <div className="home-page-offline-message">
            <Link to="/downloads" className="btn">
              Zu den Downloads
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // loading
  if (containerIsLoading || learnplaceIsLoading) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <h1>Übersicht</h1>
          <div className="home-page-loader-container">
            <Loader />
          </div>
        </section>
      </div>
    );
  }

  // loading
  if (containers.length === 0) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <h1>Übersicht</h1>
          <div className="home-page-loader-container">
            Es wurden keine Lernorte gefunden.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1>Übersicht</h1>

        <div className="learnplace-settings-container">
          {/* Container Dropdown */}
          <select value={selectedContainer || ''} onChange={(e) => handleContainerChange(e.target.value)}>
            {containers.map((container) => (
              <option key={container.ref_id} value={container.ref_id}>
                {container.title}
              </option>
            ))}
          </select>

          {/* Tag Dropdown */}
          <select value={selectedTag || ''} onChange={(e) => handleTagChange(e.target.value)}>
            <option value="">Alle Tags</option>
            {containers
              .find((c) => c.ref_id === selectedContainer)
              ?.tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
          </select>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Suche"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              ref={searchRef}
            />
            {
              searchQuery.length > 0
                ? <FiXCircle onClick={handleResetSearch} />
                : <FiSearch />
            }
          </div>
        </div>
      </section>


      {/* Learnplace List */}
      <ul>
        {filteredLearnplaces.map((learnplace: LearnplaceInterface) => (
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
    </div>
  );
};
