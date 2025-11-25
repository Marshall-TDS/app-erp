import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login'
import DashboardPage from '../pages/Dashboard'
import InventoryPage from '../pages/Inventory'
import CustomersPage from '../pages/Customers'
import TeamPage from '../pages/Team'
import UsersPage from '../pages/Users'
import SettingsPage from '../pages/Settings'
import ExemploPage from '../pages/Exemplo'
import AccessGroupsPage from '../pages/AccessGroups'
import SetPasswordPage from '../pages/SetPassword'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/account/set-password" element={<SetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/access/user-groups" element={<AccessGroupsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/exemplo" element={<ExemploPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes

