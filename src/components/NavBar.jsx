// src/components/NavBar.jsx
import React from 'react';
import './NavBar.css';
import { FaHome, FaUsers, FaTicketAlt, FaGamepad, FaChartBar, FaQrcode, FaSignOutAlt } from 'react-icons/fa';


const NavBar = ({ setActiveModule, active, onLogout }) => {
  const items = [
    { name: 'Inicio', icon: <FaHome /> },
    { name: 'Usuarios', icon: <FaUsers /> },
    { name: 'Entradas', icon: <FaTicketAlt /> },
    { name: 'Juegos', icon: <FaGamepad /> },
    { name: 'Reportes', icon: <FaChartBar /> },
    { name: 'Escáner', icon: <FaQrcode /> },
 // asegúrate de importar FaQrcode
  ];

  return (
    <div className="navbar-container">
      <div className="navbar-items">
        {items.map((item) => (
          <div
            key={item.name}
            className={`navbar-item ${active === item.name ? 'active' : ''}`}
            onClick={() => setActiveModule(item.name)}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      <div className="navbar-logout" onClick={onLogout}>
        <FaSignOutAlt />
        <span>Cerrar sesión</span>
      </div>
    </div>
  );
};

export default NavBar;
