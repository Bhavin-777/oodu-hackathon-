// Section 2 of the spec ("Target Users") — the four roles the platform
// supports. Stored as a plain field on the user's Firestore doc.

export const ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] as const
export type Role = (typeof ROLES)[number]

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: Role
  createdAt: string // ISO string
}
