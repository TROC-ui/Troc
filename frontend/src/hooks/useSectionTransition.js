import { useEffect, useRef, useState } from 'react'

export function useSectionTransition() {
  const ref = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Déclenchement précoce et définitif : un seuil de 60% obligeait à
    // scroller très profondément dans les longues sections avant qu'elles
    // n'apparaissent (effet de "page vide"), et l'absence de unobserve
    // pouvait les faire réapparaître en opacity:0 lors d'un scroll rapide.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, isActive]
}
