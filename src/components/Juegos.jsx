// 📁 juegos.jsx (INTEGRADO: funcional completo con asientos, mantenimiento y validaciones)

import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/firebase';

const Juegos = () => {
  const [juegos, setJuegos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const juegosRef = collection(db, 'juegos');

  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('activo');
  const [capacidadMin, setCapacidadMin] = useState('');
  const [capacidadMax, setCapacidadMax] = useState('');
  const [mantenimientoCada, setMantenimientoCada] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [fechaInstalacion, setFechaInstalacion] = useState('');
  const [duracionCiclo, setDuracionCiclo] = useState('');
  const [riesgo, setRiesgo] = useState('bajo');
  const [asientos, setAsientos] = useState({});

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(juegosRef, (snapshot) => {
      const juegosData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJuegos(juegosData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const max = parseInt(capacidadMax);
    if (!isNaN(max) && max > 0) {
      const nuevosAsientos = {};
      for (let i = 1; i <= max; i++) {
        nuevosAsientos[`A${i}`] = 'libre';
      }
      setAsientos(nuevosAsientos);
    }
  }, [capacidadMax]);

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setNombre('');
    setEstado('activo');
    setCapacidadMin('');
    setCapacidadMax('');
    setMantenimientoCada('');
    setDescripcion('');
    setFabricante('');
    setFechaInstalacion('');
    setDuracionCiclo('');
    setRiesgo('bajo');
    setAsientos({});
  };

  const validarCampos = () => {
    if (!nombre || !descripcion || !capacidadMin || !capacidadMax || !mantenimientoCada || !duracionCiclo) {
      alert('⚠️ Todos los campos obligatorios deben estar completos.');
      return false;
    }
    if (parseInt(capacidadMin) > parseInt(capacidadMax)) {
      alert('⚠️ La capacidad mínima no puede ser mayor que la capacidad máxima.');
      return false;
    }
    if (parseInt(mantenimientoCada) <= 0 || parseInt(duracionCiclo) <= 0) {
      alert('⚠️ Ciclos y duración deben ser mayores a 0.');
      return false;
    }
    return true;
  };

  const agregarJuego = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;
    const nuevo = {
      nombre,
      estado,
      capacidad_minima: parseInt(capacidadMin),
      capacidad_maxima: parseInt(capacidadMax),
      ciclos_actuales: 0,
      mantenimiento_cada: parseInt(mantenimientoCada),
      descripcion,
      fabricante,
      fecha_instalacion: fechaInstalacion,
      duracion_ciclo: parseInt(duracionCiclo),
      riesgo,
      asientos
    };
    await addDoc(juegosRef, nuevo);
    limpiarFormulario();
  };

  const cargarJuegoParaEdicion = (juego) => {
    setModoEdicion(true);
    setIdEdicion(juego.id);
    setNombre(juego.nombre);
    setEstado(juego.estado);
    setCapacidadMin(juego.capacidad_minima);
    setCapacidadMax(juego.capacidad_maxima);
    setMantenimientoCada(juego.mantenimiento_cada);
    setDescripcion(juego.descripcion);
    setFabricante(juego.fabricante || '');
    setFechaInstalacion(juego.fecha_instalacion || '');
    setDuracionCiclo(juego.duracion_ciclo || '');
    setRiesgo(juego.riesgo || 'bajo');
    setAsientos(juego.asientos || {});
  };

  const actualizarJuego = async () => {
    if (!validarCampos()) return;
    const ref = doc(db, 'juegos', idEdicion);
    await updateDoc(ref, {
      nombre,
      estado,
      capacidad_minima: parseInt(capacidadMin),
      capacidad_maxima: parseInt(capacidadMax),
      mantenimiento_cada: parseInt(mantenimientoCada),
      descripcion,
      fabricante,
      fecha_instalacion: fechaInstalacion,
      duracion_ciclo: parseInt(duracionCiclo),
      riesgo,
      asientos
    });
    limpiarFormulario();
  };

  const eliminarJuego = async (id) => {
    await deleteDoc(doc(db, 'juegos', id));
  };

  const usarCiclo = async (id, juego) => {
    if (juego.estado === 'mantenimiento') {
      alert('⚠️ Este juego está en mantenimiento.');
      return;
    }
    const nuevosCiclos = (juego.ciclos_actuales || 0) + 1;
    const ciclosRestantes = juego.mantenimiento_cada - nuevosCiclos;

    if (ciclosRestantes <= 10 && ciclosRestantes > 0) {
      alert(`⚠️ Este juego está por entrar en mantenimiento. Quedan ${ciclosRestantes} ciclos.`);
      const reportesRef = collection(db, 'reportes');
      await addDoc(reportesRef, {
        tipo: 'advertencia',
        modulo: 'juegos',
        fecha: new Date().toISOString(),
        nombreJuego: juego.nombre,
        estadoJuego: juego.estado,
        ciclos_restantes: ciclosRestantes,
        descripcion: juego.descripcion,
        usuario: 'admin'
      });
    }

    if (ciclosRestantes <= 0) {
      const reportesRef = collection(db, 'reportes');
      await addDoc(reportesRef, {
        tipo: 'mantenimiento',
        modulo: 'juegos',
        fecha: new Date().toISOString(),
        nombreJuego: juego.nombre,
        estadoJuego: 'mantenimiento',
        ciclos_restantes: 0,
        descripcion: juego.descripcion,
        usuario: 'admin'
      });
    }

    const nuevoEstado = ciclosRestantes <= 0 ? 'mantenimiento' : juego.estado;
    const ref = doc(db, 'juegos', id);
    await updateDoc(ref, { ciclos_actuales: nuevosCiclos, estado: nuevoEstado });
};

  const liberarDeMantenimiento = async (id) => {
    const ref = doc(db, 'juegos', id);
    const juego = juegos.find(j => j.id === id);

    await updateDoc(ref, {
      estado: 'activo',
      ciclos_actuales: 0
    });

    const historialRef = collection(db, 'juegos', id, 'historial_mantenimiento');
    await addDoc(historialRef, {
      fecha: new Date().toISOString(),
      accion: 'Liberación de mantenimiento',
      usuario: 'admin'
    });

    const reportesRef = collection(db, 'reportes');
    await addDoc(reportesRef, {
      tipo: 'liberacion',
      modulo: 'juegos',
      fecha: new Date().toISOString(),
      nombreJuego: juego?.nombre || 'desconocido',
      estadoJuego: 'activo',
      ciclos_restantes: juego?.mantenimiento_cada || 0,
      descripcion: juego?.descripcion || '',
      usuario: 'admin'
    });

    alert('✅ Juego liberado del mantenimiento, historial y reporte generados.');
};

  const cambiarEstadoAsiento = (clave) => {
    setAsientos(prev => ({
      ...prev,
      [clave]: prev[clave] === 'libre' ? 'ocupado' : 'libre'
    }));
  };

  const exportarEstadoActual = async () => {
    const reportesRef = collection(db, 'reportes');
    const fecha = new Date().toISOString();
    for (const juego of juegos) {
      const ciclosRestantes = juego.mantenimiento_cada - (juego.ciclos_actuales || 0);
      await addDoc(reportesRef, {
        tipo: 'estado_actual',
        modulo: 'juegos',
        fecha,
        nombreJuego: juego.nombre,
        estadoJuego: juego.estado,
        ciclos_restantes: ciclosRestantes,
        descripcion: juego.descripcion,
        usuario: 'admin'
      });
    }
    alert('✅ Reporte de estado actual de todos los juegos enviado al módulo de reportes.');
};

  return (
    <div>
      <h2>Gestión de Juegos y Atracciones</h2>

      <div className="botones-centrados" style={{ marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <select onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado}>
        <option value="todos">Mostrar todos</option>
        <option value="activo">Activos</option>
        <option value="mantenimiento">En mantenimiento</option>
      </select>
        <button onClick={() => juegos.forEach(j => usarCiclo(j.id, j))}>Simular uso de ciclo en todos</button>
        <button onClick={exportarEstadoActual}>Exportar a Reportes</button>
        <button onClick={() => window.print()}>Exportar a PDF</button>
      </div>

      <table className="tableusuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Capacidad</th>
            <th>Ciclos</th>
            <th>Restantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {juegos.filter(j => filtroEstado === 'todos' || j.estado === filtroEstado).map(j => {
            const restantes = j.mantenimiento_cada - (j.ciclos_actuales || 0);
            return (
              <tr key={j.id}>
                <td>{j.nombre}</td>
                <td>{j.estado}</td>
                <td>{j.capacidad_minima} - {j.capacidad_maxima}</td>
                <td>{j.ciclos_actuales || 0}</td>
                <td>{restantes}</td>
                <td>
                  <button onClick={() => cargarJuegoParaEdicion(j)}>Editar</button>
                  <button onClick={() => eliminarJuego(j.id)}>Eliminar</button>
                  <button onClick={() => usarCiclo(j.id, j)}>Usar ciclo</button>
                  {j.estado === 'mantenimiento' && (
                    <button onClick={() => liberarDeMantenimiento(j.id)} style={{ backgroundColor: 'orange' }}>
                      Liberar mantenimiento
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <form onSubmit={modoEdicion ? actualizarJuego : agregarJuego} className="formulario-juegos">
        <input type="text" placeholder="Nombre del juego" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="activo">Activo</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
        <input type="number" placeholder="Capacidad mínima" value={capacidadMin} onChange={(e) => setCapacidadMin(e.target.value)} required />
        <input type="number" placeholder="Capacidad máxima" value={capacidadMax} onChange={(e) => setCapacidadMax(e.target.value)} required />
        <input type="number" placeholder="Mantenimiento cada X ciclos" value={mantenimientoCada} onChange={(e) => setMantenimientoCada(e.target.value)} required />
        <input type="number" placeholder="Duración por ciclo (min)" value={duracionCiclo} onChange={(e) => setDuracionCiclo(e.target.value)} required />
        <textarea placeholder="Descripción del juego" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        <input type="text" placeholder="Fabricante" value={fabricante} onChange={(e) => setFabricante(e.target.value)} />
        <input type="date" placeholder="Fecha instalación" value={fechaInstalacion} onChange={(e) => setFechaInstalacion(e.target.value)} />
        <select value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
          <option value="bajo">Bajo</option>
          <option value="medio">Medio</option>
          <option value="alto">Alto</option>
        </select>

        <div style={{ marginTop: '10px' }}>
          <strong>Asientos:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(asientos).map(([clave, estado]) => (
              <button key={clave} type="button" onClick={() => cambiarEstadoAsiento(clave)} style={{ background: estado === 'libre' ? 'green' : 'red', color: 'white', border: 'none', padding: '4px 8px' }}>
                {clave}: {estado}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="boton-primario" style={{ marginTop: '10px' }}>
          {modoEdicion ? 'Actualizar Juego' : 'Guardar Juego'}
        </button>
      </form>
    </div>
  );
};

export default Juegos;
