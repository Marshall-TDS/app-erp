import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login'
import DashboardPage from '../pages/Dashboard'
import InventoryPage from '../pages/Inventory'
import CustomersPage from '../pages/Customers'
import TeamPage from '../pages/Team'
import SettingsPage from '../pages/Settings'
import ExemploPage from '../pages/Exemplo'
import MainLayout from '../components/MainLayout'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/exemplo" element={<ExemploPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes

