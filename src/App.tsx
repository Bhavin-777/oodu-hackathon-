import { Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { VehiclesPage } from '@/pages/VehiclesPage'
import { DriversPage } from '@/pages/DriversPage'
import { TripsPage } from '@/pages/TripsPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { FuelExpensesPage } from '@/pages/FuelExpensesPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Everything below requires auth and renders inside the persistent
          Sidebar/Topbar shell via AppLayout's <Outlet/>. */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/fuel-expenses" element={<FuelExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}

export default App
