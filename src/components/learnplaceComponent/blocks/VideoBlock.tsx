import { useState, useEffect } from 'react';
import { isVisible } from '../../../utils/BlockVisibility.ts';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import { store } from '../../../state/store.ts';

export const VideoBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const rid = props.block.resource_id;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isVisible(props.block.visited, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [props]);

  useEffect(() => {
    const fetchVideo = async () => {
      const accessToken = store.getState().auth.accessToken;
      const videoUrl = `${apiBaseUrl}/resources/${rid}`;
      const cacheName = 'media-cache'; // Videos liegen im selben Cache wie Bilder

      try {
        const res = await fetch(videoUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          }
        });

        if (!res.ok) {
          throw new Error('[VideoBlock] Failed to fetch video: ' + res.statusText);
        }

        const blob = await res.blob();
        setVideoSrc(URL.createObjectURL(blob));
      } catch (error) {
        console.log('[VideoBlock] Fetch error, checking cache...', error);

        try {
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(videoUrl);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            console.log('[VideoBlock] Serving video from manual cache');
            setVideoSrc(URL.createObjectURL(blob));
          } else {
            console.warn('[VideoBlock] Video not found in cache');
          }
        } catch (cacheError) {
          console.error('[VideoBlock] Cache lookup failed', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [dispatch, rid]);

  if (!visible || loading) {
    return null;
  }

  if (!videoSrc) {
    return <p>Fehler beim Laden des Videos.</p>;
  }

  return (
    <div className="video-block">
      <video src={videoSrc} className="video-block-video" controls />
    </div>
  )
}
