import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Wallet, 
  BarChart3, 
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { path: '/admin', name: 'Resumen', icon: LayoutDashboard },
    { path: '/admin/clientes', name: 'Clientes', icon: Users },
    { path: '/admin/nuevo-prestamo', name: 'Nuevo Préstamo', icon: PlusCircle },
    { path: '/admin/pagos', name: 'Pagos', icon: Wallet },
    { path: '/admin/reportes', name: 'Reportes', icon: BarChart3 },
    { path: '/admin/chatbot', name: 'Asistente AI', icon: Bot },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && <h2 className="brand-name">PRESTA YA</h2>}
        <button onClick={toggleSidebar} className="toggle-btn" aria-label="Toggle Sidebar">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.name : ''}
            >
              <Icon size={24} className="nav-icon" />
              {isOpen && <span className="nav-text">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
