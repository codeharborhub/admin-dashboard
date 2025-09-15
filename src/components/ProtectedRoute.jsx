import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isAdmin } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        toast.error('Authentication error')
      } else if (session?.user) {
        if (isAdmin(session.user.email)) {
          setUser(session.user)
        } else {
          toast.error('Access denied. Admin privileges required.')
          await supabase.auth.signOut()
        }
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          if (isAdmin(session.user.email)) {
            setUser(session.user)
            toast.success('Welcome to Admin Dashboard!')
          } else {
            toast.error('Access denied. Admin privileges required.')
            await supabase.auth.signOut()
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute