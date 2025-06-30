import { useParams } from 'react-router';
import {JSX, useEffect, useState} from 'react';
import { LinkBlock } from './blocks/LinkBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { AccordionBlock } from './blocks/AccordionBlock';
import { PictureBlock } from './blocks/PictureBlock';
import { VideoBlock } from './blocks/VideoBlock';
import {Link, useNavigate} from 'react-router-dom';
import DOMPurify from 'dompurify';
import { isWithinRadius } from '../../utils/BlockVisibility.ts';
import {DownloadToCacheButton} from './DownloadToCacheButton.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState, store} from '../../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {logout} from '../../state/auth/authSlice.ts';
import {FiCheck} from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useSearchParams } from 'react-router-dom';

import { setConnectionInfo } from '../../state/network/networkSlice.ts';


export const LearnplacePage = () => {
  const { id } = useParams();
  const learnplaceUrl = `${apiBaseUrl}/learnplaces/${id}`;
  const [learnplace, setLearnplace] = useState<LearnplaceInterface | null>(null);
  const [userPosition, setUserPosition] = useState({ lat: 0, lng: 0});
  const navigate = useNavigate();
  const [isWithinLearnplaceRadius, setIsWithinLearnplaceRadius] = useState(false);
  const [blockComponents, setBlockComponents] = useState<JSX.Element[]>([]);
  const dispatch = useDispatch<AppDispatch>();



  const { connectionType, downloadSpeed, connectionInfo } = useSelector(
      (state: RootState) => state.network
  );



  // for confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [searchParams] = useSearchParams();
  const hasConfetti = searchParams.has('success');
  const [showConfetti, setShowConfetti] = useState(true);

  const position: number[]|null = useSelector((state: RootState) => state.geolocation.position);

  useEffect(() => {
    // Effekt 1: Nutzerposition aktualisieren
    if (position) {
      setUserPosition({ lat: position[0], lng: position[1] });
    }
  }, [position]);


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

          if (res.status === 401) {
            dispatch(logout());
            return;
          }

          if (res.status === 400) {
            navigate('/lernorte');
            return;
          }

          if (!res.ok) {
            throw new Error('[Learnplace] Failed to fetch learnplace: ' + res.statusText);
          }

          return res.json();
        })
        .then((data) =>  data.data)
        .then((data) => setLearnplace(data))
        .catch((err) => console.log('[Learnplace] Fetch error or offline.', err));
    }

    fetchJson();
  }, [dispatch, navigate, id, learnplaceUrl]);

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

  // stop confetti
  useEffect(() => {
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  }, []);

  // check internet connection type
/*  useEffect(() => {
    function getConnectionType(): string | null {
      if ('connection' in navigator) {
        const connection = navigator.connection as NetworkInformation;
        return connection?.type || null;
      }
      return null;
    }

    const connectionType = getConnectionType();

    if (connectionType) {
      console.log(`Verbindungstyp: ${connectionType}`);
      if (connectionType === 'wifi') {
        setConnectionInfo('Sie sind mit einem WLAN verbunden.');
      } else if (connectionType === 'cellular') {
        setConnectionInfo('Sie nutzen Mobile Daten.');
      } else {
        setConnectionInfo('Bitte prüfen Sie vor dem Download, ob Sie Mobile Daten verwenden.');
      }
    } else {
      setConnectionInfo('Bitte prüfen Sie vor dem Download, ob Sie Mobile Daten verwenden.');
    }
  }, []);*/

  useEffect(() => {
    function updateConnectionInfo() {
      if ('connection' in navigator) {
        const connection = navigator.connection as NetworkInformation;
        const type = connection.type || 'unknown';
        const speed = connection.downlink || 0;

        let info = '';
        switch (type) {
          case 'wifi':
            info = 'Sie sind mit einem WLAN verbunden.';
            break;
          case 'ethernet':
            info = 'Sie sind mit einem LAN-Kabel verbunden.';
            break;
          case 'cellular':
            info = 'Sie nutzen Mobile Daten.';
            break;
          case 'none':
            info = 'Keine Verbindung verfügbar.';
            break;
          default:
            info = 'Bitte prüfen Sie vor dem Download, ob Sie Mobile Daten verwenden.';
        }

        dispatch(setConnectionInfo({
          connectionType: type,
          downloadSpeed: speed,
          connectionInfo: info
        }));
      } else {
        dispatch(setConnectionInfo({
          connectionType: 'unknown',
          downloadSpeed: 0,
          connectionInfo: 'Bitte prüfen Sie vor dem Download, ob Sie Mobile Daten verwenden.'
        }));
      }
    }

    updateConnectionInfo();

    if ('connection' in navigator) {
      const connection = navigator.connection as NetworkInformation;
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, [dispatch]);



  if (!navigator.onLine && !learnplace) {
    return (
      <>
        <div className="learnplace-page">
          <section>
            <h1>Lernort</h1>
            <div className="center-horizontally pt-14">
              <p>Sie sind offline und dieser Lernort wurde nicht heruntergeladen.</p>

              <Link to="/downloads" className="btn">
                Zu den Downloads
              </Link>
            </div>
          </section>
        </div>
      </>
    );
  }

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

      <div className="download-container">
        <div>{connectionInfo}</div>
        <div className="connection-details">
          {connectionType !== 'unknown' && `(${downloadSpeed} Mbps)`}
        </div>
        <DownloadToCacheButton url={learnplaceUrl} />
      </div>

    </div>
  );
}
