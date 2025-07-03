import { NavLink } from 'react-router-dom';
import iconGroup from '../assets/images/nav_icons/group.svg';
import iconGroupActive from '../assets/images/nav_icons/group_active.svg';
import iconQuestion from '../assets/images/nav_icons/question.svg';
import iconQuestionActive from '../assets/images/nav_icons/question_active.svg';
import iconQrCode from '../assets/images/nav_icons/qr-code.svg';
import iconQrCodeActive from '../assets/images/nav_icons/qr-code_active.svg';
import {BsDownload} from 'react-icons/bs';
import { vibrate } from '../utils/Navigator.ts';

export const Navbar = () => {

  return (
    <nav className="navigation" onClick={vibrate}>
      <NavLink
        to="/lernorte"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconGroupActive : iconGroup} height="30" alt="lernorte" />
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
            <img src={isActive ? iconQuestionActive : iconQuestion} height="30" alt="how-to" />
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
            {isActive ? <BsDownload size={28} /> : <BsDownload size={30} />}
            <span>Downloads</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/scanner"
        className={({ isActive }) => (isActive ? "link active" : "link")}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? iconQrCodeActive : iconQrCode} height="30" alt="Scanner" />
            <span>Scanner</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

