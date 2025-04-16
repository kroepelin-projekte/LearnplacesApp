import {useCallback, useEffect, useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {useDispatch} from 'react-redux';
import {FiCheck, FiSearch, FiXCircle} from 'react-icons/fi';
import {AppDispatch, store} from '../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {setAccessToken} from '../state/auth/authSlice.ts';
import React from 'react';
import { vibrate } from '../utils/Navigator.ts';

export const LearnplacesPage = () => {
  const [learnplaces, setLearnplaces] = useState<LearnplaceInterface[]>([]);
  const [filteredLearnplaces, setFilteredLearnplaces] = useState<LearnplaceInterface[]>([]);

  const containersRef = useRef<ContainerInterface[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch containers on mount
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const accessToken = store.getState().auth.accessToken;
        const response = await fetch(`${apiBaseUrl}/containers`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error(`[Containers] Failed to fetch containers: ${response.statusText}`);

        const data = await response.json();
        containersRef.current = data.data;

        if (data.data.length > 0) {
          const firstContainerId = data.data[0].ref_id;
          setSelectedContainer(firstContainerId);
          updateTagsAndLearnplaces(firstContainerId);
        }
      } catch (error) {
        console.error('[Containers] Fetch error or offline:', error);
      }
    };

    fetchContainers();
  }, []);

  // Update tags and learnplaces when a container is selected
  const updateTagsAndLearnplaces = useCallback(async (containerId: number) => {
    try {
      const accessToken = store.getState().auth.accessToken;
      const response = await fetch(`${apiBaseUrl}/containers/${containerId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error(`[Learnplaces] Failed to fetch learnplaces: ${response.statusText}`);

      if (accessToken) {
        dispatch(setAccessToken(accessToken));
      }

      const data = await response.json();
      console.log('Fetched learnplaces and set tags:', data);

      const tags = containersRef.current.find(c => c.ref_id === containerId)?.tags || [];

      console.log('Tags:', tags);

      setAvailableTags(tags);
      setLearnplaces(data.data.learn_places);
      setFilteredLearnplaces(data.data.learn_places);
    } catch (error) {
      console.error('[Learnplaces] Fetch error or offline:', error);
    }
  }, []);

  /**
   =========================================
   Filter
   =========================================
   */

  // Filter logic
  useEffect(() => {
    let filtered = [...learnplaces];

    // Tag filter
    if (selectedTag && selectedTag.length > 0) {
      filtered = filtered.filter(learnplace =>
        learnplace.tags.includes(selectedTag)
      );
    }

    // Searchquery
    if (searchQuery && searchQuery.trim().length > 0) {
      filtered = filtered.filter(learnplace =>
        learnplace.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    setFilteredLearnplaces(filtered);
  }, [learnplaces, selectedTag, searchQuery]);

  /**
   =========================================
   Input Handler
   =========================================
   */

  // Handle container selection
  const handleContainerChange = useCallback((containerIdString: string) => {
    const containerId = parseInt(containerIdString, 10);
    setSelectedContainer(containerId);
    setSelectedTag(null);
    updateTagsAndLearnplaces(containerId);
  }, [updateTagsAndLearnplaces]);

  // Handle tag filter
  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  // Handle resetting the search
  const handleResetSearch = useCallback(() => {
    setSearchQuery('');
    searchRef.current?.focus();
  }, []);

  /**
   =========================================
   Rendering
   =========================================
   */

  // Conditional rendering for empty lists
  if (!selectedContainer || learnplaces.length === 0) {
    return (
      <div className="home-page">
        <section className="learnplaces-container-select">
          <h1>Übersicht</h1>
        </section>
      </div>
    );
  }

  console.log('containersRef:', containersRef.current);
  console.log('availableTags:', availableTags);

  return (
    <div className="home-page">
      <section className="learnplaces-container-select">
        <h1>Übersicht</h1>

        <div className="learnplace-settings-container">
          {/* Container Dropdown */}
          <select
            value={selectedContainer || ''}
            onChange={(e) => handleContainerChange(e.target.value)}
          >
            {containersRef.current.map((container: ContainerInterface) => (
              <option key={container.ref_id} value={container.ref_id}>
                {container.title}
              </option>
            ))}
          </select>

          {/* Tag Dropdown */}
          <select
            value={selectedTag || ''}
            onChange={(e) => handleTagChange(e.target.value)}
          >
            <option value="">Alle Tags</option>
            {availableTags.map(tag => (
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
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchRef}
            />
            {
              searchQuery.length > 0
                ? <FiXCircle onClick={handleResetSearch} />
                : <FiSearch />
            }
          </div>
        </div>

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
      </section>
    </div>
  );
};
