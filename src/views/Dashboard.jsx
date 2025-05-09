import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import Usuarios from '../components/Usuarios';
import Entradas from '../components/Entradas';
import EscanearEntrada from '../components/EscanearEntrada';
import Reportes from '../components/Reportes';


const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('Inicio');

  const renderModule = () => {
    switch (activeModule) {
      case 'Inicio':
        return <p>Bienvenido al panel de control. Aquí verás un resumen general.</p>;
      case 'Usuarios':
        return <Usuarios setActiveModule={setActiveModule} />;         
      case 'Entradas':
        return <Entradas setActiveModule={setActiveModule} />;  
      case 'Escáner':
        return <EscanearEntrada setActiveModule={setActiveModule} />;        
      case 'Juegos':
        return <p>Gestiona los juegos y atracciones.</p>;
      case 'Reportes':
        return <Reportes setActiveModule={setActiveModule} />;                
      default:
        return <p>Selecciona un módulo del panel izquierdo.</p>;
    }
  };
  

  return (
    <div className="dashboard-layout">
      <div className="dashboard-body">
        <Sidebar setActiveModule={setActiveModule} active={activeModule} />

        <main className="main-content">
          <h2>{activeModule}</h2>
          <div className="content-box">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
