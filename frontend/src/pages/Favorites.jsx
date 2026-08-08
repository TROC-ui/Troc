import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import API from '../store/authStore'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import './Favorites.css'

export default function Favorites() {
  useSEO('Mes favoris', 'Les annonces et confrères que vous suivez sur le réseau Troc.')
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      API.get('/listings/favorites/mine').then((res) => res.data).catch(() => []),
      API.get('/users/favorites/mine').then((res) => res.data).catch(() => []),
    ]).then(([listingsData, profilesData]) => {
      setListings(listingsData)
      setProfiles(profilesData)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to="/dashboard">Mon espace</Link> <span>/</span> Favoris
          </div>
        </div>
      </section>

      <header className="hero" style={{ paddingBottom: '30px' }}>
        <div className="wrap">
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Favoris</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>Ce que vous suivez.</h1>

          <div className="favorites-tabs">
            <button type="button" className={`pill-choice ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
              Annonces {!loading && `(${listings.length})`}
            </button>
            <button type="button" className={`pill-choice ${tab === 'profiles' ? 'active' : ''}`} onClick={() => setTab('profiles')}>
              Confrères {!loading && `(${profiles.length})`}
            </button>
          </div>
        </div>
      </header>

      <section style={{ paddingTop: '0' }}>
        <div className="wrap">
          {loading && (
            <div className="listings listings--wide">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <SkeletonBlock height="180px" style={{ marginBottom: '14px' }} />
                  <SkeletonBlock height="12px" width="60%" style={{ marginBottom: '8px' }} />
                  <SkeletonBlock height="16px" width="85%" />
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'listings' && (
            listings.length === 0 ? (
              <div className="empty-listings">
                <p>Aucune annonce en favori pour le moment.</p>
                <Link to="/listings" className="btn-primary">Parcourir les annonces</Link>
              </div>
            ) : (
              <div className="listings listings--wide">
                {listings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="listing">
                    {listing.photos?.[0]?.url ? (
                      <div className="thumb thumb--photo">
                        <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                      </div>
                    ) : (
                      <div className="thumb" />
                    )}
                    <div className="meta">TROC · {(listing.location || 'VILLE NON PRÉCISÉE').toUpperCase()}</div>
                    <div className="title">{listing.title}</div>
                    <div className="sub">{listing.searchingFor || 'Ouvert à toute proposition'}</div>
                  </Link>
                ))}
              </div>
            )
          )}

          {!loading && tab === 'profiles' && (
            profiles.length === 0 ? (
              <div className="empty-listings">
                <p>Aucun confrère en favori pour le moment.</p>
                <Link to="/listings" className="btn-primary">Parcourir les annonces</Link>
              </div>
            ) : (
              <div className="favorite-profiles">
                {profiles.map((profile) => (
                  <Link key={profile.id} to={`/profile/${profile.id}`} className="favorite-profile-card">
                    <div className="seller-avatar" />
                    <div>
                      <div className="seller-name">{profile.shopName}</div>
                      <div className="seller-sub mono">{profile.address || 'Zone non précisée'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  )
}
