import {useState, useEffect} from 'react';
import DOMPurify from 'dompurify';
import { isVisible } from '../../../utils/BlockVisibility.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const PictureBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isVisible(true, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [props]);

  const rid = props.block.picture;
  useEffect(() => {
    const fetchImage = () => {
      const jwt = localStorage.getItem('access_token');

      fetch(`${apiBaseUrl}/resources/${rid}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + jwt,
          }
        })
        .then((res) => {
          //const jwt = res.headers.get('Learnplaces_token');
          if (!res.ok/* || !jwt*/) {
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }
          //localStorage.setItem('access_token', jwt);
          return res.blob();
        })
        .then(blob => setImgSrc(URL.createObjectURL(blob)))
        .catch(error => console.error('[Learnplace] Error when fetching image:', error))
        .then(() => setLoading(false));
    };

    fetchImage();
  }, [rid]);

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
