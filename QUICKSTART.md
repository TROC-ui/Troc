# ⚡ Quick Start (5 minutes)

Tu es impatient ? Voici la version ultra-rapide.

## 1. Clone et installe

```bash
cd troc-app
npm install
```

## 2. Configure la base de données

```bash
cp backend/.env.example backend/.env
```

**Édite `backend/.env` :**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/troc_db"
JWT_SECRET="dev-secret-123"
```

Si tu n'as pas PostgreSQL :
- Utilise [Render.com](https://render.com) (gratuit)
- Copie l'URL de la DB dans `DATABASE_URL`

## 3. Initialise la DB

```bash
cd backend
npx prisma migrate dev --name init
```

Ferme Prisma Studio (Ctrl+C).

## 4. Démarre tout

```bash
cd ..  # Retour à la racine
npm run dev
```

## 5. Test immédiat

- Ouvre http://localhost:5173
- Clique "S'inscrire"
- Test : `test@example.com` / `password123`
- Tu arrives au dashboard ✅

---

## 🔧 Commandes principales

```bash
npm run dev                # Démarre frontend + backend
npm run frontend:dev       # Frontend seulement
npm run backend:dev        # Backend seulement

cd backend
npx prisma studio         # Voir la DB graphiquement
npm run seed              # Charger données de test
```

---

## 📚 Documentation complète

- **SETUP.md** — Installation détaillée (si ça ne marche pas)
- **README.md** — Vue d'ensemble du projet
- **PHASE1_COMPLETE.md** — Tout ce qui a été livré

---

## ✅ Checklist

- [ ] Node 18+ installé
- [ ] `npm install` exécuté
- [ ] `.env` configuré
- [ ] `npx prisma migrate dev` exécuté
- [ ] `npm run dev` fonctionne
- [ ] http://localhost:5173 accessible
- [ ] Inscription testée

Si tout est coché → **Tu es prêt pour Phase 2 ! 🚀**

---

## 🆘 Ça ne marche pas ?

1. Regarde **SETUP.md** (guide complet)
2. Ouvre DevTools (F12) et regarde la Console
3. Vérifie que PostgreSQL fonctionne
4. Vérifie que le `.env` est bon

C'est bon. À toi de jouer ! 🎯
