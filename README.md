# Abitare — versione statica

Questa cartella è autonoma: contiene HTML, CSS, JavaScript, Three.js con licenza e piantina. Non richiede Node.js, npm, build, backend o CDN sul sito pubblicato.

## Pubblicazione su GitHub Pages

1. Copia tutto il contenuto di questa cartella nel repository, mantenendo la struttura dei file.
2. Puoi metterlo nella radice, in `docs`, oppure in una sottocartella della directory pubblicata.
3. Nelle impostazioni del repository, in **Pages**, configura la pubblicazione dal branch e dalla directory che contengono il sito.
4. Apri l'indirizzo del sito; se hai copiato la cartella intera nella radice pubblicata, aggiungi `/htmlVersion/` all'indirizzo.

Tutti i percorsi sono relativi: il sito funziona anche sotto il percorso di un repository o in una sottocartella. Conserva anche `assets/vendor/THREE-LICENSE.txt`. Il file `.nojekyll` è incluso per la pubblicazione statica quando questa cartella costituisce la radice del sito.

## Anteprima locale

Da questa cartella, con Python disponibile:

```powershell
python -m http.server 8000
```

Apri `http://localhost:8000`. Il server serve soltanto per l'anteprima: su GitHub Pages i file sono serviti direttamente dalla piattaforma. Il doppio clic su `index.html` (`file://`) non è supportato perché il progetto utilizza moduli JavaScript ES.

## Comandi

Su PC premi **ENTRA**, usa WASD e mouse per muoverti, Shift per accelerare, E per porte e interruttori ed Esc per il menu.

Su smartphone e tablet premi **ENTRA**, muoviti con il joystick in basso a sinistra e trascina sul resto della scena per guardarti intorno. Puoi usare le due dita contemporaneamente. Punta una porta o un interruttore con il mirino e tocca il pulsante in basso a destra. Tocca **Menu** per mettere in pausa. I controlli si azzerano quando lasci la pagina o ruoti lo schermo.

Il menu include giorno/notte, qualità grafica, reset e piantina. Su dispositivi con puntatore touch principale viene selezionata inizialmente la qualità Essenziale, modificabile dal menu. Sono supportati orientamento verticale e orizzontale. Richiede WebGL; le prestazioni dipendono dal dispositivo.

Questa è una copia indipendente del progetto: le modifiche ai file della versione principale non si propagano automaticamente qui.
