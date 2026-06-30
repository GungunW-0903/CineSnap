import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const appTree = (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  PUBLISHABLE_KEY ? (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {appTree}
    </ClerkProvider>
  ) : (
    appTree
  )
)
