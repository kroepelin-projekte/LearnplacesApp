import { Link } from 'react-router-dom';
import {useEffect} from 'react';

export const StartPage = () => {

  useEffect(() => {
    fetch('https://fastly.jsdelivr.net/npm/zxing-wasm@2.1.0/dist/reader/zxing_reader.wasm')
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="start-page">
      <section>
        <h1>Willkommen in der Lernorte App</h1>
        <p>
          Erlaube zunächst deinem Browser den Standortzugriff, damit dich die Lernorte-WebApp zu den für dich freigeschaltenen Lernorten führen kann. Ohne diese Erlaubnis siehst du im Folgenden nur die Lernorte, aber nicht deinen eigenen Standort, was das Auffinden erschweren kann.
        </p>
        <p>
          Noch nie oder schon länger nicht mehr hier gewesen? Dann wirst du im nächsten Schritt noch über die Login-Maske deiner Institution geleitet.
        </p>

        <div className="center-horizontally mt-12">
          <Link to="/lernorte" className="btn">
            Zu den Lernorten
          </Link>
        </div>

        <div className="center-horizontally mt-12">
          <Link to="/how-to" className="btn">
            How To
          </Link>
        </div>

      </section>
    </div>
  );
}
