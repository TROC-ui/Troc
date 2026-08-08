import { useState } from 'react'

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 5.14A10.9 10.9 0 0 1 12 5c6.5 0 10.5 7 10.5 7a17.4 17.4 0 0 1-3.87 4.55M6.6 6.6C3.4 8.6 1.5 12 1.5 12s4 7 10.5 7c1.36 0 2.6-.31 3.7-.83" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 10.1a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PasswordField({ label, name, value, onChange, placeholder = '••••••••', minLength, required = true, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <label>
      {label}
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          placeholder={placeholder}
          minLength={minLength}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          style={{ paddingRight: '44px' }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--paper-dim)',
          }}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  )
}
