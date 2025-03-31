import { useState } from 'react';
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from '../state/store.ts';
import logo from '../assets/images/logo.svg';

export const Header = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const openModal = () => setShowModal(true);
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
                  <p>Möchten Sie sich wirklich abmelden?</p>
                  <div className="modal-actions">
                    <button onClick={confirmLogout} className="btn-confirm">
                      Ja
                    </button>
                    <button onClick={closeModal} className="btn-cancel">
                      Abbrechen
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