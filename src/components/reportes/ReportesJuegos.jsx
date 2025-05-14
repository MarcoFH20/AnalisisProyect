// Mejorado: ReportesJuegos.jsx con filtros por nombre, colores, detalles, etiquetas y paginación

import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#6b7280"];

function ReportesJuegos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  useEffect(() => {
    const obtener = async () => {
      const snap = await getDocs(collection(db, "reportes"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReportes(lista);
    };
    obtener();
  }, []);

  const abrirModal = (reporte) => {
    setDetalleSeleccionado(reporte);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleSeleccionado(null);
  };

  const eliminarReporte = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este reporte?")) {
      await deleteDoc(doc(db, "reportes", id));
      setReportes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filtrar = () => {
    return reportes.filter((r) => {
      const esModulo = r.modulo === "juegos";
      const esTipo = filtroTipo ? r.tipo === filtroTipo : true;
      const esNombre = filtroNombre ? r.nombreJuego === filtroNombre : true;

      let fechaBase = r.exportado_en || r.fecha;
      if (!fechaBase) return false;
      const fecha = new Date(fechaBase);
      if (isNaN(fecha.getTime())) return false;

      const ahora = new Date();
      const porDefectoInicio = new Date();
      porDefectoInicio.setMonth(ahora.getMonth() - 1);

      const inicio = fechaInicio ? new Date(fechaInicio) : porDefectoInicio;
      const fin = fechaFin ? new Date(fechaFin) : ahora;

      const enRango = fecha.getTime() >= inicio.getTime() && fecha.getTime() <= fin.getTime();

      return esModulo && esTipo && esNombre && enRango;
    });
  };

  const exportarExcel = () => {
    const filtrados = filtrar();
    if (filtrados.length === 0) return alert("No hay datos para exportar");

    const data = filtrados.map((r) => ({
      Tipo: r.tipo || "-",
      Juego: r.nombreJuego || "-",
      Descripción: r.descripcion || "-",
      Fecha: r.exportado_en
        ? new Date(r.exportado_en).toLocaleString()
        : r.fecha
        ? new Date(r.fecha).toLocaleString()
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes Juegos");
    XLSX.writeFile(wb, "ReportesJuegos.xlsx");
  };

  const exportarPDF = () => {
    const filtrados = filtrar();
    if (filtrados.length === 0) return alert("No hay datos para exportar");

    const docu = new jsPDF();
    docu.text("Reportes de Juegos", 14, 16);

    const rows = filtrados.map((r) => [
      r.tipo || "-",
      r.nombreJuego || "-",
      r.descripcion || "-",
      r.exportado_en
        ? new Date(r.exportado_en).toLocaleString()
        : r.fecha
        ? new Date(r.fecha).toLocaleString()
        : "-",
    ]);

    autoTable(docu, {
      head: [["Tipo", "Juego", "Descripción", "Fecha"]],
      body: rows,
      startY: 20,
    });

    docu.save("ReportesJuegos.pdf");
  };

  const reportesFiltrados = filtrar();
  const totalPaginas = Math.ceil(reportesFiltrados.length / porPagina);
  const paginaActual = reportesFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const resumenTipo = reportes.filter((r) => r.modulo === "juegos").reduce((acc, r) => {
    const tipo = r.tipo || "desconocido";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const dataResumen = Object.entries(resumenTipo).map(([name, value]) => ({ name, value }));
  const juegosUnicos = [...new Set(reportes.map(r => r.nombreJuego).filter(Boolean))];

  const badgeColor = {
    advertencia: "#facc15",
    mantenimiento: "#f87171",
    liberacion: "#34d399",
    estado_actual: "#a3a3a3",
    manual: "#60a5fa"
  };

  return (
    <div className="usuarios-container">
      <h3 style={{ marginBottom: "0.5rem" }}>Reportes de Juegos</h3>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="advertencia">Advertencia</option>
          <option value="manual">Manual</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="estado_actual">Estado actual</option>
          <option value="liberacion">Liberación</option>
        </select>

        <select value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)}>
          <option value="">Todos los juegos</option>
          {juegosUnicos.map((j, i) => (
            <option key={i} value={j}>{j}</option>
          ))}
        </select>

        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={exportarExcel}>Exportar Excel</button>
        <button onClick={exportarPDF}>Exportar PDF</button>
      </div>

      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <BarChart data={dataResumen}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={dataResumen} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dataResumen.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Juego</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Acciones</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {paginaActual.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No hay reportes
              </td>
            </tr>
          ) : (
            paginaActual.map((r) => (
              <tr key={r.id}>
                <td>
                  <span style={{ backgroundColor: badgeColor[r.tipo] || "#e5e7eb", color: "white", padding: "3px 8px", borderRadius: "5px" }}>
                    {r.tipo || "-"}
                  </span>
                </td>
                <td>{r.nombreJuego || "-"}</td>
                <td>{r.descripcion || "-"}</td>
                <td>{r.exportado_en ? new Date(r.exportado_en).toLocaleString() : r.fecha ? new Date(r.fecha).toLocaleString() : "-"}</td>
                <td>
                  <button style={{ padding: "4px 8px", background: "#3b82f6", color: 'white', border: 'none', borderRadius: '4px' }} onClick={() => abrirModal(r)}>Ver</button>
                </td>
                <td>
                  <button className="boton-eliminar" onClick={() => eliminarReporte(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "10px", justifyContent: "center" }}>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              style={{ padding: "5px 10px", background: pagina === num ? "#ef4444" : "#e5e7eb", color: pagina === num ? "white" : "black", border: "none", borderRadius: "4px" }}
              onClick={() => setPagina(num)}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalAbierto}
        onRequestClose={cerrarModal}
        contentLabel="Detalles del Reporte"
        style={{
          content: {
            maxWidth: '500px',
            width: '90%',
            margin: 'auto',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            background: '#fff',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📝 Detalles del Reporte</h2>
        {detalleSeleccionado && (
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6rem' }}>
            <li><strong>🎮 Juego:</strong> {detalleSeleccionado.nombreJuego}</li>
            <li><strong>📌 Tipo:</strong> {detalleSeleccionado.tipo}</li>
            <li><strong>📝 Descripción:</strong> {detalleSeleccionado.descripcion}</li>
            <li><strong>📅 Fecha:</strong> {new Date(detalleSeleccionado.fecha || detalleSeleccionado.exportado_en).toLocaleString()}</li>
          </ul>
        )}
        <button
          onClick={cerrarModal}
          style={{
            marginTop: '1.5rem',
            display: 'block',
            width: '100%',
            padding: '0.6rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
}

export default ReportesJuegos;
