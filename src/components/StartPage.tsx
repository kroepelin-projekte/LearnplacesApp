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
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. At distinctio esse est, facere facilis, inventore laboriosam odio praesentium quam quasi reiciendis sapiente totam, veritatis. Atque!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. At distinctio esse est, facere facilis, inventore laboriosam odio praesentium quam quasi reiciendis sapiente totam, veritatis. Atque!
        </p>

        <div className="center-horizontally mt-12">
          <Link to="/lernorte" className="btn">
            Zu den Lernorten
          </Link>
        </div>

      </section>
    </div>
  );
}
