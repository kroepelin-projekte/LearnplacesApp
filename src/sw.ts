/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {CacheFirst} from 'workbox-strategies';

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
 ================================
 Caching of downloaded pages
 ================================
 */
const PAGE_CACHE = 'page-cache';

registerRoute(
  ({ url }) => {
    return url.pathname.startsWith('/learnplaces/');
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

/**
 ================================
 Caching of downloaded pages end
 ================================
 */

self.skipWaiting()
clientsClaim()
