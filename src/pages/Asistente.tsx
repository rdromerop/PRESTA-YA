import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, TrendingUp, Users, AlertTriangle, Star } from 'lucide-react';
import { useData, calculateSchedule } from '../context/DataContext';
import './Asistente.css';

const SUGGESTED = [
  '¿Quiénes están atrasados?',
  '¿Cuál es el capital invertido?',
  '¿Quién es el mejor cliente?',
  '¿Qué cuotas vencen hoy?',
];

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

const Asistente = () => {
  const { loansDb } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processBotResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    if (text.match(/^(hola|buenas|buenos|hi|hey|saludos|buen dia)/)) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
      return `${greeting}! 👋 ¿En qué te puedo ayudar hoy?\n\nEscribe **"ayuda"** para ver todo lo que puedo hacer.`;
    }

    if (text.includes('atrasado') || text.includes('mora') || text.includes('vencido') || text.includes('deben')) {
      let atrasados: string[] = [];
      loansDb.forEach(client => {
        const schedule = calculateSchedule(client);
        const cuotasAtrasadas = schedule.filter(s => s.estado === 'Atrasado');
        if (cuotasAtrasadas.length > 0) {
          const pendiente = client.prestamo.monto * (1 + client.prestamo.interes / 100) - client.pagos_realizados.reduce((a, b) => a + b.monto, 0);
          atrasados.push(`${client.cliente} — ${cuotasAtrasadas.length} cuota(s) atrasada(s) · Saldo: $${pendiente.toFixed(2)}`);
        }
      });
      if (atrasados.length > 0) return `⚠️ **${atrasados.length}** cliente(s) con cuotas atrasadas:\n- ${atrasados.join('\n- ')}`;
      return '✅ ¡Buenas noticias! No tienes clientes atrasados en este momento.';
    }

    if (text.includes('hoy') || text.includes('próximo') || text.includes('proximo') || text.includes('vence')) {
      const proximos: string[] = [];
      loansDb.forEach(client => {
        const schedule = calculateSchedule(client);
        const pendientes = schedule.filter(s => s.estado === 'Pendiente');
        if (pendientes.length > 0) {
          const next = pendientes[0];
          const diffDays = Math.ceil((new Date(next.fecha).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) {
            const label = diffDays === 0 ? '⚡ HOY' : diffDays < 0 ? `⚠️ hace ${Math.abs(diffDays)} día(s)` : `📅 en ${diffDays} día(s)`;
            proximos.push(`${client.cliente} — $${next.monto.toFixed(2)} · ${label}`);
          }
        }
      });
      if (proximos.length > 0) return `📋 Cuotas próximas (3 días):\n- ${proximos.join('\n- ')}`;
      return '📭 No hay cuotas que venzan en los próximos 3 días.';
    }

    if (text.includes('capital') || text.includes('invertido') || text.includes('resumen') || text.includes('total prestado')) {
      const totalCapital = loansDb.reduce((acc, c) => acc + c.prestamo.monto, 0);
      const totalRecaudado = loansDb.reduce((acc, c) => acc + c.pagos_realizados.reduce((a, b) => a + b.monto, 0), 0);
      const saldoPendiente = loansDb.reduce((acc, c) => {
        const total = c.prestamo.monto * (1 + c.prestamo.interes / 100);
        const pagado = c.pagos_realizados.reduce((a, b) => a + b.monto, 0);
        return acc + Math.max(0, total - pagado);
      }, 0);
      return `💰 **Resumen financiero:**\n\n- Capital prestado: **$${totalCapital.toLocaleString()}**\n- Dinero recaudado: **$${totalRecaudado.toLocaleString()}**\n- Saldo pendiente: **$${saldoPendiente.toFixed(2)}**`;
    }

    if (text.includes('ganancia') || text.includes('interes') || text.includes('beneficio') || text.includes('utilidad')) {
      let interesesTotales = 0, interesesCobrados = 0;
      loansDb.forEach(client => {
        const montoTotal = client.prestamo.monto * (1 + client.prestamo.interes / 100);
        interesesTotales += montoTotal - client.prestamo.monto;
        const pagado = client.pagos_realizados.reduce((a, b) => a + b.monto, 0);
        interesesCobrados += Math.max(0, pagado - Math.min(pagado, client.prestamo.monto));
      });
      return `📈 **Análisis de ganancias:**\n\n- Intereses pactados: **$${interesesTotales.toFixed(2)}**\n- Ya cobrados: **$${interesesCobrados.toFixed(2)}**\n- Pendientes: **$${(interesesTotales - interesesCobrados).toFixed(2)}**`;
    }

    if (text.includes('cuantos') || text.includes('clientes') || text.includes('activos')) {
      const total = loansDb.length;
      const alDia = loansDb.filter(c => !calculateSchedule(c).some(s => s.estado === 'Atrasado')).length;
      return `👥 **${total}** clientes activos:\n- ✅ Al día: **${alDia}**\n- ⚠️ Con atraso: **${total - alDia}**`;
    }

    if (text.includes('recaudado') || text.includes('cobrado')) {
      const totalRecaudado = loansDb.reduce((acc, c) => acc + c.pagos_realizados.reduce((a, b) => a + b.monto, 0), 0);
      const totalPagos = loansDb.reduce((acc, c) => acc + c.pagos_realizados.length, 0);
      return `💵 Se han recaudado **$${totalRecaudado.toLocaleString()}** en **${totalPagos} pagos** registrados.`;
    }

    if (text.includes('mejor cliente') || text.includes('mas confiable') || text.includes('más confiable')) {
      const mejor = [...loansDb].sort((a, b) => b.calificacion - a.calificacion)[0];
      return `🏆 Tu mejor cliente es **${mejor.cliente}** con **${mejor.calificacion} ★** y un préstamo de $${mejor.prestamo.monto.toLocaleString()}.`;
    }

    if (text.includes('peor cliente') || text.includes('problema') || text.includes('riesgo')) {
      const peor = [...loansDb].sort((a, b) => a.calificacion - b.calificacion)[0];
      return `⚠️ El cliente con más riesgo es **${peor.cliente}** con **${peor.calificacion} ★**. Requiere seguimiento especial.`;
    }

    const clienteEncontrado = loansDb.find(c =>
      text.includes(c.cliente.toLowerCase().split(' ')[0].toLowerCase())
    );
    if (clienteEncontrado) {
      const schedule = calculateSchedule(clienteEncontrado);
      const pagado = clienteEncontrado.pagos_realizados.reduce((a, b) => a + b.monto, 0);
      const total = clienteEncontrado.prestamo.monto * (1 + clienteEncontrado.prestamo.interes / 100);
      const saldo = total - pagado;
      const atrasadas = schedule.filter(s => s.estado === 'Atrasado').length;
      const nextPending = schedule.find(s => s.estado === 'Pendiente');
      return `🔍 **${clienteEncontrado.cliente}:**\n- Calificación: ${'★'.repeat(clienteEncontrado.calificacion)}${'☆'.repeat(5 - clienteEncontrado.calificacion)}\n- Préstamo: $${clienteEncontrado.prestamo.monto.toLocaleString()} al ${clienteEncontrado.prestamo.interes}%\n- Saldo pendiente: **$${saldo.toFixed(2)}**\n- Cuotas atrasadas: ${atrasadas}\n${nextPending ? `- Próximo pago: $${nextPending.monto.toFixed(2)} el ${nextPending.fecha}` : '- Sin cuotas pendientes 🎉'}`;
    }

    if (text.includes('ayuda') || text.includes('que puedes') || text.includes('comandos')) {
      return `🤖 Puedo responder estas preguntas:\n\n- **"¿Quiénes están atrasados?"**\n- **"¿Cuántos clientes activos hay?"**\n- **"¿Cuál es el capital invertido?"**\n- **"¿Cuánto se ha recaudado?"**\n- **"¿Cuáles son las ganancias?"**\n- **"¿Quién es el mejor/peor cliente?"**\n- **"¿Qué cuotas vencen hoy?"**\n- **"Cuéntame sobre [nombre]"**`;
    }

    return '🤔 No entendí esa pregunta. Escribe **"ayuda"** para ver lo que puedo hacer.';
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setStarted(true);
    const userMsg: Message = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: processBotResponse(text)
      }]);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line: string, i: number) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part: string, j: number) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        return part;
      });
      return <p key={i}>{parts}</p>;
    });
  };

  return (
    <div className="chat-container animate-fade-in">
      <header className="chat-header">
        <div className="bot-avatar">
          <Bot size={24} />
        </div>
        <div className="chat-header-info">
          <h2>Asistente Financiero AI</h2>
          <p>Conectado a tu base de datos en tiempo real</p>
        </div>
      </header>

      <div className="chat-history">
        {!started ? (
          <div className="bot-welcome">
            <div className="bot-welcome-avatar">
              <Bot size={48} />
              <Sparkles size={20} className="sparkle-icon" />
            </div>
            <h2>Hola, soy tu Asistente Financiero</h2>
            <p>Analizo tu cartera de préstamos en tiempo real y respondo tus preguntas al instante.</p>
            <div className="bot-capabilities">
              <div className="cap-item"><TrendingUp size={18} /> Análisis financiero</div>
              <div className="cap-item"><Users size={18} /> Estado de clientes</div>
              <div className="cap-item"><AlertTriangle size={18} /> Alertas de mora</div>
              <div className="cap-item"><Star size={18} /> Calificaciones</div>
            </div>
            <p className="suggested-label">Prueba preguntarme:</p>
            <div className="suggested-questions">
              {SUGGESTED.map((q, i) => (
                <button key={i} className="suggested-btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              {formatText(msg.text)}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe tu pregunta aquí..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Asistente;
