/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim, skipWaiting } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {CacheFirst, StaleWhileRevalidate} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {ExpirationPlugin} from 'workbox-expiration';
import { getIndexedDBData } from './utils/Database';

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
 Custom plugin for workbox stale while revalidate with headers
 =========================================
 */
const jwtTokenPlugin = {
  requestWillFetch: async ({ request }: { request: Request }) => {
    try {
      const accessToken = await getIndexedDBData('access_token');
      if (!accessToken) {
        console.warn('[jwtTokenPlugin] No access token found.');
        return request;
      }

      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);

      const modifiedRequest = new Request(request.url, {
        method: 'GET',
        headers,
        cache: request.cache,
      });

      return modifiedRequest;
    } catch (error) {
      console.error('[jwtTokenPlugin] Error modifying request:', error);
      return request;
    }
  },
};

/**
 =========================================
 Caching of downloaded pages and media (learnplacesInfo)
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
      jwtTokenPlugin
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
      jwtTokenPlugin
    ],
  })
);

/**
 =========================================
 Temporary caching of learnplaces list
 =========================================
 */
const TMP_LEARNPLACES_CACHE = 'tmp-learnplaces-cache';
registerRoute(
  ({ url }) => {
    return url.pathname.includes('/containers');
  },
  new StaleWhileRevalidate({
    cacheName: TMP_LEARNPLACES_CACHE,
    plugins: [
      jwtTokenPlugin
    ],
  })
);

/**
 =========================================
 WebAssembly Module for QR-Code Scanner
 =========================================
 */
const QR_CODE_SCANNER_CACHE = 'qr-code-scanner-cache';
registerRoute(
  ({ url }) => {
    return url.hostname.includes('fastly') || url.href.includes('fastly');
  },
  new StaleWhileRevalidate({
    cacheName: QR_CODE_SCANNER_CACHE,
  })
);

/**
 =========================================
 Temporary caching map
 =========================================
 */
const TMP_MAP_CACHE = 'tmp-map-cache';
registerRoute(
  ({ url }) => {
    const isMatch = url.hostname.includes('openstreetmap') || url.href.includes('openstreetmap');
    console.log(`Route geprüft: ${url.href}, getroffen: ${isMatch}`);
    return isMatch;
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

skipWaiting();
clientsClaim();
