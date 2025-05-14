import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import fondoParque from '../assets/fondo-parque.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !pass) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setError('');
      navigate('/dashboard');  // ✅ Redirige correctamente
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Parque Diversión Infinita</h2>
        <p>Inicio de sesión</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <div className="remember">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recordarme</label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Iniciar sesión</button>
        </form>
        <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
      </div>

      <div className="login-image">
        <img src={fondoParque} alt="Parque de diversiones" />
      </div>
    </div>
  );
};

export default Login;
