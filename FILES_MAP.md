# 🗺️ Map des fichiers — Troc Project

Guide rapide pour naviguer dans le projet.

---

## 📖 Documentation (lis d'abord)

```
├── QUICKSTART.md          ⚡ 5 min pour démarrer → COMMENCE ICI
├── SETUP.md               📋 Installation détaillée (si problèmes)
├── README.md              📚 Vue d'ensemble du projet
├── PHASE1_COMPLETE.md     ✅ Ce qui a été livré en Phase 1
├── PROGRESS.md            📊 Suivi du projet (phases 1-4)
└── FILES_MAP.md           🗺️ Ce fichier
```

**Ordre de lecture recommandé:**
1. `QUICKSTART.md` (5 min)
2. Si ça ne marche pas → `SETUP.md`
3. `README.md` pour comprendre l'archi
4. `PROGRESS.md` pour la roadmap

---

## 🎨 Frontend (React)

```
frontend/
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── index.html                     # Entry HTML
│
└── src/
    ├── main.jsx                   # React entry point
    ├── App.jsx                    # Routes + Protected routes
    ├── index.css                  # Global CSS (design system)
    │
    ├── components/
    │   ├── Layout.jsx             # Header, Nav, Footer (persistent)
    │   └── Layout.css
    │
    ├── pages/
    │   ├── Homepage.jsx           # Landing page (/)
    │   ├── Homepage.css
    │   ├── Signup.jsx             # Registration (/signup)
    │   ├── Login.jsx              # Login (/login)
    │   ├── Auth.css               # Shared auth styles
    │   ├── AllListings.jsx        # Listings (/listings)
    │   ├── AllListings.css
    │   ├── Dashboard.jsx          # Personal dashboard (/dashboard)
    │   └── Dashboard.css
    │
    └── store/
        └── authStore.js           # Zustand auth state + API calls
```

### Frontend : Où chercher?

- **Ajouter une page** → `src/pages/`
- **Ajouter un composant réutilisable** → `src/components/`
- **CSS global** → `src/index.css`
- **État auth** → `src/store/authStore.js`
- **Routes** → `src/App.jsx`

---

## 🔌 Backend (Express + Prisma)

```
backend/
├── package.json                   # Dependencies
├── .env.example                   # Template de configuration
│
├── prisma/
│   ├── schema.prisma              # 📊 DB SCHEMA (11 tables)
│   └── seed.js                    # Données de test
│
└── src/
    ├── server.js                  # Express + Socket.io server
    │
    ├── middleware/
    │   └── auth.js                # JWT verification
    │
    ├── services/
    │   └── authService.js         # Auth business logic
    │
    └── routes/
        ├── auth.js                # /auth endpoints
        ├── listings.js            # /listings endpoints
        ├── exchanges.js           # /exchanges endpoints
        └── users.js               # /users endpoints
```

### Backend : Où chercher?

- **Ajouter un endpoint** → `src/routes/`
- **Ajouter une table DB** → `backend/prisma/schema.prisma`
- **Modifier la DB** → `npx prisma migrate dev`
- **Voir les données** → `npx prisma studio`
- **Ajouter une route protégée** → Utiliser `verifyToken` middleware
- **Business logic** → `src/services/`

---

## 📊 Base de données (Prisma)

### Fichier clé : `backend/prisma/schema.prisma`

**9 tables principales:**

```prisma
model User           # Profils opticiens
model Verification   # Vérification ADELI
model Listing        # Annonces
model Photo          # Images des annonces
model Exchange       # Transactions
model Message        # Messagerie
model Review         # Notation
model UserPoints     # Solde de points
model PointTransaction # Historique points
```

**Utiliser:**
```bash
cd backend
npx prisma studio        # Interface graphique
npx prisma migrate dev   # Créer une migration
```

---

## ⚙️ Configuration

```
├── package.json                   # Root (monorepo)
├── .gitignore                     # Git ignore
│
├── backend/
│   ├── .env.example               # 👈 Copy-paste et édite pour .env
│   └── package.json
│
└── frontend/
    ├── vite.config.js             # Vite config
    └── package.json
```

### Configuration requise

