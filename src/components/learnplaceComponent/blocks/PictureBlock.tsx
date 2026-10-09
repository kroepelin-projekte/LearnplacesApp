import {useState, useEffect} from 'react';
import DOMPurify from 'dompurify';
import { isVisible } from '../../../utils/BlockVisibility.ts';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import { store } from '../../../state/store.ts';

export const PictureBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isVisible(props.block.visited, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [props]);

  const rid = props.block.picture;
  useEffect(() => {
    const fetchImage = async () => {
      const accessToken = store.getState().auth.accessToken;
      const imageUrl = `${apiBaseUrl}/resources/${rid}`;
      const cacheName = 'media-cache'; // Der Cache für Bilder/Ressourcen

      try {
        const res = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          }
        });

        if (!res.ok) {
          throw new Error('[PictureBlock] Failed to fetch image: ' + res.statusText);
        }

        const blob = await res.blob();
        setImgSrc(URL.createObjectURL(blob));

        // Optional: Hier könntest du das Bild auch manuell cachen,
        // falls es nicht über die Download-Funktion kam.
      } catch (error) {
        console.log('[PictureBlock] Fetch error, checking cache...', error);

        try {
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(imageUrl);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            console.log('[PictureBlock] Serving image from manual cache');
            setImgSrc(URL.createObjectURL(blob));
          } else {
            console.warn('[PictureBlock] Image not found in cache');
          }
        } catch (cacheError) {
          console.error('[PictureBlock] Cache lookup failed', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [dispatch, rid]);

  if (!visible || loading) {
    return null;
  }

  if (!imgSrc) {
    return <p>Fehler beim Laden des Bildes.</p>;
  }

  return (
    <div className="picture-block">
      <img src={imgSrc} alt={props.block.title} className="picture-block-img"/>
      { props.block.title && (
        <div className="content">
          <h2>{props.block.title}</h2>
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.block.description) }} />
        </div>
      )}
    </div>
  )
}
