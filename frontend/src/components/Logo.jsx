import logoBase64 from '../assets/logo-base64.txt?raw'

export default function Logo({ size = 'small', className = '' }) {
  const sizes = {
    tiny: { width: '16px', height: 'auto' },
    small: { width: '32px', height: 'auto' },
    medium: { width: '64px', height: 'auto' },
    large: { width: '96px', height: 'auto' },
    fluid: { display: 'block', width: '100%', height: 'auto', opacity: 0.94 }
  }

  const style = sizes[size] || sizes.small

  return (
    <img
      src={`data:image/png;base64,${logoBase64}`}
      alt="Troc"
      className={className}
      style={style}
    />
  )
}
