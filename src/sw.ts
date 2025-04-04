/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {CacheFirst, StaleWhileRevalidate} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {ExpirationPlugin} from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

let allowlist: RegExp[] | undefined
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('index.html'),
  { allowlist },
))

/**
 =========================================
 Caching of downloaded pages
 =========================================
 */
const PAGE_CACHE = 'page-cache';
registerRoute(
  ({ url }) => {
    return /.*\/learnplaces\/\d+$/.test(url.pathname);
  },
  new CacheFirst({
    cacheName: PAGE_CACHE,
    plugins: [
      {
        cacheWillUpdate: async () => null,
      },
    ],
  })
);
const MEDIA_CACHE = 'media-cache';
registerRoute(
  ({ url }) => {
    return /.*\/resources\/[a-z0-9-]+$/.test(url.pathname);
  },
  new CacheFirst({
    cacheName: MEDIA_CACHE,
    plugins: [
      {
        cacheWillUpdate: async () => null,
      },
    ],
  })
);

/**
 =========================================
 Temporary Caching of learnplaces list
 =========================================
 */
const TMP_LEARNPLACES_CACHE = 'tmp-learnplaces-cache';
registerRoute(
  ({ url }) => {
    return url.pathname.endsWith('/learnplaces');
  },
  new StaleWhileRevalidate({
    cacheName: TMP_LEARNPLACES_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10, // Cache up to 10 entries
        maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 7 days
      }),
    ],
  })
);

/**
 =========================================
 Map cache
 =========================================
 */
const TMP_MAP_CACHE = 'tmp-map-cache';
registerRoute(
  ({ url }) => {
    return url.pathname.includes('tile.openstreetmap.org');
  },
  new StaleWhileRevalidate({
    cacheName: TMP_MAP_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

self.skipWaiting()
clientsClaim()
