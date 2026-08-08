import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Homepage from './pages/Homepage'

// Code-split : seule la homepage (page d'entrée la plus fréquente) est chargée
// dans le bundle principal. Le reste ne se télécharge qu'à la navigation.
const Signup = lazy(() => import('./pages/Signup'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AllListings = lazy(() => import('./pages/AllListings'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Publish = lazy(() => import('./pages/Publish'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Points = lazy(() => import('./pages/Points'))
const Exchange = lazy(() => import('./pages/Exchange'))
const Profile = lazy(() => import('./pages/Profile'))
const Favorites = lazy(() => import('./pages/Favorites'))
const MyPoints = lazy(() => import('./pages/MyPoints'))
const AdminVerifications = lazy(() => import('./pages/AdminVerifications'))
const Accounting = lazy(() => import('./pages/Accounting'))
const LegalNotice = lazy(() => import('./pages/LegalNotice'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}

function RouteFallback() {
  return (
    <section style={{ paddingTop: '80px', textAlign: 'center' }}>
      <div className="wrap">
        <p className="section-note" style={{ maxWidth: 'none' }}>Chargement…</p>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/listings" element={<AllListings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/points" element={<Points />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/cgu" element={<Terms />} />
          <Route path="/confidentialite" element={<Privacy />} />

          <Route path="/exchange/:id" element={
            <ProtectedRoute>
              <Exchange />
            </ProtectedRoute>
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/publish" element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          } />

          <Route path="/listings/:id/edit" element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          } />

          <Route path="/favoris" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />

          <Route path="/mes-points" element={
            <ProtectedRoute>
              <MyPoints />
            </ProtectedRoute>
          } />

          <Route path="/admin/verifications" element={
            <ProtectedRoute>
              <AdminVerifications />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
