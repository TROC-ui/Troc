// Logique pure de filtrage/tri des annonces, séparée du rendu pour rester
// testable indépendamment de React.

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'brand-asc', label: 'Marque (A→Z)' },
  { value: 'points-asc', label: 'Points (croissant)' },
  { value: 'points-desc', label: 'Points (décroissant)' },
]

export const DEFAULT_FILTER_STATE = {
  search: '',
  category: 'Tous',
  city: '',
  shape: [],
  material: [],
  style: [],
  tags: [],
  sort: 'recent',
}

// Le champ `tags` est stocké côté API comme une chaîne JSON (colonne texte
// SQLite) — on l'homogénéise ici en tableau, qu'il arrive déjà parsé ou non.
export function parseListingTags(tags) {
  if (Array.isArray(tags)) return tags
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function filterAndSortListings(listings, filterState = {}) {
  const {
    search = '',
    category = 'Tous',
    city = '',
    shape = [],
    material = [],
    style = [],
    tags = [],
    sort = 'recent',
  } = filterState

  const searchTerm = search.trim().toLowerCase()

  const filtered = (listings || []).filter((listing) => {
    const matchesSearch = searchTerm === '' || [listing.title, listing.brand, listing.reference]
      .some((field) => field?.toLowerCase().includes(searchTerm))

    const matchesCategory = category === 'Tous' || listing.typology === category
    const matchesCity = city === '' || listing.location === city
    const matchesShape = shape.length === 0 || shape.includes(listing.shape)
    const matchesMaterial = material.length === 0 || material.includes(listing.material)
    const matchesStyle = style.length === 0 || style.includes(listing.style)

    const listingTags = parseListingTags(listing.tags)
    const matchesTags = tags.length === 0 || tags.some((t) => listingTags.includes(t))

    return matchesSearch && matchesCategory && matchesCity && matchesShape && matchesMaterial && matchesStyle && matchesTags
  })

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'brand-asc':
        return (a.brand || '').localeCompare(b.brand || '', 'fr')
      // "Points" reprend la valeur indicative en euros : c'est déjà l'unité
      // utilisée par le reste de l'app pour chiffrer l'écart en points entre
      // deux annonces (1€ ≈ 1 point), il n'existe pas de champ points séparé.
      case 'points-asc':
        return (a.indicativeValue ?? 0) - (b.indicativeValue ?? 0)
      case 'points-desc':
        return (b.indicativeValue ?? 0) - (a.indicativeValue ?? 0)
      case 'recent':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })
}

export function countActiveSecondaryFilters(filterState) {
  return (filterState.shape?.length || 0)
    + (filterState.material?.length || 0)
    + (filterState.style?.length || 0)
    + (filterState.tags?.length || 0)
}

export function hasActiveFilters(filterState) {
  return Boolean(
    filterState.search?.trim()
    || (filterState.category && filterState.category !== 'Tous')
    || filterState.city
    || countActiveSecondaryFilters(filterState) > 0
  )
}
