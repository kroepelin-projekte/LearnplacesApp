import {Outlet} from 'react-router-dom';
import {Fragment} from 'react';
import {Footer} from './Footer.tsx';
import {Header} from './Header.tsx';

export const Layout = () => {
  return (
    <Fragment>
      <Header/>
        <main>
          <div className="main-wrapper">
            <Outlet/>
          </div>
        </main>
      <Footer/>
    </Fragment>
  );
};