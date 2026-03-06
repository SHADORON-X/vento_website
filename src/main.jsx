import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import './styles/shop.css'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { SiteProvider } from './context/SiteContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteProvider>
          <Toaster position="top-center" richColors />
          <App />
        </SiteProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
