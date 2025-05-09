import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import './Usuarios.css';

function Reportes({ setActiveModule }) {
  const [reportes, setReportes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipoEntrada, setFiltroTipoEntrada] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const reportesRef = collection(db, 'reportes');

  useEffect(() => {
    obtenerReportes();
  }, []);

  const obtenerReportes = async () => {
    const snapshot = await getDocs(reportesRef);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReportes(lista);
  };

  const exportarExcel = () => {
    const filtrados = filtrarReportes();
    if (filtrados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const data = filtrados.map(rep => ({
      Tipo: rep.tipo || '-',
      Serie: rep.serie || '-',
      'Tipo Entrada': rep.tipoEntrada || '-',
      Estado: rep.estado || '-',
      'Fecha Emisión': rep.fecha_emision || '-',
      'Fecha Validación': rep.fecha_validacion || '-',
      'Exportado En': rep.exportado_en ? new Date(rep.exportado_en).toLocaleString() : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
    XLSX.writeFile(workbook, 'ReportesEntradas.xlsx');
  };

  const exportarPDF = () => {
    const filtrados = filtrarReportes();
    const doc = new jsPDF();
    doc.text('Reportes de Entradas Exportadas', 14, 16);
    const rows = filtrados.map(rep => [
      rep.tipo || '-',
      rep.serie || '-',
      rep.tipoEntrada || '-',
      rep.estado || '-',
      rep.fecha_emision || '-',
      rep.fecha_validacion || '-',
      rep.exportado_en ? new Date(rep.exportado_en).toLocaleString() : '-'
    ]);
    autoTable(doc, {
        head: [['Tipo', 'Serie', 'Tipo Entrada', 'Estado', 'Fecha Emisión', 'Fecha Validación', 'Exportado En']],
        body: rows,
        startY: 20
      });      
    doc.save('ReportesEntradas.pdf');
  };

  const filtrarReportes = () => {
    return reportes.filter(rep => {
      const estadoCoincide = filtroEstado ? rep.estado === filtroEstado : true;
      const tipoCoincide = filtroTipoEntrada ? rep.tipoEntrada === filtroTipoEntrada : true;
      const fecha = rep.exportado_en ? new Date(rep.exportado_en) : null;
      const dentroDeRango = (!fechaInicio || (fecha && fecha >= new Date(fechaInicio))) &&
                            (!fechaFin || (fecha && fecha <= new Date(fechaFin)));
      return estadoCoincide && tipoCoincide && dentroDeRango;
    });
  };

  const reportesFiltrados = filtrarReportes();

  const totalEntradas = reportesFiltrados.length;
  const totalUsadas = reportesFiltrados.filter(r => r.estado === 'usado').length;
  const totalValidas = reportesFiltrados.filter(r => r.estado === 'valido').length;
  const totalPorTipo = reportesFiltrados.reduce((acc, r) => {
    const tipo = r.tipoEntrada || 'Otro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(totalPorTipo).map(([tipo, cantidad]) => ({ name: tipo, value: cantidad }));

  return (
    <div className="usuarios-container">
      <h2>Reportes</h2>
      <h3 style={{ marginBottom: '1rem' }}>Reportes de Entradas Exportadas</h3>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Total Entradas:</strong> {totalEntradas} |{' '}
        <strong>Usadas:</strong> {totalUsadas} |{' '}
        <strong>Válidas:</strong> {totalValidas} |{' '}
        {Object.entries(totalPorTipo).map(([tipo, count]) => (
          <span key={tipo}><strong>{tipo}:</strong> {count} </span>
        ))}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="valido">Válido</option>
          <option value="usado">Usado</option>
        </select>

        <select value={filtroTipoEntrada} onChange={(e) => setFiltroTipoEntrada(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="General">General</option>
          <option value="VIP">VIP</option>
          <option value="Niño">Niño</option>
        </select>

        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={exportarExcel}>Exportar a Excel</button>
        <button onClick={exportarPDF}>Exportar a PDF</button>
      </div>

      <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Serie</th>
            <th>Tipo Entrada</th>
            <th>Estado</th>
            <th>Fecha Emisión</th>
            <th>Fecha Validación</th>
            <th>Exportado En</th>
          </tr>
        </thead>
        <tbody>
          {reportesFiltrados.length === 0 ? (
            <tr><td colSpan="7">No hay datos disponibles</td></tr>
          ) : (
            reportesFiltrados.map(rep => (
              <tr key={rep.id}>
                <td>{rep.tipo || '-'}</td>
                <td>{rep.serie || '-'}</td>
                <td>{rep.tipoEntrada || '-'}</td>
                <td>{rep.estado || '-'}</td>
                <td>{rep.fecha_emision || '-'}</td>
                <td>{rep.fecha_validacion || '-'}</td>
                <td>{rep.exportado_en ? new Date(rep.exportado_en).toLocaleString() : '-'}</td>
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

export default Reportes;
