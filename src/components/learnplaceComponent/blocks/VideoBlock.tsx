import { useState, useEffect } from 'react';
import { isVisible } from '../../../utils/BlockVisibility.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const VideoBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const rid = props.block.resource_id;

  useEffect(() => {
    if (!isVisible(true, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [props]);

  useEffect(() => {
    const fetchVideo = async () => {
      const jwt = localStorage.getItem('access_token');

      fetch(`${apiBaseUrl}/resources/${rid}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + jwt,
        }
      })
        .then((res) => {
          const jwt = res.headers.get('Learnplaces_token');
          if (!res.ok || !jwt) {
            console.log(res.ok, jwt);
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }
          localStorage.setItem('access_token', jwt);
          return res.blob();
        })
        .then(blob => setVideoSrc(URL.createObjectURL(blob)))
        .catch(error => console.error('[Learnplace] Error when fetching video:', error))
        .then(() => setLoading(false));
    }

    fetchVideo();
  }, [rid]);

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
