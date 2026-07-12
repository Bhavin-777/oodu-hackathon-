import { QueryClient } from '@tanstack/react-query'

// Central query client. Firestore reads go through TanStack Query so every
// entity (vehicles, drivers, trips, ...) gets consistent caching, loading
// states, and refetch-on-mutation behavior without hand-rolled state.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
