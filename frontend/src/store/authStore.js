import { create } from 'zustand'
import axios from 'axios'

// En local, '/api' passe par le proxy Vite (voir vite.config.js) vers le
// backend sur localhost:3000. En production, frontend et backend sont sur
// deux domaines différents (Vercel / Render) : il faut alors une URL absolue,
// fournie via VITE_API_URL au moment du build.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
      API.defaults.headers.Authorization = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete API.defaults.headers.Authorization
    }
    set({ token })
  },

  signup: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await API.post('/auth/signup', data)
      const { token, user } = response.data
      set({ token, user, isAuthenticated: true })
      localStorage.setItem('token', token)
      API.defaults.headers.Authorization = `Bearer ${token}`
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await API.post('/auth/login', { email, password })
      const { token, user } = response.data
      set({ token, user, isAuthenticated: true })
      localStorage.setItem('token', token)
      API.defaults.headers.Authorization = `Bearer ${token}`
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    delete API.defaults.headers.Authorization
    set({ user: null, isAuthenticated: false, token: null })
  },

  fetchUser: async () => {
    try {
      const response = await API.get('/auth/me')
      set({ user: response.data })
      return response.data
    } catch (error) {
      localStorage.removeItem('token')
      delete API.defaults.headers.Authorization
      set({ isAuthenticated: false, token: null, user: null })
      throw error
    }
  },
}))

// Attacher le token au démarrage et recharger le profil réel depuis le
// serveur — sans ça, isAuthenticated reste vrai après un rafraîchissement
// mais `user` reste null, et l'UI retombe sur des données factices.
const token = localStorage.getItem('token')
if (token) {
  API.defaults.headers.Authorization = `Bearer ${token}`
  useAuthStore.getState().fetchUser().catch(() => {
    // token invalide/expiré : fetchUser gère déjà isAuthenticated=false
  })
}

export default API
