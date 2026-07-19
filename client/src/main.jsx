import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const appTree = (
  <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)

createRoot(document.getElementById('root')).render(
  PUBLISHABLE_KEY ? (
    // afterSignOutUrl matters on GitHub Pages: Clerk's default redirect is the
    // domain root "/", which is OUTSIDE the app's /CineSnap/ base path — users
    // signing out landed on GitHub's own 404 page. BASE_URL is "/" in dev and
    // "/CineSnap/" in the Pages build, so this stays correct in both.
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={import.meta.env.BASE_URL}
      signInFallbackRedirectUrl={import.meta.env.BASE_URL}
      signUpFallbackRedirectUrl={import.meta.env.BASE_URL}
    >
      {appTree}
    </ClerkProvider>
  ) : (
    appTree
  )
)
