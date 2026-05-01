import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';

import Login from './pages/Login';
import Layout from './components/Layout';
import Resumen from './pages/Resumen';
import Clientes from './pages/Clientes';
import NuevoPrestamo from './pages/NuevoPrestamo';
import Pagos from './pages/Pagos';
import Reportes from './pages/Reportes';
import Asistente from './pages/Asistente';

import CobradorLayout from './layouts/CobradorLayout';
import CobradorDashboard from './pages/CobradorDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser } = useData();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/cobrador'} replace />;
  }
  return children;
};

function AppRoutes() {
  const { currentUser } = useData();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={currentUser ? `/${currentUser.role}` : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><Layout /></ProtectedRoute>}>
        <Route index element={<Resumen />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="nuevo-prestamo" element={<NuevoPrestamo />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="chatbot" element={<Asistente />} />
      </Route>

      {/* Cobrador Routes */}
      <Route path="/cobrador" element={<ProtectedRoute allowedRole="cobrador"><CobradorLayout /></ProtectedRoute>}>
        <Route index element={<CobradorDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <DataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </DataProvider>
  );
}

export default App;
