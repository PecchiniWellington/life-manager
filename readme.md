Utilizza Swift Package Manager per installare e gestire le dipendenze di Firebase.

In Xcode, con il progetto dell'app aperto, vai a File > Add Packages (File > Aggiungi pacchetti)
Quando richiesto, inserisci l'URL del repository dell'SDK Firebase per iOS:
https://github.com/firebase/firebase-ios-sdk
Seleziona la versione dell'SDK da utilizzare.
Consigliamo di utilizzare l'ultima versione dell'SDK, quella predefinita, ma è anche possibile usare una versione precedente, se necessario.

Scegli le librerie Firebase da utilizzare.
Assicurati di aggiungere FirebaseAnalytics. Invece, per Analytics senza la funzionalità di raccolta IDFA, aggiungi FirebaseAnalyticsWithoutAdId.