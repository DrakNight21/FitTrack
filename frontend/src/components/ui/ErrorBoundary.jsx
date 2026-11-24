import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F0E] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111715] border border-[#21302A] rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#B6F23A]/10 border border-[#B6F23A]/30 flex items-center justify-center mx-auto mb-5 text-[#B6F23A] text-2xl font-black">
              !
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected interface error occurred. You can reload the page or reset your session.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-[#0B0F0E] border border-red-500/20 rounded-xl text-left text-xs font-mono text-red-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-[#B6F23A] text-black hover:bg-[#a3dc31] transition-all cursor-pointer text-sm"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-[#17211D] border border-[#21302A] text-gray-300 hover:text-white hover:border-gray-500 transition-all cursor-pointer text-sm"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
