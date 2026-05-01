import { useState, useMemo } from 'react';
import { Search, Star, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import './Pagos.css';

// Helper to add time to a date
const addTime = (dateStr, amount, unit) => {
  const d = new Date(dateStr);
  if (unit === 'dias') d.setDate(d.getDate() + amount);
  if (unit === 'meses') d.setMonth(d.getMonth() + amount);
  return d.toISOString().split('T')[0];
};

const calculateSchedule = (loanData) => {
  const { prestamo, pagos_realizados } = loanData;
  const montoTotal = prestamo.monto * (1 + prestamo.interes / 100);
  const montoPorCuota = montoTotal / prestamo.cuotas_totales;
  
  let schedule = [];
  let currentDate = prestamo.fecha_inicio;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 1; i <= prestamo.cuotas_totales; i++) {
    // Determine next date based on plazo
    if (prestamo.plazo === 'diaria') currentDate = addTime(currentDate, 1, 'dias');
    else if (prestamo.plazo === 'semanal') currentDate = addTime(currentDate, 7, 'dias');
    else if (prestamo.plazo === 'quincenal') currentDate = addTime(currentDate, 15, 'dias');
    else if (prestamo.plazo === 'mensual') currentDate = addTime(currentDate, 1, 'meses');

    const isPaid = i <= pagos_realizados.length;
    let estado = isPaid ? 'Pagado' : 'Pendiente';
    
    if (!isPaid && currentDate < today) {
      estado = 'Atrasado';
    }

    schedule.push({
      cuota: i,
      fecha: currentDate,
      monto: montoPorCuota,
      estado
    });
  }
  return schedule;
};

const getRatingDetails = (rating) => {
  if (rating <= 1) return { cls: 'rating-1', label: 'Cliente malo' };
  if (rating <= 2) return { cls: 'rating-2', label: 'Alto riesgo' };
  if (rating <= 3) return { cls: 'rating-3', label: 'Poco potencial' };
  if (rating <= 4) return { cls: 'rating-4', label: 'Buen cliente' };
  return { cls: 'rating-5', label: 'Cliente estupendo' };
};

const StarRating = ({ rating }) => {
  const { cls, label } = getRatingDetails(rating);
  return (
    <div className={`rating-container ${cls}`}>
      <div className="stars-wrapper">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={`star ${i < rating ? 'filled' : ''}`} />
        ))}
      </div>
      <span className={`rating-label ${cls}-text`}>{label}</span>
    </div>
  );
};

const Pagos = () => {
  const { loansDb } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Flatten payments to show in the main ledger
  const recentPayments = useMemo(() => {
    let payments = [];
    loansDb.forEach(client => {
      const schedule = calculateSchedule(client);
      // Solo tomamos los pagados para la tabla principal
      const paid = schedule.filter(s => s.estado === 'Pagado');
      paid.forEach(p => {
        payments.push({
          id: `${client.id}-${p.cuota}`,
          cliente_id: client.id,
          cliente: client.cliente,
          calificacion: client.calificacion,
          fecha: p.fecha,
          monto: p.monto
        });
      });
    });
    // Sort by descending date
    return payments.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [loansDb]);

  const filteredPagos = recentPayments.filter(pago => 
    pago.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (clienteId) => {
    const client = loansDb.find(c => c.id === clienteId);
    if (client) {
      client.schedule = calculateSchedule(client);
      setSelectedClient(client);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredPagos.map(p => ({
      "ID Pago": p.id,
      "Cliente": p.cliente,
      "Calificación (sobre 10)": p.calificacion,
      "Fecha de Pago": p.fecha,
      "Monto Recibido": p.monto
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");
    XLSX.writeFile(wb, "Historial_Pagos_PrestaYa.xlsx");
  };

  return (
    <div className="pagos-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Historial de Pagos</h1>
          <p>Registro de pagos recibidos e historial de clientes</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportExcel} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Download size={18} /> Exportar Excel
        </button>
      </header>

      <section className="search-section">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre del cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="pagos-content">
        <div className="pagos-table-container">
          <table className="pagos-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Calificación del Cliente</th>
                <th>Fecha de Pago</th>
                <th>Monto Recibido</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.length > 0 ? (
                filteredPagos.map((pago) => (
                  <tr key={pago.id} onClick={() => handleRowClick(pago.cliente_id)}>
                    <td className="client-name">{pago.cliente}</td>
                    <td>
                      <StarRating rating={pago.calificacion} />
                    </td>
                    <td>{pago.fecha}</td>
                    <td className="amount">${pago.monto.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', color: 'var(--text-muted)', padding: '3rem'}}>
                    No se encontraron pagos para ese cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Detalle y Próximos Pagos */}
      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Historial de Pagos - {selectedClient.cliente}</h2>
              <button className="close-btn" onClick={() => setSelectedClient(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="loan-summary">
                <div className="summary-item">
                  <h5>Préstamo</h5>
                  <p>${selectedClient.prestamo.monto.toLocaleString()}</p>
                </div>
                <div className="summary-item">
                  <h5>Interés</h5>
                  <p>{selectedClient.prestamo.interes}%</p>
                </div>
                <div className="summary-item">
                  <h5>Plazo</h5>
                  <p style={{textTransform: 'capitalize'}}>{selectedClient.prestamo.plazo}</p>
                </div>
                <div className="summary-item">
                  <h5>Calificación</h5>
                  <StarRating rating={selectedClient.calificacion} />
                </div>
              </div>

              <h3 style={{marginBottom: '1rem', fontSize: '1.2rem'}}>Cronograma de Cuotas</h3>
              <div className="schedule-list">
                {selectedClient.schedule.map((cuota) => (
                  <div key={cuota.cuota} className={`schedule-item ${cuota.estado.toLowerCase()}`}>
                    <div className="schedule-info">
                      <span className="cuota-number">Cuota {cuota.cuota} de {selectedClient.prestamo.cuotas_totales}</span>
                      <span className="cuota-date">Vencimiento: {cuota.fecha}</span>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div className="cuota-amount">${cuota.monto.toFixed(2)}</div>
                      <span className={`status-badge ${cuota.estado.toLowerCase()}`}>
                        {cuota.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pagos;
