import { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../utils/apiBase'

export function useListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    return fetch(`${API_BASE}/listings`)
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erreur de chargement des annonces :', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { listings, loading, refetch }
}
