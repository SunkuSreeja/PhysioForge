import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { PWAProvider } from './context/PWAContext'
import ErrorBoundary from './components/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <PWAProvider>
          <App />
        </PWAProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
