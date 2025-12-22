import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login'
import ForgotPasswordPage from '../pages/ForgotPassword'
import DashboardPage from '../pages/Dashboard'
import InventoryPage from '../pages/Inventory'
import PeoplePage from '../pages/People'
import TeamPage from '../pages/Team'
import UsersPage from '../pages/Users'
import SettingsPage from '../pages/Settings'
import ExemploPage from '../pages/Exemplo'
import AccessGroupsPage from '../pages/AccessGroups'
import SetPasswordPage from '../pages/SetPassword'
import RemetentesPage from '../pages/Remetentes'
import ComunicacoesPage from '../pages/Comunicacoes'
import CiclosPagamentoPage from '../pages/CiclosPagamento'
import ModalidadesRentabilidadePage from '../pages/ModalidadesRentabilidade'
import ParametrizacoesPage from '../pages/Parametrizacoes'
import RelationshipTypesPage from '../pages/RelationshipTypes'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import FilePreview from '../components/FilePreview'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        <Route path="/peoples" element={<PeoplePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/access/access-groups" element={<AccessGroupsPage />} />
        <Route path="/comunicacoes/remetentes" element={<RemetentesPage />} />
        <Route path="/comunicacoes/comunicacoes" element={<ComunicacoesPage />} />
        <Route path="/contratos/ciclos-pagamento" element={<CiclosPagamentoPage />} />
        <Route path="/contratos/modalidades-rentabilidade" element={<ModalidadesRentabilidadePage />} />
        <Route path="/cadastro/tipos-relacionamento" element={<RelationshipTypesPage />} />
        <Route path="/parametros/parametrizacoes" element={<ParametrizacoesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/exemplo" element={<ExemploPage />} />
      </Route>
      <Route
        path="/file-preview"
        element={
          <ProtectedRoute>
            <FilePreview />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes

