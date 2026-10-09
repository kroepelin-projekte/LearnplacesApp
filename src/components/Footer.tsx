import { Navbar } from './Navbar.tsx';
import { useLocation } from 'react-router';
import {LearnplaceNavbar} from './learnplaceComponent/LearnplaceNavbar.tsx';
import {MapNavbar} from "./MapNavbar.tsx";

export const Footer = () => {
  const location = useLocation();
  let navbar;

  if (location.pathname.includes('/lernort/')) {
    navbar = <LearnplaceNavbar />;
  } else if (location.pathname.includes('/sammlung/') || location.pathname.includes('/tour/')) {
    navbar = <MapNavbar />;
  } else {
    navbar = <Navbar />;
  }

  return (
    <footer className="footer">
      {navbar}
    </footer>
  );
}
