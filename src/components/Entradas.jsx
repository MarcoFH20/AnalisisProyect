import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './Usuarios.css';

function Entradas({ setActiveModule }) {
  const [entradas, setEntradas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const entradasRef = collection(db, 'boletos');
  const reportesRef = collection(db, 'reportes');

  useEffect(() => {
    obtenerEntradas();
  }, []);

  const obtenerEntradas = async () => {
    const snapshot = await getDocs(entradasRef);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEntradas(lista);
  };

  const eliminarEntrada = async (id) => {
    await deleteDoc(doc(db, 'boletos', id));
    obtenerEntradas();
  };

  const exportarAReportes = async () => {
    try {
      const exportados = filtrarEntradas();
      for (const ent of exportados) {
        await addDoc(reportesRef, {
          tipo: 'entrada',
          serie: ent.serie || '-',
          tipoEntrada: ent.tipo || '-',
          estado: ent.estado || '-',
          fecha_emision: ent.fecha_emision || '-',
          fecha_validacion: ent.fecha_validacion || '-',
          exportado_en: new Date().toISOString()
        });
      }
      alert('Boletos exportados al módulo de Reportes');
    } catch (error) {
      console.error('Error al exportar boletos:', error);
      alert('❌ Error al exportar boletos');
    }
  };

  const parseFecha = (fechaStr) => {
    if (!fechaStr || typeof fechaStr !== 'string') return null;
    const partes = fechaStr.split('/');
    if (partes.length === 3) {
      const [d, m, y] = partes;
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(fechaStr);
  };

  const filtrarEntradas = () => {
    return entradas.filter(ent => {
      const tipoCoincide = filtroTipo ? ent.tipo === filtroTipo : true;
      const estadoCoincide = filtroEstado ? ent.estado === filtroEstado : true;
      const fecha = ent.fecha_emision ? parseFecha(ent.fecha_emision) : null;
      const enRango = (!fechaInicio || (fecha && fecha >= new Date(fechaInicio))) &&
                      (!fechaFin || (fecha && fecha <= new Date(fechaFin)));
      return tipoCoincide && estadoCoincide && enRango;
    });
  };

  const entradasFiltradas = filtrarEntradas();

  return (
    <div className="usuarios-container">
      <h2>Entradas</h2>
      <h3 style={{ marginBottom: '1rem' }}>Gestión de Boletos</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="valido">Válido</option>
          <option value="usado">Usado</option>
        </select>

        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="Entrada General">Entrada General</option>
          <option value="Entrada VIP">Entrada VIP</option>
          <option value="Entrada Niño">Entrada Niño</option>
        </select>

        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={exportarAReportes}>Exportar a Reportes</button>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Serie</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Fecha Emisión</th>
            <th>Fecha Validación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entradasFiltradas.length === 0 ? (
            <tr><td colSpan="6">No hay datos disponibles</td></tr>
          ) : (
            entradasFiltradas.map(ent => (
              <tr key={ent.id}>
                <td>{ent.serie || '-'}</td>
                <td>{ent.tipo || '-'}</td>
                <td>{ent.estado || '-'}</td>
                <td>{ent.fecha_emision || '-'}</td>
                <td>{ent.fecha_validacion || '-'}</td>
                <td><button onClick={() => eliminarEntrada(ent.id)}>Eliminar</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button
        onClick={() => setActiveModule('Inicio')}
        className="btn-volver"
      >
        Volver al Inicio
      </button>
    </div>
  );
}

export default Entradas;
