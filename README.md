# art-shop

Piattaforma di ricerca e creazione di workshop nell'ambito artistico. Include ricerca in base alla geolocalizzazione, login e registrazione utenti, gestione della sessione tramite JWT, caching delle risposte del backend e server side rendering per il frontend.

I microservizi che verranno creati/utilizzati sono:
- Microservizi Backend sviluppati con FastAPI (Auth, Workshops, Bookmarks)
- Postgres database, uno per ogni microservizio Backend
- Servizio di API Gateway, sviluppato con FastAPI
- Redis, in-memory databse per caching delle request HTTP
- Servizio Frontend sviluppato con NextJS
- Grafana per il monitoraggio e logging dei container

Inoltre, verrà utilizzato docker e docker compose per la containerizzazione, verranno utilizzate le GitHub Actions per pipeline CI/CD, sarà effettuato il deploy dei microservizi su Heroku.
