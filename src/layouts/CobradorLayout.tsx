import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';
import './CobradorLayout.css';

const CobradorLayout = () => {
  const { logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="cobrador-layout">
      <header className="cobrador-topbar">
        <h1>Cobranza Móvil</h1>
        <button className="cobrador-logout" onClick={handleLogout}>
          Salir <LogOut size={16} />
        </button>
      </header>
      <main className="cobrador-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CobradorLayout;
