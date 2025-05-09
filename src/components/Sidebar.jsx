// src/components/Sidebar.jsx
import React from 'react';
import './Sidebar.css';
import { FaHome, FaUsers, FaTicketAlt, FaGamepad, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ setActiveModule, active, onLogout }) => {
  const items = [
    { name: 'Inicio', icon: <FaHome /> },
    { name: 'Usuarios', icon: <FaUsers /> },
    { name: 'Entradas', icon: <FaTicketAlt /> },
    { name: 'Juegos', icon: <FaGamepad /> },
    { name: 'Reportes', icon: <FaChartBar /> },
    { name: 'Escáner', icon: <FaTicketAlt /> } // Podés cambiar el ícono si querés
  ];
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">Panel UMG</div>
      <nav className="sidebar-nav">
        <ul>
          {items.map((item) => (
            <li
              key={item.name}
              className={active === item.name ? 'active' : ''}
              onClick={() => setActiveModule(item.name)}
            >
              {item.icon}
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <div className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt />
        Cerrar sesión
      </div>
    </div>
  );
};

export default Sidebar;
