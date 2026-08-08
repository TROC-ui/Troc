import { useCallback, useRef, useState } from 'react'

export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef(null)

  // Ref-callback plutôt que useRef classique : sur les pages qui chargent
  // leurs données de façon asynchrone (affichage d'un état de chargement
  // avant le contenu réel), l'élément à observer n'existe pas encore au
  // montage du composant. Un useRef simple ne serait jamais réattaché une
  // fois l'élément apparu ; le ref-callback est rappelé par React à chaque
  // fois que le nœud DOM change, donc on peut (re)démarrer l'observation
  // au bon moment, même si l'élément apparaît plus tard.
  const setRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!node) return

    const start = () => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(node)
          }
        },
        { threshold: 0.15, ...options }
      )
      observer.observe(node)
      observerRef.current = observer
    }

    // Attend que les polices ET toutes les ressources (images) soient chargées
    // avant d'observer, pour éviter qu'une mise en page temporairement plus
    // courte (police de repli, images pas encore décodées) ne fasse croire à
    // l'observateur que des sections encore hors écran sont déjà visibles.
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
    const pageLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))

    Promise.all([fontsReady, pageLoaded]).then(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [setRef, isVisible]
}
