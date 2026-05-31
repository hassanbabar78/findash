import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { auth, db } from '../../firebase/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user
        
        // Update lastTimeLoggedIn
        await updateDoc(doc(db, 'users', user.uid), {
          lastTimeLoggedIn: serverTimestamp()
        })
        
        navigate('/dashboard')
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user

        // Create new user document in Firestore
        const userRole = formData.email === 'admin@gmail.com' ? 'admin' : 'user';
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          displayName: formData.name,
          currency_preference: 'USD',
          isVerified: false,
          role: userRole,
          lastTimeLoggedIn: serverTimestamp()
        })
        
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid-pattern"></div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-item floating-btc">₿</div>
          <div className="floating-item floating-eth">⟠</div>
          <div className="floating-item floating-sol">◎</div>
          <div className="floating-item floating-ada">₳</div>
        </div>

        {/* Glowing Orbs */}
        <div className="glowing-orb orb-1"></div>
        <div className="glowing-orb orb-2"></div>
        <div className="glowing-orb orb-3"></div>

        {/* Chart Lines */}
        <div className="chart-lines">
          <div className="chart-line line-1"></div>
          <div className="chart-line line-2"></div>
          <div className="chart-line line-3"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <span className="text-lg">←</span> Back to Findash
            </Link>
          </div>

          {/* Auth Card */}
          <div className="auth-card relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-black/80 backdrop-blur-2xl p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
            {/* Card Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-50"></div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-600 via-white to-gray-600 opacity-60"></div>

            {/* Header */}
            <div className="relative z-10 text-center mb-8">
              <div className="mb-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white text-2xl font-bold ring-2 ring-white/20">
                  F
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join Findash'}
              </h1>
              <p className="text-gray-400 text-lg">
                {isLogin ? 'Access your crypto dashboard' : 'Start tracking markets in real-time'}
              </p>
            </div>

            {/* Toggle */}
            <div className="relative z-10 flex rounded-2xl border border-white/20 bg-white/5 p-1 mb-8 backdrop-blur-sm">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {!isLogin && (
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="auth-input w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-white placeholder-gray-500 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-input w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-white placeholder-gray-500 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-white placeholder-gray-500 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="group">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="auth-input w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-white placeholder-gray-500 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit w-full rounded-2xl bg-white px-6 py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-gray-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Footer */}
            <div className="relative z-10 mt-8 text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white hover:text-gray-300 underline underline-offset-4 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}