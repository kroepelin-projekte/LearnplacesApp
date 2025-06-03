import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router';
import { vibrate } from '../../utils/Navigator.ts';
import iconBack from '../../assets/images/nav_icons/back.svg';
import iconBackActive from '../../assets/images/nav_icons/back_active.svg';
import iconSingleLearnplace from '../../assets/images/nav_icons/single-learnplace.svg';
import iconSingleLearnplaceActive from '../../assets/images/nav_icons/single-learnplace_active.svg';
import iconMap from '../../assets/images/nav_icons/map.svg';
import iconMapActive from '../../assets/images/nav_icons/map_active.svg';

export const LearnplaceNavbar = () => {
  const { id } = useParams();

  return (
    <nav className="navigation" onClick={vibrate}>
      <NavLink
        to="/lernorte"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconBackActive : iconBack} alt="zurück zur Übersicht" />
            <span></span>
          </>
        )}
      </NavLink>
      <NavLink
        to={`/lernort/${id}`}
        end
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconSingleLearnplaceActive : iconSingleLearnplace} alt="Lernort" />
            <span>Lernort</span>
          </>
        )}
      </NavLink>
      <NavLink
        to={`/lernort/${id}/map`}
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconMapActive : iconMap} alt="Karte" />
            <span>Map</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
