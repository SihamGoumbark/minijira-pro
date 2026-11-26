
# Mini-Jira Pro — Plateforme de Gestion de Projet Agile

Application web Full-Stack de gestion de projet inspirée de **Jira**, permettant de gérer des projets Agiles, des Sprints Scrum, un tableau Kanban interactif, la collaboration d'équipe en temps réel et des tableaux de bord analytiques.

---

## Fonctionnalités Principales

- **Authentification & Sécurité (JWT + RBAC)** : Inscription, connexion sécurisée avec Spring Security et gestion des rôles (`ADMIN` / `DEVELOPER`).
- **Gestion Multi-Projets & Équipe** : Création de projets avec clés uniques (ex. `MJP`), invitation de collaborateurs par email et contrôle d'accès par projet.
- **Backlog & Sprints Scrum** : Création et démarrage de Sprints (`PLANNING`, `ACTIVE`, `COMPLETED`), estimation en Story Points et affectation des tickets.
- **Tableau Kanban (Board)** : Suivi visuel des tickets (`TODO`, `IN_PROGRESS`, `DONE`), filtres multicritères (recherche, type `EPIC / STORY / TASK / BUG`, priorité) et commentaires par ticket.
- **Synchronisation Temps Réel (WebSockets)** : Flux d'activité en direct et mise à jour automatique entre les membres connectés via STOMP / SockJS.
- **Rapports & Analytics Agile** : Calcul de la vélocité, taux d'avancement, répartition par statut/priorité et charge de travail par développeur.

---

## Stack Technique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, Recharts, Lucide Icons, `@stomp/stompjs` |
| **Backend** | Java 17+, Spring Boot 3, Spring Security (JWT), Spring Data JPA, WebSocket (STOMP) |
| **Base de données** | PostgreSQL 17 |
| **Conteneurisation** | Docker, Docker Compose, Nginx |

---

## Installation & Lancement

### Option 1 : Avec Docker Compose (Recommandé)

```bash
git clone https://github.com/SihamGoumbark/minijira-pro.git
cd minijira-pro
docker compose up -d --build

```

* **Frontend (Application)** : `http://localhost:3000`
* **Backend (API REST)** : `http://localhost:8080`

### Option 2 : En mode développement local

1. **Base de données** : Créer une base PostgreSQL nommée `minijira`.
2. **Backend (Spring Boot)** :
```bash
cd backend
./mvnw spring-boot:run

```


3. **Frontend (React)** :
```bash
cd frontend
npm install
npm run dev
```
## 📄 Documentation & Démonstration

- 📘 **[Télécharger / Consulter le Rapport de Projet (PDF)](./Rapport_Minijira_pro.pdf)**

*(Note : Si l'aperçu intégré de GitHub ne s'affiche pas directement, cliquez simplement sur le bouton **Download** (`⤓`) ou **View raw** en haut à droite de la page du fichier pour l'ouvrir.)*
