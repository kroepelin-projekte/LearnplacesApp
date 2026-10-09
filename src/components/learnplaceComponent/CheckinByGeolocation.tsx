import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState, store } from '../../state/store.ts';
import { isWithinRadius } from '../../utils/BlockVisibility.ts';

interface CheckinByGeolocationProps {
  learnplace: LearnplaceInterface;
}

export const CheckinByGeolocation = ({ learnplace }: CheckinByGeolocationProps) => {
  const [loading, setLoading] = useState(false);
  const [isWithinRange, setIsWithinRange] = useState(false);

  // Geolocation aus Redux holen
  const lat = useSelector((state: RootState) => state.geolocation.latitude);
  const lng = useSelector((state: RootState) => state.geolocation.longitude);

  useEffect(() => {
    if (lat && lng && learnplace.location) {
      const userPos = { lat, lng };
      const lpPos = {
        lat: learnplace.location.latitude,
        lng: learnplace.location.longitude
      };

      setIsWithinRange(isWithinRadius(lpPos, learnplace.location.radius, userPos));
    }
  }, [lat, lng, learnplace]);

  const handleCheckin = async () => {
    if (!isWithinRange || loading) return;

    setLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const accessToken = store.getState().auth.accessToken;

    try {
      const response = await fetch(`${apiBaseUrl}/learnplaces/${learnplace.id}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnplace_id: learnplace.id,
        })
      });

      if (response.ok) {
        // Reload and make confetti
        window.location.search = 'success=true';
      } else {
        console.error('Checkin fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler beim Checkin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (learnplace.visited) {
    return;
  }

  return (
    <div className="checkin-container mt-6">
      <button
        className={`btn ${!isWithinRange ? 'btn-disabled' : ''}`}
        onClick={handleCheckin}
        disabled={!isWithinRange || loading}
      >
        {loading ? 'Checke ein...' : 'Hier einchecken'}
      </button>

      {!isWithinRange && (
        <p className="text-sm mt-2 color-warning">
          Du bist noch zu weit entfernt, um einzuchecken.
        </p>
      )}
    </div>
  );
};