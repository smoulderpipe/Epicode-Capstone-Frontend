# 🎯Focufy (frontend)

Questa repository contiene la parte frontend del progetto individuale "Focufy", che ho sviluppato per l'esame finale del corso full-stack developer di Epicode nel 2024.

Per la parte di backend di cui l'app necessita per funzionare, fare riferimento a questa repository:
 [Epicode-Capstone-Backend.](https://github.com/smoulderpipe/Epicode-Capstone-Backend)
## 📚 Che cosa è Focufy?

Focufy è un&#39;app motivazionale per studenti, pensata per aiutarli a conoscere meglio se stessi e a pianificare routine di studio in linea con i propri bisogni.

![Screenshot_24](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/44c3075b-e4ab-4305-a820-fc59628783c9)


## ✨ Funzionalità Principali

- **Registrazione, conferma, login, logout, recupero credenziali**: gli utenti devono registrarsi tramite email per utilizzare l’app, e possono richiedere una nuova password se dimenticata.
  
  ![Screenshot_23](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/e72218c0-dc32-49cf-a4cd-5e1911566b2a)
- **Questionario abitudini, personalità e obiettivi**: i nuovi utenti compilano un questionario, per permettere all’app di assegnare loro un avatar e obiettivi specifici.
  
  ![Screenshot_18](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/599895da-12a0-4052-9ab1-3edc9e42597a)
  ![Screenshot_29](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/2d311348-99c9-4f61-9b13-d278f3914513)

- **Creazione e gestione di piani di studio**: l’app genera un calendario personalizzato, basato sugli obiettivi del singolo utente e sull’avatar che gli è stato assegnato.
- **Sessioni**: ogni giorno di attività contiene sessioni di studio, riposo e divertimento per una routine bilanciata, e un mantra specifico per tenere alta la motivazione.

  ![Screenshot_16](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/7348e3a8-9446-4ef5-9a7d-e51ec5f5aef2)
- **Monitoraggio dei progressi**: gli utenti possono autovalutarsi periodicamente, monitorare i propri progressi e ottenere informazioni utili per bilanciare al meglio le energie.

  ![Screenshot_25](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/ca93d510-9339-4b61-95fc-6b30e7715ec0)


  ![Screenshot_28](https://github.com/smoulderpipe/Epicode-Capstone-Frontend/assets/48594331/7660e361-be69-46cd-97c4-8fd053b00cf1)

- **Restart**: se un utente cambia abitudini o non si sente più in linea con il proprio piano di studi, può cancellare i propri dati e ripetere l’esperienza a partire dal primo questionario.
- **Modifica credenziali**: gli utenti possono modificare la propria password e il proprio nome.





## 🛠️ Tecnologie Utilizzate

- **Angular 16.2**: Framework principale per lo sviluppo dell'interfaccia utente.
- **TypeScript 5.1.3**: Linguaggio di programmazione utilizzato per lo sviluppo.
- **HTML & SCSS**: Utilizzati per la struttura e lo stile delle pagine.
- **Bootstrap 5.2.3**: Framework CSS per il design reattivo.
- **RxJS 7.8.0**: Libreria per la programmazione reattiva.

## 🚀 Installazione e Configurazione
**Prerequisiti**

- Node.js (versione 14.x o superiore)
- npm (versione 6.x o superiore)
- Angular CLI (versione 12.x o superiore)

**Clona la repository**

	git clone https://github.com/smoulderpipe/Epicode-Capstone-Frontend.git

**Installa le dipendenze:**

    npm install

**Configura l&#39;ambiente:**

Modifica il file *environment.ts* dentro */src/environments*, sostituendo *“https://economic-emily-smoulderpipe-92a2c37b.koyeb.app”* con *“https://localhost:8080”*.

**Avvia l'applicazione**

    ng serve -o
L'app sarà disponibile all'indirizzo http://localhost:4200.

Se correttamente configurato durante la clonazione della parte backend del progetto, il server sarà disponibile all'indirizzo http://localhost:8080.



## 📂 Struttura del Progetto

- **src/app/components**: Contiene i componenti principali dell'app.
- **src/app/guards**: Contiene le guardie per controllare il collegamento con il backend e attivare le rotte in base allo stato di autenticazione dell’utente.
- **src/app/models**: Contiene le definizioni dei modelli di dati utilizzati nell'app.
- **src/app/modules**: Contiene i moduli per il routing e uno shared module.
- **src/app/validators**: Contiene un validatore custom per confrontare la password con la conferma della password, in fase di registrazione utente.
- **src/app/services**: Contiene i servizi per la comunicazione con il backend.
- **src/assets**: Contiene risorse statiche di tipo immagine.
- **src/environments**: Contiene i file di configurazione per l’ambiente di sviluppo.

## 🌐 Servizi

- **AUTH SERVICE** - Gestisce l'autenticazione degli utenti, inclusa la registrazione, la conferma, il login, il recupero del token dal backend, il logout, la richiesta di una nuova password e la modifica delle credenziali dell’utente.
- **SURVEY SERVICE** - Gestisce il recupero dal backend delle domande del questionario sulle abitudini, personalità e obiettivi.
- **ANSWER SERVICE** - Gestisce l'invio e il recupero delle risposte alle domande di ciascun questionario.
- **USER SERVICE** - Gestisce il recupero dell’avatar dell’utente dal backend e l’aggiornamento dell’obiettivo a lungo termine.
- **STUDY PLAN SERVICE** - Gestisce il recupero dello studyplan dal backend
- **MODAL SERVICE** - Gestisce dinamicamente il contenuto e lo stato delle modali.
- **FOOTER SERVICE** - Gestisce dinamicamente lo styling del footer.
- **LOADING SERVICE** - Gestisce dinamicamente il loader.

## 🏠 Componenti
- **HOME** - Visualizza una landing page che spiega brevemente cos’è l’app e invita l’utente a registrarsi.
- **SURVEY** - Gestisce la visualizzazione e guida la compilazione del questionario su abitudini, personalità e obiettivi dell’utente, gli mostra l’avatar che gli è stato assegnato in base alle risposte date e invia al backend la richiesta di generazione del piano di studi.
- **REGISTRATION / CONFIRM / LOGIN** - Gestiscono il processo di registrazione, conferma tramite link ricevuto per e-mail e login.
- **STUDY PLAN** - Si occupa della visualizzazione e della gestione del piano di studio dell’utente, incluse le attività, la compilazione dei questionari autovalutativi e la sincronizzazione con il calendario reale, e permette di resettare l’esperienza ripetendo il questionario iniziale.
- **PROFILE** - Visualizza l’avatar assegnato all’utente, calcola statistiche in base alle autovalutazioni inserite nel piano di studi, e permette di resettare l’esperienza ripetendo il questionario iniziale.
- **FORGOT PASSWORD** - Permette di richiedere l’invio di una nuova password per e-mail, se dimenticata.
- **CHANGE CREDENTIALS** - Permette la modifica delle proprie credenziali.
- **LOADER** - Migliora l’esperienza utente durante l’attesa.
- **MODAL** - Visualizza una modale dal contenuto specifico in base a dove compare (es. messaggi di successo o di errore).
- **SERVICE UNAVAILABLE** - Componente informativo. Si viene reindirizzati qui dalla home se il collegamento con il backend è disattivo o mal configurato.
