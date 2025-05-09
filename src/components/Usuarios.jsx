import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Ajustá la ruta según tu proyecto
import './Usuarios.css';

function Usuarios({ setActiveModule }) {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: '',
    apellidos: '',
    edad: '',
    email: '',
    rol: '',
    telefono: ''
  });

  const usuariosRef = collection(db, 'usuarios');

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    const snapshot = await getDocs(usuariosRef);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(lista);
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombres || !nuevoUsuario.apellidos) return alert('Completa todos los campos.');
    await addDoc(usuariosRef, {
      ...nuevoUsuario,
      edad: parseInt(nuevoUsuario.edad),
      createdAt: new Date()
    });
    setNuevoUsuario({ nombres: '', apellidos: '', edad: '', email: '', rol: '', telefono: '' });
    obtenerUsuarios();
  };

  const eliminarUsuario = async (id) => {
    await deleteDoc(doc(db, 'usuarios', id));
    obtenerUsuarios();
  };

  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios</h2>

      <div className="formulario">
        <input placeholder="Nombres" value={nuevoUsuario.nombres} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombres: e.target.value })} />
        <input placeholder="Apellidos" value={nuevoUsuario.apellidos} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellidos: e.target.value })} />
        <input placeholder="Edad" type="number" value={nuevoUsuario.edad} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, edad: e.target.value })} />
        <input placeholder="Email" type="email" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
        <input placeholder="Teléfono" value={nuevoUsuario.telefono} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })} />
        <input placeholder="Rol (admin/trabajador)" value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })} />
        <button onClick={agregarUsuario}>Agregar Usuario</button>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Edad</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user.id}>
              <td>{user.nombres}</td>
              <td>{user.apellidos}</td>
              <td>{user.edad}</td>
              <td>{user.email}</td>
              <td>{user.telefono}</td>
              <td>{user.rol}</td>
              <td><button onClick={() => eliminarUsuario(user.id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => {
          console.log('Volver al inicio');
          setActiveModule('Inicio');
        }}
        className="btn-volver"
      >
        Volver al Inicio
      </button>
    </div>
  );
}

export default Usuarios;