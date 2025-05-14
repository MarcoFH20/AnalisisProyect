import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import Usuarios from '@/components/Usuarios';
import Entradas from '@/components/Entradas';
import Reportes from '@/components/Reportes';
import Juegos from '@/components/Juegos';
import EscanearEntrada from '@/components/EscanearEntrada';

import "@/views/Dashboard.css";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('Inicio');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/', { replace: true });
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'Inicio':
        return <p className="contenido-modulo">Bienvenido al panel de control.</p>;
      case 'Usuarios':
        return <Usuarios setActiveModule={setActiveModule} />;
      case 'Entradas':
        return <Entradas setActiveModule={setActiveModule} />;
      case 'Reportes':
        return <Reportes setActiveModule={setActiveModule} />;
      case 'Juegos':
        return <Juegos setActiveModule={setActiveModule} />;
      case 'Escáner':
        return <EscanearEntrada setActiveModule={setActiveModule} />;
      default:
        return <p className="contenido-modulo">Selecciona un módulo</p>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Diversión Infinita 🐴</h1>
      </header>

      <NavBar setActiveModule={setActiveModule} active={activeModule} onLogout={handleLogout} />

      <main className="contenido">
        <h2>{activeModule}</h2>
        {renderModule()}
      </main>

      <div className="footer-trigger" />

      <footer className="footer">
        <p>© 2025 Diversión Infinita | contacto@diversioninfinita.com</p>
        <p>Síguenos: Facebook | Instagram | TikTok</p>
      </footer>
    </div>
  );
};

export default Dashboard;
