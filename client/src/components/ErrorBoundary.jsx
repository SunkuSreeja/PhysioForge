import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[PhysioForge] Error boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 16,
          padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 360 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg,var(--teal),var(--blue))',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14,
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
