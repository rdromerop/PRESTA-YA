export interface Prestamo {
  monto: number;
  interes: number;
  cuotas_totales: number;
  plazo: 'diaria' | 'semanal' | 'quincenal' | 'mensual';
  fecha_inicio: string;
}

export interface Pago {
  id: string;
  fecha: string;
  monto: number;
}

export interface Cliente {
  id: number | string;
  cliente: string;
  cedula: string;
  telefono: string;
  calificacion: number;
  prestamo: Prestamo;
  pagos_realizados: Pago[];
}

export interface ScheduleItem {
  cuota: number;
  fecha: string;
  monto: number;
  estado: 'Pagado' | 'Pendiente' | 'Atrasado';
}

export interface Usuario {
  role: 'admin' | 'cobrador';
}

export interface DataContextType {
  loansDb: Cliente[];
  setLoansDb: React.Dispatch<React.SetStateAction<Cliente[]>>;
  currentUser: Usuario | null;
  login: (role: 'admin' | 'cobrador') => void;
  logout: () => void;
  registerPayment: (clienteId: number | string, amount: number | string) => void;
}
