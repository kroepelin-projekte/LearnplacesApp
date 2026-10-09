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

      // 1. Die JSON-Seite selbst cachen
      await cacheData(url, res, PAGE_CACHE);

      const data = await res.json();
      const resourceUrlBase = `${apiBaseUrl}/resources/`;
      const MEDIA_CACHE = 'media-cache';

      // 2. Hilfsfunktion für Medien-Caching (Bilder & Videos)
      const downloadMedia = async (rid: string) => {
        if (!rid) return;
        const mediaUrl = resourceUrlBase + rid;

        try {
          const mediaRes = await fetch(mediaUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          // WICHTIG: Cache-API benötigt Status 200 (kein 206 Partial Content)
          if (mediaRes.ok && mediaRes.status === 200) {
            const cache = await caches.open(MEDIA_CACHE);
            await cache.put(mediaUrl, mediaRes);
            console.log(`[DownloadButton]: Cached media successfully: ${rid}`);
          } else {
            console.warn(`[DownloadButton]: Failed to cache ${rid}. Status: ${mediaRes.status}`);
          }
        } catch (e) {
          console.error(`[DownloadButton]: Error fetching media ${rid}:`, e);
        }
      };

      // 3. Durch alle Blöcke iterieren
      const blocks = data.data.blocks || [];
      for (const block of blocks) {
        console.log('_____________', block);
        // Haupt-Blöcke prüfen
        if (block.type === 'PictureBlock') await downloadMedia(block.picture);
        if (block.type === 'VideoBlock') await downloadMedia(block.resource_id);

        // Sub-Blöcke prüfen
        if (block.sub_blocks && Array.isArray(block.sub_blocks)) {
          for (const subBlock of block.sub_blocks) {
            if (subBlock.type === 'PictureBlock') await downloadMedia(subBlock.picture);
            if (subBlock.type === 'VideoBlock') await downloadMedia(subBlock.resource_id);
          }
        }
      }

      console.log(`[DownloadButton]: All resources cached successfully.`);
      setIsCached(true);
    } catch (err) {
      console.error('[DownloadButton]: Error during caching process', err);
    } finally {
      setButtonIsLoading(false);
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