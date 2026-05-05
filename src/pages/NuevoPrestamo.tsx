import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, MapPin, Phone, DollarSign, Percent, Calendar, CheckCircle2, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import './NuevoPrestamo.css';

const NuevoPrestamo = () => {
  const { addClient } = useData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    monto: '',
    plazo: 'diaria',
    interes: '20',
    cuotas: '40',
    dia_cobro: '1'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'plazo') {
      let nuevasCuotas = formData.cuotas;
      if (value === 'diaria') nuevasCuotas = '40';
      else if (value === 'semanal') nuevasCuotas = '6';
      else if (value === 'quincenal') nuevasCuotas = '2';
      else if (value === 'mensual') nuevasCuotas = '12'; // Por defecto 12 meses, editable
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cuotas: nuevasCuotas
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calcula el resumen del préstamo en tiempo real
  const resumen = useMemo(() => {
    const monto = parseFloat(formData.monto);
    const interes = parseFloat(formData.interes);
    const cuotas = parseInt(formData.cuotas);
    if (!monto || !interes || !cuotas) return null;

    if (formData.plazo === 'mensual') {
      // Amortización decreciente: abono fijo al capital + interés sobre saldo pendiente
      const abonoPorCuota = monto / cuotas;
      const tasaMensual = interes / 100; // interés mensual sobre saldo
      let saldo = monto;
      let totalIntereses = 0;
      const tabla = [];

      for (let i = 1; i <= cuotas; i++) {
        const interesesMes = saldo * tasaMensual;
        const cuotaTotal = abonoPorCuota + interesesMes;
        totalIntereses += interesesMes;
        tabla.push({
          num: i,
          abono: abonoPorCuota,
          interes: interesesMes,
          cuota: cuotaTotal,
          saldoFinal: saldo - abonoPorCuota
        });
        saldo -= abonoPorCuota;
      }

      return {
        tipo: 'mensual',
        interesTotal: totalIntereses,
        totalADevolver: monto + totalIntereses,
        tabla
      };
    } else {
      // Cuota plana: interés sobre el capital total
      const interesTotal = monto * (interes / 100);
      const totalADevolver = monto + interesTotal;
      const valorCuota = totalADevolver / cuotas;
      return { tipo: 'plano', interesTotal, totalADevolver, valorCuota };
    }
  }, [formData.monto, formData.interes, formData.cuotas, formData.plazo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      cliente: formData.nombre,
      cedula: formData.cedula,
      telefono: formData.telefono,
      direccion: formData.direccion,
      prestamo: {
        monto: parseFloat(formData.monto),
        interes: parseFloat(formData.interes),
        cuotas_totales: parseInt(formData.cuotas),
        plazo: formData.plazo as any,
        fecha_inicio: new Date().toISOString().split('T')[0],
        dia_cobro: formData.plazo === 'semanal' ? parseInt(formData.dia_cobro) : undefined
      }
    };
    addClient(newClient);
    alert('Préstamo registrado con éxito');
    navigate('/admin/clientes');
  };

  return (
    <div className="nuevo-prestamo-container animate-fade-in">
      <header className="page-header">
        <h1>Registrar Nuevo Préstamo</h1>
        <p>Ingresa los detalles del cliente y las condiciones del crédito</p>
      </header>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-grid">
            {/* Nombre del Cliente */}
            <div className="form-group full-width">
              <label htmlFor="nombre">Nombre del Cliente</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  className="form-control" 
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Cédula del Cliente */}
            <div className="form-group full-width">
              <label htmlFor="cedula">Cédula de Identidad</label>
              <div className="input-with-icon">
                <CreditCard size={18} className="input-icon" />
                <input 
                  type="text" 
                  id="cedula" 
                  name="cedula" 
                  className="form-control" 
                  placeholder="Ej. 1.234.567-8"
                  value={formData.cedula}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="form-group full-width">
              <label htmlFor="telefono">Número de Teléfono</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input 
                  type="tel" 
                  id="telefono" 
                  name="telefono" 
                  className="form-control" 
                  placeholder="Ej. 555-0101"
                  value={formData.telefono}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input 
                  type="text" 
                  id="direccion" 
                  name="direccion" 
                  className="form-control" 
                  placeholder="Ej. Av. Siempre Viva 123"
                  value={formData.direccion}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Monto */}
            <div className="form-group">
              <label htmlFor="monto">Monto Solicitado</label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input 
                  type="number" 
                  id="monto" 
                  name="monto" 
                  className="form-control" 
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.monto}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Porcentaje de Interés */}
            <div className="form-group">
              <label htmlFor="interes">Porcentaje de Interés (%)</label>
              <div className="input-with-icon">
                <Percent size={18} className="input-icon" />
                <input 
                  type="number" 
                  id="interes" 
                  name="interes" 
                  className="form-control" 
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.interes}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Número de Cuotas */}
            <div className="form-group">
              <label htmlFor="cuotas">Número de Cuotas</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="number" 
                  id="cuotas" 
                  name="cuotas" 
                  className="form-control" 
                  placeholder="Ej. 12"
                  min="1"
                  step="1"
                  value={formData.cuotas}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Plazo */}
            <div className="form-group full-width">
              <label htmlFor="plazo">Frecuencia de Pago (Plazo)</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <select 
                  id="plazo" 
                  name="plazo" 
                  className="form-control"
                  value={formData.plazo}
                  onChange={handleChange}
                  required
                >
                  <option value="diaria">Diaria (40 cuotas)</option>
                  <option value="semanal">Semanal (6 cuotas)</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual (amortización decreciente)</option>
                </select>
              </div>
            </div>

            {/* Selección de día para préstamos semanales */}
            {formData.plazo === 'semanal' && (
              <div className="form-group full-width animate-fade-in">
                <label htmlFor="dia_cobro">Día de la Semana para Cobro</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <select 
                    id="dia_cobro" 
                    name="dia_cobro" 
                    className="form-control"
                    value={formData.dia_cobro}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          {/* Resumen automático del préstamo */}
          {resumen && (
            <div style={{
              marginTop: '1.5rem',
              backgroundColor: 'rgba(65, 179, 113, 0.07)',
              border: '1px solid var(--primary-light)',
              borderRadius: 'var(--radius)',
              padding: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--primary-light)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} /> Resumen del Préstamo
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Capital a prestar</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>${parseFloat(formData.monto).toLocaleString()}</p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Intereses totales</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning-light)' }}>${resumen.interesTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total a devolver</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-light)' }}>${resumen.totalADevolver.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>

              {resumen.tipo === 'mensual' ? (
                // Tabla de amortización decreciente
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📉 Cuota decreciente: cada mes pagas un abono fijo al capital + interés sobre el saldo restante.
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.6rem', textAlign: 'center' }}>Cuota</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right' }}>Abono Capital</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right' }}>Interés</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total Cuota</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right' }}>Saldo Restante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.tabla?.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', color: i % 2 === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>{row.num}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>${row.abono.toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--warning-light)' }}>${row.interes.toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-light)' }}>${row.cuota.toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>${row.saldoFinal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Cuota plana (diaria/semanal/quincenal)
                <div style={{ textAlign: 'center', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: '0.8rem' }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                    Cuota {formData.plazo}: ${resumen.valorCuota?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} × {formData.cuotas} cuotas
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={20} />
              Aprobar y Registrar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NuevoPrestamo;
