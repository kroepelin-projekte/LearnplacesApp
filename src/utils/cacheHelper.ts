// src/utils/cacheHelper.ts (neu erstellen)
import { store } from '../state/store';

const PAGE_CACHE = 'page-cache';
const MEDIA_CACHE = 'media-cache';

export const updateLearnplaceCache = async (url: string, apiBaseUrl: string) => {
  if (!navigator.onLine) return;

  try {
    const accessToken = store.getState().auth.accessToken;
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    });

    if (!res.ok) return;

    const data = await res.json();
    const pageCache = await caches.open(PAGE_CACHE);
    // JSON aktualisieren
    await pageCache.put(url, new Response(JSON.stringify(data)));

    const mediaCache = await caches.open(MEDIA_CACHE);
    const resourceUrlBase = `${apiBaseUrl}/resources/`;

    const downloadMedia = async (rid: string) => {
      if (!rid) return;
      const mediaUrl = resourceUrlBase + rid;
      const existing = await mediaCache.match(mediaUrl);
      if (existing) return; // Schon da? Dann überspringen (spart Traffic)

      const mediaRes = await fetch(mediaUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (mediaRes.ok && mediaRes.status === 200) {
        await mediaCache.put(mediaUrl, mediaRes);
      }
    };

    // Blöcke scannen
    const blocks = data.data.blocks || [];
    for (const block of blocks) {
      if (block.type === 'PictureBlock') await downloadMedia(block.picture);
      if (block.type === 'VideoBlock') await downloadMedia(block.resource_id);
      if (block.sub_blocks) {
        for (const sub of block.sub_blocks) {
          if (sub.type === 'PictureBlock') await downloadMedia(sub.picture);
          if (sub.type === 'VideoBlock') await downloadMedia(sub.resource_id);
        }
      }
    }
    console.log(`[Cache]: Background update finished for ${url}`);
  } catch (e) {
    console.error("[Cache]: Background update failed", e);
  }
};