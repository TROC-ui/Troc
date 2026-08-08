import './Skeleton.css'

export function SkeletonBlock({ width, height, radius = 12, style }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonText({ width = '100%', style }) {
  return <div className="skeleton-block skeleton-text" style={{ width, ...style }} />
}
