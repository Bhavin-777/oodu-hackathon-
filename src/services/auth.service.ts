import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { Role, UserProfile } from '@/types/user'

const usersCollection = 'users'

export async function signUp(name: string, email: string, password: string, role: Role) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const profile: UserProfile = {
    uid: credential.user.uid,
    email,
    name,
    role,
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, usersCollection, credential.user.uid), profile)
  return profile
}

export async function logIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logOut() {
  await signOut(auth)
}

export async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, usersCollection, user.uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
