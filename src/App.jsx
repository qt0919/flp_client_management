import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import LeadForm from './pages/LeadForm'
import Pipeline from './pages/Pipeline'
import FollowUps from './pages/FollowUps'
import Templates from './pages/Templates'
import Reports from './pages/Reports'
import Tools from './pages/Tools'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="leads"          element={<Leads />} />
        <Route path="leads/new"      element={<LeadForm />} />
        <Route path="leads/:id"      element={<LeadDetail />} />
        <Route path="leads/:id/edit" element={<LeadForm />} />
        <Route path="pipeline"       element={<Pipeline />} />
        <Route path="followups"      element={<FollowUps />} />
        <Route path="templates"      element={<Templates />} />
        <Route path="reports"        element={<Reports />} />
        <Route path="tools"          element={<Tools />} />
      </Route>
    </Routes>
  )
}

