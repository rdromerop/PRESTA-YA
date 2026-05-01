import { useState } from 'react';
import { Search, DollarSign, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import './CobradorDashboard.css';

const CobradorDashboard = () => {
  const { loansDb, registerPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [amount, setAmount] = useState('');

  const filteredClients = loansDb.filter(c => 
    c.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPayment = (client) => {
    setSelectedClient(client);
    setAmount('');
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    registerPayment(selectedClient.id, amount);
    alert(`Pago de $${amount} registrado a ${selectedClient.cliente}`);
    setSelectedClient(null);
  };

  return (
    <div className="cobrador-dash">
      <div className="cobrador-search">
        <Search size={18} color="#999" />
        <input 
          type="text" 
          placeholder="Buscar cliente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="client-list-mobile">
        {filteredClients.map(client => (
          <div key={client.id} className="client-card-mobile">
            <div className="client-info-mobile">
              <h3>{client.cliente}</h3>
              <p>C.I: {client.cedula}</p>
            </div>
            <button className="btn-cobrar" onClick={() => handleOpenPayment(client)}>
              <DollarSign size={16} /> Cobrar
            </button>
          </div>
        ))}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CobradorDashboard;
