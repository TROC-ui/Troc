// Test de bout en bout du parcours d'authentification.
// Lancer le backend (npm run dev) avant d'exécuter ce script : node test-auth-flow.js

const BASE_URL = 'http://localhost:3000'

let passed = 0
let failed = 0

function ok(label, condition, detail) {
  if (condition) {
    console.log(`✅ ${label}`)
    passed++
  } else {
    console.log(`❌ ${label}${detail ? ' — ' + detail : ''}`)
    failed++
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  let body = null
  try {
    body = await res.json()
  } catch {
    // pas de corps JSON
  }
  return { status: res.status, body }
}

async function run() {
  const email = `test-${Date.now()}@example.com`
  const password = 'motdepasse123'
  const shopName = 'Optique Test'

  console.log(`\n--- Parcours d'authentification (${email}) ---\n`)

  // 1. Inscription
  const signupRes = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, shopName }),
  })
  ok(
    '1. Inscription réussie (201/200 + token)',
    signupRes.status === 200 && !!signupRes.body?.token && signupRes.body?.user?.email === email,
    `status=${signupRes.status} body=${JSON.stringify(signupRes.body)}`
  )

  // Vérifie que le mot de passe est bien haché en base (jamais en clair)
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  const dbUser = await prisma.user.findUnique({ where: { email } })
  ok(
    '1b. Mot de passe stocké haché (jamais en clair)',
    !!dbUser && dbUser.password !== password && dbUser.password.startsWith('$2'),
    `hash=${dbUser?.password}`
  )

  // 2. Connexion
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  ok(
    '2. Connexion réussie (token JWT valide renvoyé)',
    loginRes.status === 200 && !!loginRes.body?.token && loginRes.body.token.split('.').length === 3,
    `status=${loginRes.status} body=${JSON.stringify(loginRes.body)}`
  )
  const token = loginRes.body?.token

  // 3. Accès à une route protégée avec le token
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  ok(
    '3. Accès route protégée avec token valide (profil récupéré)',
    meRes.status === 200 && meRes.body?.email === email,
    `status=${meRes.status} body=${JSON.stringify(meRes.body)}`
  )

  // 4a. Rejet sans token
  const noTokenRes = await request('/auth/me')
  ok(
    '4a. Rejet sans token (401)',
    noTokenRes.status === 401,
    `status=${noTokenRes.status} body=${JSON.stringify(noTokenRes.body)}`
  )

  // 4b. Rejet avec token invalide
  const badTokenRes = await request('/auth/me', {
    headers: { Authorization: 'Bearer ceci-nest-pas-un-token-valide' },
  })
  ok(
    '4b. Rejet avec token invalide (401)',
    badTokenRes.status === 401,
    `status=${badTokenRes.status} body=${JSON.stringify(badTokenRes.body)}`
  )

  // 5. Doublon d'inscription
  const dupRes = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, shopName }),
  })
  ok(
    "5. Refus d'un doublon d'inscription (même email)",
    dupRes.status === 400 && !!dupRes.body?.message,
    `status=${dupRes.status} body=${JSON.stringify(dupRes.body)}`
  )

  // 6. Mauvais mot de passe
  const wrongPassRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'mauvais-mot-de-passe' }),
  })
  ok(
    '6. Refus de connexion avec mauvais mot de passe (401)',
    wrongPassRes.status === 401,
    `status=${wrongPassRes.status} body=${JSON.stringify(wrongPassRes.body)}`
  )

  await prisma.$disconnect()

  console.log(`\n--- Résultat : ${passed} réussi(s), ${failed} échoué(s) ---\n`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Erreur inattendue pendant les tests :', err)
  process.exit(1)
})
