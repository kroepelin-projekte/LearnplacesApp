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
import {DownloadToCacheButton} from './DownloadToCacheButton.tsx';
import {useDispatch} from 'react-redux';
import {AppDispatch, store} from '../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {setAccessToken} from '../../state/auth/authSlice.ts';
import {FiCheck} from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useSearchParams } from 'react-router-dom';

export const LearnplacePage = () => {
  const { id } = useParams();
  const learnplaceUrl = `${apiBaseUrl}/learnplaces/${id}`;
  const [learnplace, setLearnplace] = useState<LearnplaceInterface | null>(null);
  const [userPosition, setUserPosition] = useState({ lat: 0, lng: 0});
  const navigate = useNavigate();
  const [isWithinLearnplaceRadius, setIsWithinLearnplaceRadius] = useState(false);
  const [blockComponents, setBlockComponents] = useState<JSX.Element[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  // for confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [searchParams] = useSearchParams();
  const hasConfetti = searchParams.has('success');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  }, []);

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
        block.visited = learnplace.visited;
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
      const accessToken = store.getState().auth.accessToken;
      fetch(learnplaceUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }
          const accessToken = res.headers.get('Learnplaces_token');
          if (navigator.onLine && accessToken) {
            dispatch(setAccessToken(accessToken));
          }
          return res.json();
        })
        .then((data) =>  data.data)
        .then((data) => setLearnplace(data))
        .catch((err) => console.log('[Learnplace] Fetch error or offline.', err));
    }

    fetchJson();
  }, [dispatch, navigate, id, learnplaceUrl]);

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

  // resize confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(() => {
        const newSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        return newSize;
      });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!learnplace || !blockComponents) {
    return '';
  }

  return (
    <div className="learnplace-page">

      { hasConfetti ? <Confetti width={windowSize.width} height={windowSize.height} style={{opacity: showConfetti ? 1 : 0, transition: 'opacity 1s ease-in-out' }} /> : ''}

      <section>
        <h1>{learnplace.title}</h1>
        <div className="learnplace-visited-status">
          {
            learnplace.visited
              ? <FiCheck size={40} />
              : ''
          }
        </div>
        <div className="description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(learnplace.description) }} />
      </section>
      <div className="blocks">
        {blockComponents.length > 0 ? blockComponents : null}
      </div>
      <div className="center-horizontally">
        <DownloadToCacheButton url={learnplaceUrl} />
      </div>
    </div>
  );
}
