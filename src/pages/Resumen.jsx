import { DollarSign, Users, AlertTriangle, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Resumen.css';

const Resumen = () => {
  const { loansDb } = useData();

  const totalCapital = loansDb.reduce((acc, client) => acc + client.prestamo.monto, 0);
  const totalClientes = loansDb.length;

  return (
    <div className="resumen-container animate-fade-in">
      <header className="page-header">
        <h1>Resumen General</h1>
        <p>Visión general del estado actual de Presta Ya</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon bg-primary">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Capital Invertido</h3>
            <p className="stat-value">${totalCapital.toLocaleString()}</p>
            <span className="stat-trend positive">Datos en tiempo real</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon bg-accent">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Clientes Activos</h3>
            <p className="stat-value">{totalClientes}</p>
            <span className="stat-trend positive">En la base de datos</span>
          </div>
        </div>
      </section>

      <section className="alerts-section">
        <h2>Alertas Prioritarias</h2>
        <div className="alerts-grid">
          
          <div className="alert-card card warning">
            <div className="alert-header">
              <Clock size={20} className="icon-warning" />
              <h3>Próximos a vencer</h3>
            </div>
            <p className="alert-desc">Clientes que se acercan a su plazo máximo de 40 días para pagar.</p>
            <ul className="alert-list">
              <li>
                <span>Juan Pérez</span>
                <span className="badge warning-badge">Quedan 2 días</span>
              </li>
              <li>
                <span>María Gómez</span>
                <span className="badge warning-badge">Quedan 3 días</span>
              </li>
              <li>
                <span>Carlos Ruiz</span>
                <span className="badge warning-badge">Quedan 4 días</span>
              </li>
            </ul>
            <button className="btn-outline">Ver todos</button>
          </div>

          <div className="alert-card card danger">
            <div className="alert-header">
              <AlertTriangle size={20} className="icon-danger" />
              <h3>Cuota atrasada</h3>
            </div>
            <p className="alert-desc">Clientes que no han registrado su pago en los últimos 3 días.</p>
            <ul className="alert-list">
              <li>
                <span>Roberto Díaz</span>
                <span className="badge danger-badge">Atraso 4 días</span>
              </li>
              <li>
                <span>Ana Torres</span>
                <span className="badge danger-badge">Atraso 5 días</span>
              </li>
            </ul>
            <button className="btn-outline">Ver todos</button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Resumen;