**`backend/.env` (à créer à partir de `.env.example`):**
```env
DATABASE_URL="..."
JWT_SECRET="..."
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

---

## 🚀 Scripts à connaître

### Racine du projet (`npm run ...`)
```bash
npm run dev              # Démarre frontend + backend
npm run frontend:dev     # Frontend seulement
npm run backend:dev      # Backend seulement
npm run db:migrate       # Crée une migration DB
npm run db:studio        # Ouvre Prisma Studio
```

### Backend (`cd backend && npm run ...`)
```bash
npm run dev              # Node avec auto-reload
npm run seed             # Charge données de test
npx prisma studio       # Interface Web pour la DB
```

### Frontend (`cd frontend && npm run ...`)
```bash
npm run dev              # Vite dev server
npm run build            # Build pour production
npm run preview          # Preview de la build
```

---

## 🔐 Authentification

**Fichiers impliqués:**
- `backend/src/middleware/auth.js` — Middleware JWT
- `backend/src/services/authService.js` — Logic
- `backend/src/routes/auth.js` — Endpoints
- `frontend/src/store/authStore.js` — Frontend state

**Endpoints:**
```
POST   /auth/signup     Create account
POST   /auth/login      Login
GET    /auth/me         Current user (protected)
```

**Token storage:**
- Frontend: `localStorage` (token key)
- Backend: JWT Bearer token header

---

## 📡 API Endpoints Map

**Auth**
```
POST   /auth/signup              ✅ Create user
POST   /auth/login               ✅ Login
GET    /auth/me                  ✅ Get profile (protected)
```

**Listings**
```
GET    /listings                 ✅ List all
GET    /listings/:id             ✅ Get one
POST   /listings                 ✅ Create (protected)
PUT    /listings/:id             ✅ Update (protected)
DELETE /listings/:id             ✅ Delete (protected)
```

**Exchanges**
```
GET    /exchanges                ✅ List user's (protected)
GET    /exchanges/:id            ✅ Get one (protected)
POST   /exchanges                ✅ Propose (protected)
PUT    /exchanges/:id/status     ✅ Change status (protected)
```

**Users**
```
GET    /users/:id                ✅ Public profile
GET    /users/:id/reviews        ✅ User reviews
GET    /users/:id/points         ✅ User points
PUT    /users/profile            ✅ Update (protected)
```

---

## 🛠️ Outils & Services

### Local Development
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:3000
- **API proxy** : http://localhost:5173/api → http://localhost:3000
- **Prisma Studio** : http://localhost:5555

### External Services (à configurer)
- **Database** : PostgreSQL (local ou Render.com)
- **Images** : Cloudinary (Phase 2)
- **Email** : SendGrid (Phase 3)
- **Hosting** : Vercel (frontend), Render (backend) — Phase 4

---

## 🎯 Checklist de développement

### Avant de commencer
- [ ] Lire `QUICKSTART.md`
- [ ] Exécuter `npm install`
- [ ] Configurer `.env`
- [ ] Lancer `npm run dev`
- [ ] Tester l'inscription

### Avant Phase 2
- [ ] Comprendre `App.jsx` (routes)
- [ ] Comprendre `authStore.js` (state)
- [ ] Comprendre `backend/src/routes/`
- [ ] Prisma Schema (9 tables)

### Avant de ajouter une feature
- [ ] Est-ce une page? → Ajouter dans `pages/`
- [ ] Est-ce un endpoint API? → Ajouter dans `routes/`
- [ ] Est-ce une table DB? → Ajouter dans `schema.prisma`
- [ ] Y a-t-il un test? → Peut attendre Phase 4

---

## 🐛 Troubleshooting

**Problème** → **Fichier**
- Port occupé → SETUP.md (section lsof)
- DB ne se connecte pas → backend/.env
- Routes ne marchent pas → frontend/src/App.jsx
- API call échoue → frontend/src/store/authStore.js
- DB schema problème → backend/prisma/schema.prisma

---

## 📈 Progression recommandée

**Phase 1 (Actuellement)** ✅
- Setup complet
- Auth fonctionnelle
- API de base

**Phase 2** 📋
- `frontend/src/pages/` — Ajouter pages manquantes
- Intégrer Cloudinary dans upload
- Responsive design

**Phase 3** 📋
- Business logic dans `backend/src/services/`
- Points calculation
- Messaging avec Socket.io

**Phase 4** 📋
- Tests (`*.test.js`)
- Performance
- Déploiement

---

## 📞 Questions fréquentes

**Q : Où ajouter un nouvel endpoint?**  
A : `backend/src/routes/` + créer le fichier ou ajouter la route dans un fichier existant

**Q : Comment protéger une route?**  
A : Utiliser le middleware `verifyToken` de `backend/src/middleware/auth.js`

**Q : Comment modifier la DB?**  
A : Éditer `backend/prisma/schema.prisma`, puis `npx prisma migrate dev`

**Q : Où sont les données de test?**  
A : `backend/prisma/seed.js` — Lance avec `npm run seed`

**Q : Comment ajouter une nouvelle page?**  
A : Créer `frontend/src/pages/NewPage.jsx`, ajouter route dans `frontend/src/App.jsx`

---

## 🎓 Architecture résumée

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│  pages/ → components/ → store/ (Zustand) → styles  │
└──────────────────┬──────────────────────────────────┘
                   │ (HTTP + Socket.io)
┌──────────────────┴──────────────────────────────────┐
│                   Backend (Express)                 │
│  routes/ → services/ → middleware/ → Prisma ORM   │
└──────────────────┬──────────────────────────────────┘
                   │ (SQL)
┌──────────────────┴──────────────────────────────────┐
│              Database (PostgreSQL)                  │
│  11 tables (users, listings, exchanges, etc.)      │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Status

- ✅ Frontend : Prêt pour Phase 2
- ✅ Backend : Prêt pour Phase 2
- ✅ Database : Prêt pour Phase 2
- ✅ Documentation : Complète

**Next** : Phase 2 (Frontend pages + logique métier)

---

**Happy coding!** 🚀
