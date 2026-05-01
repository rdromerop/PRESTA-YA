import { createContext, useState, useContext, ReactNode } from 'react';
import { Cliente, DataContextType, ScheduleItem, Usuario } from '../types';

// @ts-ignore
const DataContext = createContext<DataContextType>();

export const useData = () => useContext(DataContext);

const INITIAL_DB: Cliente[] = [
  { 
    id: 1, 
    cliente: 'Juan Pérez', 
    cedula: '123456789',
    telefono: '555-0101',
    calificacion: 5,
    prestamo: { monto: 5000, interes: 15, cuotas_totales: 6, plazo: 'mensual', fecha_inicio: '2024-01-01' },
    pagos_realizados: [
      { id: '1-1', fecha: '2024-02-01', monto: 958.33 }
    ] 
  },
  { 
    id: 2, 
    cliente: 'María Gómez', 
    cedula: '987654321',
    telefono: '555-0202',
    calificacion: 2,
    prestamo: { monto: 2000, interes: 20, cuotas_totales: 8, plazo: 'quincenal', fecha_inicio: '2024-01-01' },
    pagos_realizados: [
      { id: '2-1', fecha: '2024-01-16', monto: 300.00 }
    ] 
  },
  { 
    id: 3, 
    cliente: 'Carlos Ruiz', 
    cedula: '456123789',
    telefono: '555-0303',
    calificacion: 4,
    prestamo: { monto: 1500, interes: 10, cuotas_totales: 10, plazo: 'semanal', fecha_inicio: '2024-01-01' },
    pagos_realizados: [
      { id: '3-1', fecha: '2024-01-08', monto: 165.00 }
    ] 
  },
  {
    id: 4,
    cliente: 'Roberto Díaz',
    cedula: '321654987',
    telefono: '555-0404',
    calificacion: 1,
    prestamo: { monto: 800, interes: 20, cuotas_totales: 40, plazo: 'diaria', fecha_inicio: '2024-01-01' },
    pagos_realizados: [
      { id: '4-1', fecha: '2024-01-02', monto: 24.00 }
    ]
  },
  {
    id: 5,
    cliente: 'Ana Torres',
    cedula: '654987321',
    telefono: '555-0505',
    calificacion: 3,
    prestamo: { monto: 3000, interes: 20, cuotas_totales: 6, plazo: 'semanal', fecha_inicio: '2024-01-01' },
    pagos_realizados: [
      { id: '5-1', fecha: '2024-01-08', monto: 600.00 }
    ]
  },
];

const addTime = (dateStr: string, amount: number, unit: 'dias' | 'meses'): string => {
  const d = new Date(dateStr);
  if (unit === 'dias') d.setDate(d.getDate() + amount);
  if (unit === 'meses') d.setMonth(d.getMonth() + amount);
  return d.toISOString().split('T')[0];
};

export const calculateSchedule = (loanData: Cliente): ScheduleItem[] => {
  const { prestamo, pagos_realizados } = loanData;
  const montoTotal = prestamo.monto * (1 + prestamo.interes / 100);
  const montoPorCuota = montoTotal / prestamo.cuotas_totales;
  
  let schedule: ScheduleItem[] = [];
  let currentDate = prestamo.fecha_inicio;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 1; i <= prestamo.cuotas_totales; i++) {
    if (prestamo.plazo === 'diaria') currentDate = addTime(currentDate, 1, 'dias');
    else if (prestamo.plazo === 'semanal') currentDate = addTime(currentDate, 7, 'dias');
    else if (prestamo.plazo === 'quincenal') currentDate = addTime(currentDate, 15, 'dias');
    else if (prestamo.plazo === 'mensual') currentDate = addTime(currentDate, 1, 'meses');

    const isPaid = i <= pagos_realizados.length;
    let estado: ScheduleItem['estado'] = isPaid ? 'Pagado' : 'Pendiente';
    
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

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [loansDb, setLoansDb] = useState<Cliente[]>(INITIAL_DB);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  const login = (role: 'admin' | 'cobrador') => {
    setCurrentUser({ role });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerPayment = (clienteId: number | string, amount: number | string) => {
    setLoansDb(prevDb => prevDb.map(client => {
      if (client.id === clienteId) {
        const today = new Date().toISOString().split('T')[0];
        const newPayment = {
          id: `${client.id}-${Date.now()}`,
          fecha: today,
          monto: typeof amount === 'string' ? parseFloat(amount) : amount
        };
        return {
          ...client,
          pagos_realizados: [...client.pagos_realizados, newPayment]
        };
      }
      return client;
    }));
  };

  return (
    <DataContext.Provider value={{ loansDb, setLoansDb, currentUser, login, logout, registerPayment }}>
      {children}
    </DataContext.Provider>
  );
};
