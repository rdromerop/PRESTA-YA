import { useState } from 'react';
import { Search, User, CreditCard, Phone, Clock, DollarSign, FileText, MessageCircle } from 'lucide-react';
import { useData, calculateSchedule } from '../context/DataContext';
import { Cliente, ScheduleItem } from '../types';
import './Clientes.css';

const Clientes = () => {
  const { loansDb } = useData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = loansDb.filter((client: Cliente) => 
    client.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cedula.includes(searchTerm)
  );

  const selectedClientRaw = loansDb.find((c: Cliente) => String(c.id) === selectedClientId);
  
  // Computed state for the selected client
  let selectedClient: any = null;
  if (selectedClientRaw) {
    const schedule: ScheduleItem[] = calculateSchedule(selectedClientRaw);
    const pagosSum = selectedClientRaw.pagos_realizados.reduce((acc, curr) => acc + curr.monto, 0);
    const montoTotal = selectedClientRaw.prestamo.monto * (1 + selectedClientRaw.prestamo.interes / 100);
    
    // Check if there's any delayed quota
    const hasAtrasado = schedule.some(s => s.estado === 'Atrasado');
    const estadoPrestamo = hasAtrasado ? 'Atrasado' : 'Al día';

    // Check next quota for Whatsapp alert
    const nextQuota = schedule.find(s => s.estado === 'Pendiente' || s.estado === 'Atrasado');
    let showWhatsappAlert = false;
    let whatsappLink = '';
    
    if (nextQuota) {
      const today = new Date();
      const quotaDate = new Date(nextQuota.fecha + 'T00:00:00'); // ensure local timezone comparison
      const diffTime = quotaDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 3) {
        showWhatsappAlert = true;
        const telefonoFormateado = selectedClientRaw.telefono.replace(/\D/g, '');
        const conditionText = diffDays < 0 ? 'está vencida desde' : 'vence el';
        const msgStr = `Hola ${selectedClientRaw.cliente}, te recordamos desde *Presta Ya* que tu cuota de $${nextQuota.monto.toFixed(2)} ${conditionText} ${nextQuota.fecha}. Por favor ponte al día.`;
        whatsappLink = `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(msgStr)}`;
      }
    }

    selectedClient = {
      ...selectedClientRaw,
      nombre: selectedClientRaw.cliente,
      prestamo: {
        ...selectedClientRaw.prestamo,
        cuotas: selectedClientRaw.prestamo.cuotas_totales,
        saldo_pendiente: montoTotal - pagosSum,
        estado: estadoPrestamo
      },
      pagos: selectedClientRaw.pagos_realizados.map((p: any) => ({
        id: p.id,
        fecha: p.fecha,
        monto: p.monto,
        estado: 'Pagado'
      })),
      showWhatsappAlert,
      whatsappLink
    };
  }

  return (
    <div className="clientes-container animate-fade-in">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
        <p>Busca y administra la información de préstamos y pagos por cliente</p>
      </header>

      <div className="clientes-content">
        
        {/* Left: Client List */}
        <div className="clientes-list-section">
          <div className="search-box">
            <Search size={18} className="icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="clients-scroll">
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div 
                  key={client.id} 
                  className={`client-item ${selectedClientId === client.id ? 'active' : ''}`}
                  onClick={() => setSelectedClientId(String(client.id))}
                >
                  <div className="client-avatar">
                    <User size={20} />
                  </div>
                  <div className="client-info">
                    <h4>{client.cliente}</h4>
                    <p>C.I: {client.cedula}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem'}}>
                No se encontraron clientes.
              </p>
            )}
          </div>
        </div>

        {/* Right: Client Details */}
        <div className="client-detail-section">
          {selectedClient ? (
            <div className="animate-fade-in">
              <div className="detail-header">
                <div className="detail-profile">
                  <div className="detail-avatar">
                    <User size={32} />
                  </div>
                  <div className="detail-name">
                    <h2>{selectedClient.nombre}</h2>
                    <p><CreditCard size={16} /> Cédula: {selectedClient.cedula}</p>
                    <p><Phone size={16} /> Teléfono: {selectedClient.telefono}</p>
                  </div>
                </div>
                <div className={`status-badge ${selectedClient.prestamo.estado === 'Al día' ? 'status-aldia' : 'status-atrasado'}`}>
                  {selectedClient.prestamo.estado}
                </div>
              </div>


              {/* Loan Info Cards */}
              <div className="info-grid">
                <div className="info-card">
                  <h5><DollarSign size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> Monto Original</h5>
                  <p>${selectedClient.prestamo.monto.toLocaleString()}</p>
                </div>
                <div className="info-card">
                  <h5><FileText size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> Saldo Pendiente</h5>
                  <p style={{color: 'var(--warning-light)'}}>${selectedClient.prestamo.saldo_pendiente.toLocaleString()}</p>
                </div>
                <div className="info-card">
                  <h5><Clock size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> Plan de Pago</h5>
                  <p>{selectedClient.prestamo.cuotas} cuotas ({selectedClient.prestamo.plazo})</p>
                </div>
              </div>

              {/* Payments History */}
              <div className="payments-section">
                <h3>Historial de Pagos</h3>
                <div className="payments-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Pago</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.pagos_realizados.map((pago: any) => (
                        <tr key={pago.id}>
                          <td>#{pago.id}</td>
                          <td>{pago.fecha}</td>
                          <td>${pago.monto.toFixed(2)}</td>
                          <td>
                            <span className="payment-status payment-pagado">
                              Pagado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedClient.showWhatsappAlert && (
                <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#25D366', marginBottom: '0.25rem' }}>¡Cuota próxima a vencer o atrasada!</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>El sistema detectó que este cliente requiere un recordatorio de pago.</p>
                  </div>
                  <a href={selectedClient.whatsappLink} target="_blank" rel="noreferrer" className="btn" style={{ backgroundColor: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <MessageCircle size={18} /> Enviar Recordatorio
                  </a>
                </div>
              )}

            </div>
          ) : (
            <div className="empty-state animate-fade-in">
              <User size={64} />
              <h3>Selecciona un cliente</h3>
              <p>Haz clic en un cliente de la lista para ver el detalle de su préstamo y pagos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Clientes;
