import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ListsPage from './pages/ListsPage'
import ListPage from './pages/ListPage'
import JoinPage from './pages/JoinPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join/:token" element={<JoinPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ListsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/list/:id"
        element={
          <ProtectedRoute>
            <ListPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
