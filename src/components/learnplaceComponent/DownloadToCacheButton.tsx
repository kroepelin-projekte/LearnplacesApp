import {useEffect, useState} from 'react';
import { BsDownload, BsXLg } from "react-icons/bs";
import {store} from '../../state/store.ts';
import {Loader} from "../Loader.tsx";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const PAGE_CACHE = 'page-cache';
const MEDIA_CACHE = 'media-cache';

export const DownloadToCacheButton = ({url}: {url: string}) => {
  const [isCached, setIsCached] = useState(false);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  useEffect(() => {
    caches.open(PAGE_CACHE)
      .then((cache) => cache.match(url))
      .then((response) => {
        if (response) {
          setIsCached(true);
        }
      })
      .catch((err) =>console.error("[DownloadButton]: Error checking cache", err));
  }, [url]);

  /**
   * Handles downloading a resource from a specified URL and saving it to the browser's cache storage.
   *
   * This function performs a network fetch to retrieve the resource from the given URL.
   * The fetched resource is then stored in the specified cache (PAGE_CACHE).
   * If an error occurs during either the fetch operation or the caching process,
   * the error is logged to the console along with a prefix message.
   */
  const handleDownloadToCache = async () => {
    setButtonIsLoading(true);
    console.log(`[DownloadButton]: Downloading ${url} to cache...`);

    try {
      const accessToken = store.getState().auth.accessToken;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      });
      if (!res.ok) {
        throw new Error(`[DownloadButton]: Network response was not ok (${res.status})`);
      }
      await cacheData(url, res, PAGE_CACHE);

      const data = await res.json();
      const resourceUrlBase = `${apiBaseUrl}/resources/`;

      const blocks = data.data.blocks || [];
      for (const block of blocks) {
        if (block.picture) {
          console.log('Bild URL: ', resourceUrlBase + block.picture);
          await fetchAndCache(resourceUrlBase + block.picture);
        }
        if (block.video) {
          await fetchAndCache(resourceUrlBase + block.video);
        }

        if (block.sub_blocks && Array.isArray(block.sub_blocks)) {
          for (const subBlock of block.sub_blocks) {
            if (subBlock.picture) {
              console.log('Bild URL: ', resourceUrlBase + subBlock.picture);
              await fetchAndCache(resourceUrlBase + subBlock.picture);
            }
            if (subBlock.video) {
              await fetchAndCache(resourceUrlBase + subBlock.video);
            }
          }
        }
      }

      console.log(`[DownloadButton]: All resources cached successfully.`);
      setIsCached(true);
      setButtonIsLoading(false);
    } catch (err) {
      console.error('[DownloadButton]: Error during caching process', err);
    }
  };

  const fetchAndCache = async (resourceUrl: string) => {
    try {
      const accessToken = store.getState().auth.accessToken;
      const res = await fetch(resourceUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      });
      if (!res.ok) {
        console.warn(`[DownloadButton]: Failed to fetch ${resourceUrl}, status: ${res.status}`);
        return;
      }
      await cacheData(resourceUrl, res, MEDIA_CACHE);;
      console.log(`[DownloadButton]: Cached ${resourceUrl} successfully.`);
    } catch (error) {
      console.error(`[DownloadButton]: Error caching ${resourceUrl}`, error);
    }
  };

  const cacheData = async (url: string, res: Response, cacheName: string): Promise<void> => {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(url, res.clone());
      console.log(`[DownloadButton]: Successfully cached ${url}`);
    } catch (error) {
      console.error(`[DownloadButton]: Failed to cache ${url}`, error);
    }
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
  const handleRemoveFromCache = async () => {
    setButtonIsLoading(true);
    const resourceUrlBase = `${apiBaseUrl}/resources/`;
    const cachedMediaResources: string[] = [];

    const cache = await caches.open(PAGE_CACHE);
    const response = await cache.match(url);

    if (response && response.ok) {
      try {
        const data = await response.json();
        const learnplace = data.data;

        for (const block of learnplace.blocks) {
          if (block.picture) {
            cachedMediaResources.push(resourceUrlBase + block.picture);
          } else if (block.video) {
            cachedMediaResources.push(resourceUrlBase + block.video);
          }

          if (block.sub_blocks && Array.isArray(block.sub_blocks)) {
            for (const subBlock of block.sub_blocks) {
              if (subBlock.picture) {
                cachedMediaResources.push(resourceUrlBase + subBlock.picture);
              } else if (subBlock.video) {
                cachedMediaResources.push(resourceUrlBase + subBlock.video);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error parsing json ${url}:`, error);
      }
    }

    // delete specific learnplace media from media-cache
    if (cachedMediaResources.length > 0) {
      // Log the media resources to be removed from MEDIA_CACHE
      console.log("[DownloadButton]: Media resources to be removed from MEDIA_CACHE:", cachedMediaResources);

      const mediaCache = await caches.open(MEDIA_CACHE);
      const deletePromises = cachedMediaResources.map(async (resourceUrl) => {
        const success = await mediaCache.delete(resourceUrl);
        if (success) {
          console.log(`[DownloadButton]: Deleted media resource: ${resourceUrl}`);
        } else {
          console.warn(`[DownloadButton]: Media resource not found in cache: ${resourceUrl}`);
        }
      });

      await Promise.all(deletePromises);
    }

    // delete specific learnplace info from page-cache
    const pageCacheDeleteSuccess = await cache.delete(url);
    if (pageCacheDeleteSuccess) {
      console.log(`[DownloadButton]: Successfully removed from PAGE_CACHE: ${url}`);
    } else {
      console.warn(`[DownloadButton]: Main URL was not in PAGE_CACHE: ${url}`);
    }

    setIsCached(false);
    setButtonIsLoading(false);
  };

  if (!navigator.onLine && !isCached) {
    return null;
  }

  return (
    <button
      className={`btn-download-to-cache ${isCached ? 'is-cached' : ''}`}
      onClick={isCached ? handleRemoveFromCache : handleDownloadToCache}
    >
      { buttonIsLoading
        ? <div className="button-loader no-select"><Loader /></div>
        : (
          isCached
            ? <><BsXLg size={28} /><span>Download Entfernen</span></>
            : <><BsDownload size={28} /><span>Herunterladen</span></>
        )
      }
    </button>
  )
}