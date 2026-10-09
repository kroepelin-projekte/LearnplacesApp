import { NavLink } from 'react-router-dom';
import iconBack from '../assets/images/nav_icons/back.svg';
import iconBackActive from '../assets/images/nav_icons/back_active.svg';
import { vibrate } from '../utils/Navigator.ts';

export const MapNavbar = () => {
  return (
    <nav className="navigation" onClick={vibrate}>
      <NavLink
        to="/lernorte"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconBackActive : iconBack} height="30" alt="Zurück" />
            <span>Zurück</span>
          </>
        )}
      </NavLink>
      <div>asdf</div>
    </nav>
  );
}

