import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './Usuarios.css';

function EscanearEntrada({ setActiveModule }) {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(handleScanSuccess, handleScanError);

    return () => scanner.clear();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    const boletosRef = collection(db, 'boletos');
    const q = query(boletosRef, where('serie', '==', decodedText));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje(`❌ Boleto no encontrado`);
      setColor('crimson');
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    const hoy = new Date();
    const fechaVal = new Date(data.fecha_validacion);

    if (data.estado === 'usado') {
      setMensaje('⚠️ Boleto ya fue utilizado');
      setColor('orange');
    } else if (hoy > fechaVal) {
      setMensaje('⏰ Boleto vencido');
      setColor('gray');
    } else {
      await updateDoc(doc(db, 'boletos', boletoDoc.id), { estado: 'usado' });
      setMensaje('✅ Boleto válido y registrado como usado');
      setColor('green');
    }
  };

  const handleScanError = (error) => {
    // opcional: setMensaje('Error escaneando QR');
  };

  return (
    <div className="usuarios-container">
      <h2>Escanear Código QR</h2>
      <div id="qr-reader" style={{ marginBottom: '1rem' }}></div>
      <p style={{ fontWeight: 'bold', color }}>{mensaje}</p>
      <button onClick={() => setActiveModule('Inicio')} className="btn-volver">
        Volver al Inicio
      </button>
    </div>
  );
}

export default EscanearEntrada;
