import { useCallback, useEffect, useState } from 'react'
import API from '../store/authStore'

export function useExchanges() {
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    return API.get('/exchanges')
      .then((res) => setExchanges(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Erreur de chargement des échanges :', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { exchanges, loading, refetch }
}
