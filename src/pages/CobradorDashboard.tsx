import React, { useState } from 'react';
import { Search, DollarSign, X, Filter, Calendar, History } from 'lucide-react';
import { useData, calculateSchedule } from '../context/DataContext';
import './CobradorDashboard.css';

const CobradorDashboard = () => {
  const { loansDb, registerPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [plazoFilter, setPlazoFilter] = useState<string>('todos');
  const [showRouteOnly, setShowRouteOnly] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [amount, setAmount] = useState('');

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const todayDay = todayDate.getDay();

  const filteredClients = loansDb.filter(c => {
    const matchesSearch = c.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlazo = plazoFilter === 'todos' || c.prestamo.plazo === plazoFilter;
    
    if (showRouteOnly) {
      if (c.prestamo.plazo === 'diaria') return matchesSearch && matchesPlazo;
      if (c.prestamo.plazo === 'semanal') {
        return matchesSearch && matchesPlazo && c.prestamo.dia_cobro === todayDay;
      }
      const schedule = calculateSchedule(c);
      const dueToday = schedule.some(s => s.fecha === todayStr && s.estado !== 'Pagado');
      return matchesSearch && matchesPlazo && dueToday;
    }

    return matchesSearch && matchesPlazo;
  });

  const isDueToday = (client: any) => {
    const schedule = calculateSchedule(client);
    return schedule.some(s => s.fecha === todayStr && s.estado !== 'Pagado');
  };

  const handleOpenPayment = (client: any) => {
    setSelectedClient(client);
    setAmount('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    registerPayment(selectedClient.id, Number(amount));
    alert(`Pago de $${amount} registrado a ${selectedClient.cliente}`);
    setSelectedClient(null);
  };

  return (
    <div className="cobrador-dash">
      <div className="cobrador-filters">
        <div className="cobrador-search">
          <Search size={18} color="#999" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="plazo-filter">
          <Filter size={18} color="#999" />
          <select value={plazoFilter} onChange={(e) => setPlazoFilter(e.target.value)}>
            <option value="todos">Todos los plazos</option>
            <option value="diaria">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>

      <div className="route-toggle-section">
        <button 
          className={`toggle-btn ${showRouteOnly ? 'active' : ''}`}
          onClick={() => setShowRouteOnly(true)}
        >
          Mi Ruta (Hoy)
        </button>
        <button 
          className={`toggle-btn ${!showRouteOnly ? 'active' : ''}`}
          onClick={() => setShowRouteOnly(false)}
        >
          Todos los Clientes
        </button>
      </div>

      <div className="client-list-mobile">
        {todayDay === 0 && showRouteOnly ? (
          <div className="sunday-message" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: '#555' }}>Hoy es Domingo</h3>
            <p style={{ fontSize: '0.9rem' }}>Los domingos no se realizan cobros según la configuración del sistema.</p>
          </div>
        ) : filteredClients.map(client => {
          const dueToday = isDueToday(client);
          return (
            <div 
              key={client.id} 
              className={`client-card-mobile ${dueToday ? 'due-today' : 'not-due'}`}
            >
              <div className="client-info-mobile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3>{client.cliente}</h3>
                  {dueToday && <span className="tag-today">Hoy</span>}
                </div>
                <p>C.I: {client.cedula} • <span style={{textTransform:'capitalize'}}>{client.prestamo.plazo}</span></p>
              </div>
              <button className="btn-cobrar" onClick={() => handleOpenPayment(client)}>
                <DollarSign size={16} /> Cobrar
              </button>
            </div>
          );
        })}
        {filteredClients.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '2rem', color: '#666'}}>No se encontraron clientes.</p>
        )}
      </div>

      {/* Payment Modal */}
      {selectedClient && (
        <div className="modal-overlay-light" onClick={() => setSelectedClient(null)}>
          <div className="modal-content-light" onClick={e => e.stopPropagation()}>
            <div className="modal-header-light">
              <h2>Cobro a {selectedClient.cliente}</h2>
              <button style={{background:'none', border:'none'}} onClick={() => setSelectedClient(null)}>
                <X size={24} color="#666" />
              </button>
            </div>
            <form onSubmit={handleSubmitPayment}>
              <div className="form-group-light">
                <label>Cantidad Recibida ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="input-light" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-submit-light">
                Registrar Pago
              </button>
            </form>

            <div className="recent-payments-modal">
              <h3><History size={16} /> Historial Reciente</h3>
              {selectedClient.pagos_realizados.length > 0 ? (
                <div className="modal-payments-list">
                  {[...selectedClient.pagos_realizados].reverse().slice(0, 5).map((pago: any) => (
                    <div key={pago.id} className="modal-payment-item">
                      <span>{pago.fecha}</span>
                      <strong>${pago.monto.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-payments-text">No hay pagos registrados aún.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CobradorDashboard;
