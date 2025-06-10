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
      fetch(`${apiBaseUrl}/resources/${rid}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[VideoBlock] Failed to fetch learnplace: ' + res.statusText);
          }
          return res.blob();
        })
        .then(blob => setVideoSrc(URL.createObjectURL(blob)))
        .catch(error => console.error('[VideoBlock] Error when fetching video:', error))
        .then(() => setLoading(false));
    }

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
