import { useEffect } from 'react'

const SITE_NAME = 'Troc'
const DEFAULT_DESCRIPTION = "Troc échange les montures optiques invendues directement entre boutiques d'opticiens — sans repasser par le fournisseur, sans brader en réserve."

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let tag = document.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

// Met à jour le titre d'onglet et les meta description/OG à chaque page —
// le site n'a pas de SSR, donc c'est purement côté client (n'aide pas un
// crawler qui n'exécute pas JS, mais couvre partage de lien + onglets).
export function useSEO(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Réseau d'échange entre opticiens`
    document.title = fullTitle

    const desc = description || DEFAULT_DESCRIPTION
    setMeta('description', desc)
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('og:type', 'website', 'property')
  }, [title, description])
}
