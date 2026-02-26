import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Teambuilder from './pages/Teambuilder/Teambuilder.jsx'
import Match from './pages/Match/Match.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Login from './pages/Login/Login.jsx'
import {ToastProvider} from './components/shared/ToastProvider.jsx'
import {getCurrentUser} from './services/authStore.js'

function ProtectedRoute({children, reqAdmin = false}) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (reqAdmin && !user.isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/teambuilder" element={<ProtectedRoute><Teambuilder /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute reqAdmin={true}><Admin /></ProtectedRoute>} />
          <Route path="/battle/:roomId" element={<ProtectedRoute><Match /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
