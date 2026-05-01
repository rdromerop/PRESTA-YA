import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      login('admin');
      navigate('/admin');
    } else if (username === 'cobrador' && password === 'cobrador') {
      login('cobrador');
      navigate('/cobrador');
    } else {
      setError('Credenciales incorrectas. Usa admin/admin o cobrador/cobrador');
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <div className="login-logo">
          <h1>PRESTA YA</h1>
          <p>Sistema de Gestión de Préstamos</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-group">
            <label htmlFor="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              className="login-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin o cobrador"
              required
            />
          </div>
          <div className="login-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              className="login-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
