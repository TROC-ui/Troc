import { useEffect, useRef } from 'react'
import logoSrc from '../assets/logo-base64.txt?raw'

export default function GoldLogo3D({ size = 280 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const src = `data:image/png;base64,${logoSrc}`
    const layerCount = 26

    for (let i = 0; i < layerCount; i++) {
      const depth = i * 1.15
      const isFront = i === layerCount - 1
      const isBack = i === 0
      const layer = document.createElement('div')
      layer.className = 'layer' + (isFront ? ' front' : '') + (isBack ? ' back' : '')
      layer.style.transform = isBack
        ? 'translateZ(0px) rotateY(180deg)'
        : `translateZ(${depth}px)`

      if (isFront || isBack) {
        const img = document.createElement('img')
        img.src = src
        img.className = 'base'
        layer.appendChild(img)

        const gloss = document.createElement('div')
        gloss.className = 'gloss'
        applyMask(gloss, src)
        layer.appendChild(gloss)

        if (isFront) {
          const sheenMask = document.createElement('div')
          sheenMask.style.position = 'absolute'
          sheenMask.style.inset = '0'
          sheenMask.style.overflow = 'hidden'
          applyMask(sheenMask, src)
          const sheen = document.createElement('div')
          sheen.className = 'sheen'
          sheenMask.appendChild(sheen)
          layer.appendChild(sheenMask)
        }
      } else {
        // Couches intermédiaires = la tranche du médaillon, seule partie dorée.
        // Léger pic de luminosité au milieu de l'épaisseur pour un effet
        // métallique (reflet), plutôt qu'un dégradé plat brun-doré.
        const t = (i - 1) / (layerCount - 3)
        const shine = 1 - Math.abs(t - 0.5) * 2
        const stops = [
          { r: 138, g: 92, b: 18 },
          { r: 240, g: 185, b: 58 },
          { r: 255, g: 233, b: 160 },
        ]
        const end = shine < 0.5
          ? lerpColor(stops[0], stops[1], shine * 2)
          : lerpColor(stops[1], stops[2], (shine - 0.5) * 2)
        layer.style.background = `rgb(${end.r}, ${end.g}, ${end.b})`
        applyMask(layer, src)
      }
      container.appendChild(layer)
    }
  }, [])

  function lerpColor(a, b, t) {
    return {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    }
  }

  function applyMask(el, src) {
    el.style.webkitMaskImage = `url(${src})`
    el.style.maskImage = `url(${src})`
    el.style.webkitMaskSize = 'contain'
    el.style.maskSize = 'contain'
    el.style.webkitMaskRepeat = 'no-repeat'
    el.style.maskRepeat = 'no-repeat'
    el.style.webkitMaskPosition = 'center'
    el.style.maskPosition = 'center'
  }

  return (
    <div className="gold-logo-scene" style={{ width: size, height: size }}>
      <div className="gold-logo-glow" />
      <div className="logo-3d" ref={containerRef} />
    </div>
  )
}
