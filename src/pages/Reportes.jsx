import { useMemo } from 'react';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import './Reportes.css';

// 2. Mock Data for Pie Chart: Estado de Préstamos (Cartera)
const dataCartera = [
  { name: 'Al día', value: 65 },
  { name: 'Atrasados', value: 25 },
  { name: 'En mora (>30 días)', value: 10 },
];

// 3. Mock Data for Bar Chart: Préstamos Otorgados por Mes
const dataColocacion = [
  { mes: 'Jul', otorgado: 15000 },
  { mes: 'Ago', otorgado: 22000 },
  { mes: 'Sep', otorgado: 18000 },
  { mes: 'Oct', otorgado: 28000 },
];

// Colors for Pie Chart matching our theme
const PIE_COLORS = ['#41b371', '#e67e22', '#d64a4a'];

// Custom Tooltip component for better aesthetics in Dark Theme
const CustomTooltip = ({ active, payload, label, prefix = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">{`${prefix}${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const Reportes = () => {
  const { loansDb } = useData();

  const dataRecaudacion = useMemo(() => {
    const map = {};
    loansDb.forEach(client => {
      client.pagos_realizados.forEach(pago => {
        map[pago.fecha] = (map[pago.fecha] || 0) + pago.monto;
      });
    });
    return Object.keys(map).sort().map(fecha => ({
      fecha,
      recogido: map[fecha]
    }));
  }, [loansDb]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const wsRecaudacion = XLSX.utils.json_to_sheet(dataRecaudacion);
    XLSX.utils.book_append_sheet(wb, wsRecaudacion, "Dinero Recaudado");
    
    const wsCartera = XLSX.utils.json_to_sheet(dataCartera);
    XLSX.utils.book_append_sheet(wb, wsCartera, "Estado Cartera");
    
    const wsColocacion = XLSX.utils.json_to_sheet(dataColocacion);
    XLSX.utils.book_append_sheet(wb, wsColocacion, "Capital Otorgado");
    
    XLSX.writeFile(wb, "Reportes_Analiticas_PrestaYa.xlsx");
  };

  return (
    <div className="reportes-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reportes y Analíticas</h1>
          <p>Visualiza el rendimiento financiero y el estado de tu cartera de préstamos</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportExcel} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Download size={18} /> Exportar Reporte
        </button>
      </header>

      <div className="charts-grid">
        
        {/* 1. Line Chart (Full Width) - Dinero Recogido */}
        <div className="chart-card chart-full-width">
          <div className="chart-header">
            <h3><TrendingUp size={20} className="icon" /> Dinero Recaudado por Día (Últimos 7 días)</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataRecaudacion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d25" vertical={false} />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#8e9e95" 
                  tick={{fill: '#8e9e95'}} 
                  tickMargin={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#8e9e95" 
                  tick={{fill: '#8e9e95'}} 
                  tickMargin={10} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="recogido" 
                  stroke="#41b371" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#41b371', strokeWidth: 2, stroke: '#121b16' }} 
                  activeDot={{ r: 6, fill: '#41b371', stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Pie Chart - Distribución de Cartera */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><PieChartIcon size={20} className="icon" /> Estado de la Cartera</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataCartera}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataCartera.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17221c', borderColor: '#244c38', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ color: '#e2e8e4' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Bar Chart - Préstamos Otorgados */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><BarChart3 size={20} className="icon" /> Capital Otorgado por Mes</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataColocacion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d25" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  stroke="#8e9e95" 
                  tick={{fill: '#8e9e95'}} 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#8e9e95" 
                  tick={{fill: '#8e9e95'}} 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="otorgado" fill="#2d5d45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reportes;
