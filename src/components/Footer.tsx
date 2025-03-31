import { Navbar } from './Navbar.tsx';
import { useLocation } from 'react-router';
import {LearnplaceNavbar} from './learnplaceComponent/LearnplaceNavbar.tsx';

export const Footer = () => {

  const location = useLocation();

  return (
    <footer className="footer">
      {
        location.pathname.includes('/lernort/')
          ? <LearnplaceNavbar />
          : <Navbar />
      }
    </footer>
  );
}
