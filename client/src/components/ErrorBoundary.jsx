import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error('App crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-[#03060c] text-white'>
          <div className='max-w-md text-center p-6'>
            <h1 className='text-2xl font-bold mb-2'>Oops! Something went wrong</h1>
            <p className='text-gray-400 mb-4'>The app encountered an error during startup.</p>
            <details className='text-left bg-white/10 p-4 rounded-lg mb-6 text-sm'>
              <summary className='cursor-pointer font-mono'>Error details</summary>
              <pre className='mt-2 overflow-auto text-xs text-gray-300'>{this.state.error?.toString()}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-2 bg-[#f84565] rounded-full hover:bg-[#D63854] transition font-semibold'
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
