import { NavLink } from 'react-router-dom';
import iconGroup from '../assets/images/nav_icons/group.svg';
import iconGroupActive from '../assets/images/nav_icons/group_active.svg';
import iconQuestion from '../assets/images/nav_icons/question.svg';
import iconQuestionActive from '../assets/images/nav_icons/question_active.svg';
import {BsDownload} from 'react-icons/bs';

export const Navbar = () => {

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  return (
    <nav className="navigation" onClick={vibrate}>
      <NavLink
        to="/lernorte"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconGroupActive : iconGroup} alt="lernorte" />
            <span>Lernorte</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/how-to"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconQuestionActive : iconQuestion} alt="how-to" />
            <span>How-To</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/downloads"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            {isActive ? <BsDownload size={28} /> : <BsDownload size={28} />}
            <span>Downloads</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

