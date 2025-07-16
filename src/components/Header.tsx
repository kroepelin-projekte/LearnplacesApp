import { useState } from 'react';
import {FiLogOut, FiX} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from '../state/store.ts';
import logo from '../assets/images/logo.svg';
import { vibrate } from '../utils/Navigator.ts';

export const Header = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const openModal = () => {
    setShowModal(true);
    vibrate();
  };
  const closeModal = () => setShowModal(false);

  const confirmLogout = () => {
    setShowModal(false);
    navigate('/logout', { replace: true });
  };

  return (
    <header className="header">
      <div className="header-wrapper">
        <img src={logo} alt="Logo" className="header-logo" />

        {isAuthenticated ? (
          <>
            <button onClick={openModal} className="btn-logout">
              <FiLogOut size={30} />
            </button>

            {showModal && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal">
                  <div className="modal-actions">
                    <p>Möchten Sie sich wirklich abmelden?</p>

                    <button onClick={confirmLogout} className="btn full-width">
                      Abmelden
                    </button>
                    <button onClick={closeModal} className="btn-cancel">
                      <FiX size={30} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </header>
  );
}