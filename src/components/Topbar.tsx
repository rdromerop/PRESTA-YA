import { Bell, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './Topbar.css';

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      <div className="topbar-actions">
        <button className="icon-btn notification-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <button 
          className="icon-btn" 
          onClick={handleLogout} 
          title="Cerrar Sesión"
          style={{ color: 'var(--danger-light)' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
