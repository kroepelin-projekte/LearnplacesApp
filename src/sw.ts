/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim, skipWaiting } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {StaleWhileRevalidate} from 'workbox-strategies';
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
    ////console.log(`Route geprüft: ${url.href}, getroffen: ${isMatch}`);
    return isMatch;
  },
  new StaleWhileRevalidate({
    cacheName: TMP_MAP_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

skipWaiting();
clientsClaim();

