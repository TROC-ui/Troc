import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useListings } from '../hooks/useListings'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import { useToastStore } from '../store/toastStore'
import { CATEGORIES, SHAPES, MATERIALS, STYLES } from '../constants/listingOptions'
import { DEFAULT_FILTER_STATE, SORT_OPTIONS, filterAndSortListings, countActiveSecondaryFilters, hasActiveFilters } from '../utils/filterListings'
import mascotteLunettes from '../assets/images/mascotte-lunettes.png'
import './AllListings.css'

const SECONDARY_GROUPS = [
  { key: 'shape', label: 'Forme', options: SHAPES },
  { key: 'material', label: 'Matière', options: MATERIALS },
  { key: 'style', label: 'Style', options: STYLES },
]

const PAGE_SIZE = 9

export default function AllListings() {
  useSEO('Toutes les annonces', "Les montures actuellement disponibles à l'échange entre opticiens du réseau Troc, filtrables par catégorie, forme, matière et style.")
  const { listings, loading } = useListings()
  const { isAuthenticated } = useAuthStore()
  const [filters, setFilters] = useState(DEFAULT_FILTER_STATE)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [gridRef, gridVisible] = useScrollReveal()
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  useEffect(() => {
    if (!isAuthenticated) return
    API.get('/listings/favorites/mine')
      .then((res) => setFavoriteIds(new Set(res.data.map((l) => l.id))))
      .catch(() => {})
  }, [isAuthenticated])

  const handleToggleFavorite = async (e, listingId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await API.post(`/listings/${listingId}/favorite`)
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (res.data.favorited) next.add(listingId)
        else next.delete(listingId)
        return next
      })
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || 'Erreur lors de la mise à jour des favoris', 'error')
    }
  }

  const filtered = useMemo(() => filterAndSortListings(listings, filters), [listings, filters])
  const secondaryCount = countActiveSecondaryFilters(filters)
  const filtersActive = hasActiveFilters(filters)

  // Un changement de filtre peut réduire drastiquement le nombre de
  // résultats : repartir de la page 1 évite de se retrouver sur une page
  // vide qui n'existe plus pour le nouveau jeu de résultats.
  useEffect(() => {
    setPage(1)
  }, [filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSecondary = (group, value) => {
    setFilters((prev) => {
      const current = prev[group]
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      return { ...prev, [group]: next }
    })
  }

  const handleReset = () => setFilters(DEFAULT_FILTER_STATE)

  return (
    <>
      <header className="hero" style={{ padding: '48px 0 30px' }}>
        <div className="wrap listings-hero-wrap">
          <div className="listings-hero-mascot">
            <img src={mascotteLunettes} alt="Mascotte Troc qui ajuste ses lunettes" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>Toutes les annonces.</h1>
            <div className="eyebrow">
              <Logo size="tiny" />
              <span>{listings.length} annonce{listings.length !== 1 ? 's' : ''} active{listings.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="hero-lede" style={{ maxWidth: '560px', marginBottom: 0 }}>
              Ce qui circule en ce moment entre opticiens du réseau, filtrable par catégorie, forme, matière et style.
            </p>
          </div>
        </div>
      </header>

      <section style={{ paddingTop: '40px' }}>
        <div className="wrap">
          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher une marque, une référence..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <select className="city-select" value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-secondary-bar">
            <div className="pill-choices">
              {['Tous', ...CATEGORIES].map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`pill-choice${filters.category === c ? ' active' : ''}`}
                  onClick={() => setFilters((prev) => ({ ...prev, category: c }))}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="filter-secondary-actions">
              <button
                type="button"
                className={`advanced-toggle${advancedOpen ? ' open' : ''}`}
                onClick={() => setAdvancedOpen((o) => !o)}
                aria-expanded={advancedOpen}
              >
                Filtres avancés
                {secondaryCount > 0 && <span className="advanced-toggle-count">{secondaryCount}</span>}
                <span className="advanced-toggle-chevron">{advancedOpen ? '▲' : '▼'}</span>
              </button>
              {filtersActive && (
                <button type="button" className="filter-reset" onClick={handleReset}>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {advancedOpen && (
            <div className="advanced-panel">
              {SECONDARY_GROUPS.map((group) => (
                <div key={group.key} className="advanced-group">
                  <div className="advanced-group-label">{group.label}</div>
                  <div className="advanced-group-options">
                    {group.options.map((option) => (
                      <label key={option} className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={filters[group.key].includes(option)}
                          onChange={() => toggleSecondary(group.key, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: '0' }}>
        <div className="wrap">
          {loading && (
            <div className="listings listings--wide">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <SkeletonBlock height="180px" style={{ marginBottom: '14px' }} />
                  <SkeletonBlock height="12px" width="60%" style={{ marginBottom: '8px' }} />
                  <SkeletonBlock height="16px" width="85%" />
                </div>
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="empty-listings">
              <p>Aucune annonce pour le moment.</p>
              <Link to="/publish" className="btn-primary">Publier la première annonce</Link>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <p className="results-count mono">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {!loading && listings.length > 0 && filtered.length > 0 && (
            <div ref={gridRef} className={`listings listings--wide reveal-section ${gridVisible ? 'reveal-visible' : ''}`}>
              {paginated.map((listing) => (
                <Link key={listing.id} to={`/listings/${listing.id}`} className="listing">
                  {isAuthenticated && (
                    <button
                      type="button"
                      className={`listing-favorite-toggle ${favoriteIds.has(listing.id) ? 'is-favorited' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, listing.id)}
                      aria-label={favoriteIds.has(listing.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      aria-pressed={favoriteIds.has(listing.id)}
                    >
                      {favoriteIds.has(listing.id) ? '★' : '☆'}
                    </button>
                  )}
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
          )}

          {!loading && filtered.length > PAGE_SIZE && (
            <div className="pagination">
              <button type="button" className="btn-ghost" onClick={() => setPage((p) => p - 1)} disabled={currentPage === 1}>
                ← Précédent
              </button>
              <span className="pagination-status mono">Page {currentPage} / {pageCount}</span>
              <button type="button" className="btn-ghost" onClick={() => setPage((p) => p + 1)} disabled={currentPage === pageCount}>
                Suivant →
              </button>
            </div>
          )}

          {!loading && listings.length > 0 && filtered.length === 0 && (
            <div className="empty-listings">
              <p>Aucune annonce ne correspond à ces critères.</p>
              {filtersActive && (
                <button type="button" className="btn-ghost" onClick={handleReset}>Réinitialiser les filtres</button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
