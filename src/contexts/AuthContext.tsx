import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { fetchUserProfile, logIn, logOut, signUp } from '@/services/auth.service'
import type { Role, UserProfile } from '@/types/user'

interface AuthContextValue {
  firebaseUser: User | null
  profile: UserProfile | null
  role: Role | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: Role) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Single subscription for the whole app — auth state is a global
    // singleton, so Context (not TanStack Query) is the natural fit here.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const userProfile = await fetchUserProfile(user)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await logIn(email, password)
  }

  const register = async (name: string, email: string, password: string, role: Role) => {
    const newProfile = await signUp(name, email, password, role)
    setProfile(newProfile)
  }

  const signOutUser = async () => {
    await logOut()
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        role: profile?.role ?? null,
        loading,
        isAuthenticated: !!firebaseUser,
        signIn,
        register,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
