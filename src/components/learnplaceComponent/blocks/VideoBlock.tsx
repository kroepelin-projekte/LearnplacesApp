import { useState, useEffect } from 'react';
import { Loader } from '../../Loader';
import { isVisible } from '../../../utils/BlockVisibility.ts';
import {BlockInterface} from '../../../types/types.ts';
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
      //const jwt = res.headers.get('Learnplaces_token');
      const jwt = 'test';

      fetch(`${apiBaseUrl}/resources/${rid}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + jwt,
        }
      })
        .then((res) => {
          //const jwt = res.headers.get('Learnplaces_token');
          const jwt = 'test';
          if (!res.ok || !jwt) {
            console.log(res.ok, jwt);
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }
          localStorage.setItem('learnplacesToken', jwt);
          return res.blob();
        })
        .then(blob => setVideoSrc(URL.createObjectURL(blob)))
        .catch(error => console.error('[Learnplace] Error when fetching video:', error))
        .then(() => setLoading(false));
    }

    fetchVideo();
  }, [rid]);

  if (!visible) {
    return null;
  }

  if (loading) {
    return <>
      <p className="center-horizontally">Video lädt...</p>
      <Loader />
    </>;
  }

  if (!videoSrc) {
    return <p>Fehler beim Laden des Videos.</p>;
  }

  return (
    <div>
      <video src={videoSrc} className="video-block-video" controls />
    </div>
  )
}
