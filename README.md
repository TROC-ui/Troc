# Troc — Réseau d'échange entre opticiens

Une plateforme B2B réservée aux opticiens pour échanger directement les montures invendues ("dead stock") sans repasser par le circuit classique fournisseur.

## 📋 Structure du projet

```
troc-app/
├── frontend/           # React + Vite (port 5173)
├── backend/            # Express.js (port 3000)
└── package.json        # Root package.json (monorepo)
```

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn
- PostgreSQL (local ou en ligne)

### 1. Cloner et installer

```bash
cd troc-app
npm install  # Installe les dépendances du frontend et backend
```

### 2. Configuration base de données

#### Option A : PostgreSQL local

```bash
# Créer une base de données PostgreSQL
createdb troc_db

# Copier le fichier .env.example et configurer la DATABASE_URL
cp backend/.env.example backend/.env
```

**Dans `backend/.env` :**
```
DATABASE_URL="postgresql://user:password@localhost:5432/troc_db"
JWT_SECRET="dev-secret-key-change-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

#### Option B : PostgreSQL online (Render.com - gratuit)

1. Créer un compte sur [Render.com](https://render.com)
2. Créer une PostgreSQL database (plan gratuit)
3. Copier l'URL de connexion dans `backend/.env`

### 3. Initialiser la base de données

```bash
cd backend
npx prisma migrate dev --name init
```

Cela crée les tables et lance Prisma Studio.

### 4. Lancer le projet

```bash
# Depuis la racine (troc-app/)
npm run dev

# Ou, dans deux terminaux séparés :
# Terminal 1 : Frontend
npm run frontend:dev

# Terminal 2 : Backend
npm run backend:dev
```

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:3000
- **API** : http://localhost:3000 (via proxy depuis le frontend)

---

## 📝 API Endpoints (Phase 1)

### Authentification

```
POST   /auth/signup          Créer un compte
POST   /auth/login           Se connecter
GET    /auth/me              Récupérer profil (protégé)
```

### Annonces

```
GET    /listings             Lister toutes les annonces
GET    /listings/:id         Détail d'une annonce
POST   /listings             Créer une annonce (protégé)
PUT    /listings/:id         Éditer une annonce (protégé)
DELETE /listings/:id         Supprimer une annonce (protégé)
```

### Échanges

```
GET    /exchanges            Lister les échanges de l'utilisateur (protégé)
GET    /exchanges/:id        Détail d'un échange (protégé)
POST   /exchanges            Proposer un échange (protégé)
PUT    /exchanges/:id/status Changer le statut (protégé)
```

### Utilisateurs

```
GET    /users/:id            Profil public d'un utilisateur
GET    /users/:id/reviews    Avis reçus par un utilisateur
GET    /users/:id/points     Points d'un utilisateur
PUT    /users/profile        Éditer mon profil (protégé)
```

---

## 🗄️ Schéma de la base de données

### Entités principales

- **users** : Profils des opticiens
- **verification** : Vérification ADELI/RPPS
- **listings** : Annonces de montures
- **photos** : Images des annonces
- **exchanges** : Échanges entre opticiens
- **messages** : Messagerie par échange
- **reviews** : Notation croisée
- **user_points** : Solde de points et historique

Voir `backend/prisma/schema.prisma` pour le détail complet.

---

## 🛠️ Outils utiles

### Prisma Studio (Explorer la DB)

```bash
cd backend
npx prisma studio
```

Ouvre une interface Web pour consulter et éditer les données.

### Vérifier les migrations

```bash
cd backend
npx prisma migrate status
```

---

## 📦 Dépendances

### Frontend

- **React 18** : UI
- **Vite** : Build tool
- **React Router v6** : Routing
- **Zustand** : State management
- **TanStack Query** : Data fetching
- **Socket.io** : Messages temps réel
- **React Hook Form** : Gestion des formulaires
- **Axios** : HTTP client

### Backend

- **Express.js** : Server
- **Prisma** : ORM
- **PostgreSQL** : Database
- **JWT** : Authentication
- **bcryptjs** : Password hashing
- **Socket.io** : Real-time messaging
- **CORS** : Cross-origin requests

---

## ✅ Checklist Phase 1

- [x] Structure du projet (monorepo)
- [x] Frontend React + Vite avec pages de base
- [x] Backend Express avec authentication
- [x] Prisma schema complet
- [x] Migrations de base de données
- [x] Routes API : auth, listings, exchanges, users
- [x] Middleware d'authentification
- [x] Socket.io setup (messagerie)
- [ ] ~~Tester localement~~ *À faire*

---

## 🔐 Sécurité

- Tokens JWT avec expiration 7 jours
- Passwords hachés avec bcrypt (10 rounds)
- CORS activé (à configurer en prod)
- Middleware d'authentification sur routes protégées

---

## 📚 Prochaines phases

**Phase 2** : Frontend complet + design system
**Phase 3** : Logique métier (points, échanges, messaging)
**Phase 4** : Tests, déploiement, production

---

## 🤝 Support

Voir le brief projet pour le contexte complet : `troc-opticiens-brief-projet.md`
