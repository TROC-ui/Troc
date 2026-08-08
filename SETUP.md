# 🚀 Guide d'installation complet — Troc

Suive ce guide étape par étape pour configurer le projet localement.

## Étape 1️⃣ : Prérequis

Avant de commencer, assure-toi d'avoir :

- **Node.js 18+** → [Télécharger](https://nodejs.org/)
- **npm** (inclus avec Node.js)
- **PostgreSQL** (local ou en ligne)

Vérifier l'installation :
```bash
node --version   # doit être v18+
npm --version    # doit être 9+
```

---

## Étape 2️⃣ : Cloner et installer

```bash
# Naviguer dans le dossier du projet
cd troc-app

# Installer toutes les dépendances (frontend + backend)
npm install

# Cela va installer :
# - Dependencies du frontend dans frontend/node_modules
# - Dependencies du backend dans backend/node_modules
```

---

## Étape 3️⃣ : Configurer la base de données

### Option A : PostgreSQL local (macOS/Linux)

```bash
# Installer PostgreSQL (macOS avec Homebrew)
brew install postgresql

# Démarrer le service PostgreSQL
brew services start postgresql

# Créer la base de données
createdb troc_db

# Vérifier la connexion
psql troc_db
```

Si c'est Windows ou tu veux installer autrement : [Guide PostgreSQL](https://www.postgresql.org/download/)

### Option B : PostgreSQL en ligne (recommandé pour commencer)

1. Crée un compte gratuit sur [Render.com](https://render.com)
2. Crée une **PostgreSQL Database** (free tier)
3. Copie l'URL de connexion (exemple : `postgresql://user:password@db.render.com:5432/dbname`)

---

## Étape 4️⃣ : Créer le fichier `.env` du backend

```bash
# Depuis la racine du projet
cp backend/.env.example backend/.env
```

Puis édite `backend/.env` :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/troc_db"

# JWT (change en production)
JWT_SECRET="dev-key-change-in-production-12345"

# Server
PORT=3000
NODE_ENV=development

# Frontend (pour CORS)
FRONTEND_URL="http://localhost:5173"

# Cloudinary (optionnel, à configurer plus tard)
CLOUDINARY_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# SendGrid (optionnel, à configurer plus tard)
SENDGRID_API_KEY=""
```

---

## Étape 5️⃣ : Initialiser la base de données

```bash
# Depuis le dossier backend/
cd backend

# Créer la structure de la DB selon le schema Prisma
npx prisma migrate dev --name init

# Cela va :
# ✅ Créer les tables PostgreSQL
# ✅ Ouvrir Prisma Studio (interface graphique)

# Ferme Prisma Studio avec Ctrl+C quand tu as fini
```

---

## Étape 6️⃣ : Lancer le projet

Depuis la **racine** (`troc-app/`), lance :

```bash
npm run dev
```

Cela démarre automatiquement :
- **Frontend** sur http://localhost:5173
- **Backend** sur http://localhost:3000

### Ou lancer séparément (dans deux terminaux)

**Terminal 1 — Frontend :**
```bash
npm run frontend:dev
```

**Terminal 2 — Backend :**
```bash
npm run backend:dev
```

---

## Étape 7️⃣ : Tester

### Ouvrir le frontend
Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

Tu devrais voir :
- Page d'accueil avec sections "Comment ça marche"
- Boutons "S'inscrire" et "Connexion"

### Tester l'authentification

1. Clique sur **"S'inscrire"**
2. Remplis :
   - Nom boutique : `Optique Test`
   - Email : `test@example.com`
   - Mot de passe : `password123`
3. Clique **"S'inscrire"**

Si ça fonctionne, tu seras redirigé vers le dashboard.

### Tester la base de données (Prisma Studio)

```bash
cd backend
npx prisma studio
```

Cela ouvre une interface Web sur http://localhost:5555 où tu peux voir et éditer les données directement.

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "ECONNREFUSED :: 5432" (Database connection failed)
- Vérifie que PostgreSQL est bien lancé
- Vérifie la DATABASE_URL dans `.env`
- Essaie d'utiliser Render.com au lieu d'une BD locale

### "Failed to fetch" quand je clique sur un bouton
- Ouvre les DevTools (F12)
- Regarde l'onglet Console pour les erreurs
- Vérifie que le backend est bien lancé (`npm run backend:dev`)

### Port 3000 ou 5173 déjà utilisé
```bash
# Voir quel processus utilise le port
lsof -i :3000    # ou :5173

# Tuer le processus
kill -9 <PID>
```

---

## ✅ Checklist post-installation

- [ ] Node.js 18+ installé
- [ ] `npm install` exécuté (0 errors)
- [ ] PostgreSQL configuré et `.env` créé
- [ ] `npx prisma migrate dev` exécuté
- [ ] `npm run dev` démarre frontend ET backend
- [ ] http://localhost:5173 s'ouvre correctement
- [ ] Inscription fonctionne (test créé dans la DB)

---

## 📚 Prochaines étapes

Une fois que tout fonctionne :

1. **Explorer Prisma Studio** : Voir les données créées
2. **Lire le README.md** : Aperçu du projet
3. **Consulter le plan de phase** : Quoi construire ensuite

---

## 🆘 Questions ?

- Regarde le README.md pour l'API complète
- Consulte le brief du projet : `troc-opticiens-brief-projet.md`
- Erreurs ? → Ouvre DevTools (F12) et Console

Bon courage ! 🚀
