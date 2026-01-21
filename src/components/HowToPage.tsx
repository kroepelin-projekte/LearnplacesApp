export const HowToPage = () => {
  return (
    <div className="howto-page">
      <section>
        <h1>Wie funktioniert die Lernorte App</h1>

        <ol className="howto-list fade-in">
          <li>
            Unter „Lernorte“ findest du eine Übersicht aller für dich freigegebenen Touren oder Sammlungen. Du kannst diese nach Tags filtern oder durchsuchen.
          </li>
          <li>
            Hast du eine Tour oder Sammlung ausgewählt, öffne den ersten Lernort. Im Menü in der Fußleiste erscheint nun „Map“: hier bekommst du den Lernort und deinen eigenen Standort angezeigt. Du siehst deinen eigenen Standort nicht? Schau nach, ob du den Standortzugriff deines Browsers erlaubt hast. Am Lernort angekommen? Lade die Beschreibung nochmal neu, um ggf. erst dort freigeschaltene Materialien zu sehen.
          </li>
          <li>
            Liegen die Lernorte zu nah beieinander für eine sinnvolle GPS-Navigation (z.B. in Innenräumen) funktioniert das nicht. Nutze in diesem Fall den auf der Übersichtsseite angezeigten Scanner, um Lernorte-QR-Codes vor Ort zu scannen. Auch diese Aktion öffnet die zu einem Lernort gehörenden Materialien.
          </li>
          <li>
            Der besuchte Lernort wird nun in der Übersicht mit einem Häkchen markiert angezeigt.
          </li>
          <li>
            Du befürchtest Funklöcher oder hast nur ein geringes Datenvolumen, dafür aber genügend Speicherplatz auf deinem Mobilgerät? Dann kannst du die Materialien der einzelnen Lernorte auch vorab herunterladen und die WebApp im Offline-Modus benutzen. Den Download-Button findest du nach dem Öffnen eines Lernorts ganz unten auf der Seite.
          </li>
          <li>
            Viel Spaß & Erkenntnis an deinen Lernorten!
          </li>
        </ol>

      </section>
    </div>
  );
}
