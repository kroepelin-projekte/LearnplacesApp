import { NavLink } from 'react-router-dom';
import iconGroup from '../assets/images/nav_icons/group.svg';
import iconGroupActive from '../assets/images/nav_icons/group_active.svg';
import iconQuestion from '../assets/images/nav_icons/question.svg';
import iconQuestionActive from '../assets/images/nav_icons/question_active.svg';

export const Navbar = () => {
  return (
    <nav className="navigation">
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
    </nav>
  );
}

