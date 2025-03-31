import {useEffect, useState} from 'react';
import { BsDownload, BsXLg } from "react-icons/bs";

const PAGE_CACHE = 'page-cache';

export const DownloadToCacheButton = ({url}: {url: string}) => {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    caches.open(PAGE_CACHE)
      .then((cache) => cache.match(url))
      .then((response) => {
        if (response) {
          setIsCached(true);
        }
      })
      .catch((err) =>console.error("[DownloadToCacheButton]: Error checking cache", err));
  }, [url]);

  /**
   * Handles downloading a resource from a specified URL and saving it to the browser's cache storage.
   *
   * This function performs a network fetch to retrieve the resource from the given URL.
   * The fetched resource is then stored in the specified cache (PAGE_CACHE).
   * If an error occurs during either the fetch operation or the caching process,
   * the error is logged to the console along with a prefix message.
   */
  const handleDownloadToCache = () => {
    console.log(`[DownloadToCacheButton]: Downloading ${url} to cache...`);
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Network response was not ok (${res.status})`);
        }
        return caches.open(PAGE_CACHE)
          .then(cache => {
            cache.put(url, res.clone())
              .then(() => setIsCached(true));
          })
          .catch(err => console.log('[DownloadToCacheButton]', err));
      })
      .catch(err => console.log('[DownloadToCacheButton]', err));
  };

  /**
   * Removes a specified resource from the browser's cache storage.
   *
   * This function interacts with the Cache API to locate and delete a cached resource.
   * If the resource is successfully removed, the cached state is updated and a success message
   * is logged to the console. If the resource does not exist in the cache, a warning message
   * is logged. Any errors during the operation are captured and reported to the console.
   *
   * @function
   */
  const handleRemoveFromCache = () => {
    caches.open(PAGE_CACHE)
      .then(cache => {
        cache.delete(url)
          .then((success) => {
            if (success) {
              setIsCached(false);
              console.log(`[DownloadToCacheButton]: Successfully removed ${url} from cache.`);
            } else {
              console.warn(`[DownloadToCacheButton]: No cache entry found for ${url}.`);
            }
          })
          .catch(err => console.error('[DownloadToCacheButton]: Error removing from cache', err));
      })
      .catch(err => console.error('[DownloadToCacheButton]: Error opening cache', err));
  };

  caches.open(PAGE_CACHE).then((cache) => {
    cache.keys().then((keys) => console.log('Cached keys:', keys));
  });

  if (!navigator.onLine && !isCached) {
    return null;
  }

  return (
    <button
      className={`btn-download-to-cache ${isCached ? 'is-cached' : ''}`}
      onClick={isCached ? handleRemoveFromCache : handleDownloadToCache}
    >
      { isCached
        ? <><BsXLg /><span>Heruntergeladene Daten entfernen</span></>
        : <><BsDownload /><span>Für Offline Modus herunterladen</span></>
      }
    </button>
  )
}