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
    const fetchImage = () => {
      const accessToken = store.getState().auth.accessToken;

      fetch(`${apiBaseUrl}/resources/${rid}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          }
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[PictureBlock] Failed to fetch learnplace: ' + res.statusText);
          }
          return res.blob();
        })
        .then(blob => setImgSrc(URL.createObjectURL(blob)))
        .catch(error => console.error('[PictureBlock] Error when fetching image:', error))
        .then(() => setLoading(false));
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
