import { useParams } from 'react-router';
import {JSX, useEffect, useState} from 'react';
import { LinkBlock } from './blocks/LinkBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { AccordionBlock } from './blocks/AccordionBlock';
import { PictureBlock } from './blocks/PictureBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { isWithinRadius } from '../../utils/BlockVisibility.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const LearnplacePage = () => {
  const { id } = useParams();
  const [learnplace, setLearnplace] = useState<LearnplaceInterface | null>(null);
  const [userPosition, setUserPosition] = useState({ lat: 0, lng: 0});
  const navigate = useNavigate();
  const [isWithinLearnplaceRadius, setIsWithinLearnplaceRadius] = useState(false);
  const [blockComponents, setBlockComponents] = useState<JSX.Element[]>([]);

  /**
   * Check if user in within the learnplace radius if position changes
   */
  useEffect(() => {
    // learnplace position
    const { latitude = 0, longitude = 0 } = learnplace?.location || {};
    const learnplacePosition = { lat: latitude, lng: longitude };

    // learnplace radius
    const learnplaceRadius = learnplace ? learnplace.location.radius : 0;

    // learnplace is within radius
    setIsWithinLearnplaceRadius(isWithinRadius(learnplacePosition, learnplaceRadius, userPosition));
  }, [userPosition, learnplace]);

  /**
   * Rerender the block components if the learnplace is fetched or the users isWithinRadius state changes
   */
  useEffect(() => {
    if (!learnplace) {
      return;
    }
    const blockComponentsList: JSX.Element[] = learnplace.blocks
      .map((block: BlockInterface, idx: number) => {
        switch (block.type) {
          case 'ILIASLinkBlock':
            return <LinkBlock key={idx} block={block} isWithinLearnplaceRadius={isWithinLearnplaceRadius} />;
          case 'RichTextBlock':
            return <RichTextBlock key={idx} block={block} isWithinLearnplaceRadius={isWithinLearnplaceRadius} />;
          case 'AccordionBlock':
            return <AccordionBlock key={idx} block={block} isWithinLearnplaceRadius={isWithinLearnplaceRadius} />;
          case 'PictureBlock':
            return <PictureBlock key={idx} block={block} isWithinLearnplaceRadius={isWithinLearnplaceRadius} />;
          case 'VideoBlock':
            return <VideoBlock key={idx} block={block} isWithinLearnplaceRadius={isWithinLearnplaceRadius} />;
          default:
            return null;
        }
      })
      .filter((component): component is JSX.Element => component != null);

    setBlockComponents(blockComponentsList);
  }, [isWithinLearnplaceRadius, learnplace]);

  /**
   * Fetches the learnplace when componet is mounted
   */
  useEffect(() => {
    function fetchJson() {
      //const jwt = res.headers.get('Learnplaces_token');
      const jwt = 'test';

      fetch(`${apiBaseUrl}/learnplaces/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + jwt,
        }
      })
        .then((res) => {
          //const jwt = res.headers.get('Learnplaces_token');
          const jwt = 'test';
          if (!res.ok || !jwt) {
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }
          if (res.status === 401) {
            navigate('/logout', { replace: true });
            return;
          }
          localStorage.setItem('access_token', jwt);
          return res.json();
        })
        .then((data) =>  data.data)
        .then((data) => setLearnplace(data))
        .catch(() => console.log('[Learnplace] Fetch error or offline.'));
    }

    fetchJson();
  }, [navigate, id]);

  /**
   * Watch the user position
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      return;
    }

    const watchID = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get the user's location timed out.");
            break;
          default:
            console.error("An unknown error occurred while retrieving geolocation.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchID);
    };
  }, []);

  if (!learnplace || !blockComponents) {
    return '';
  }

  return (
    <div className="learnplace-page">
      <section>
        <h1>{learnplace.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(learnplace.description) }} />
      </section>
      <div className="blocks">
        {blockComponents.length > 0 ? blockComponents : null}
      </div>
    </div>
  );
}

