import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import successSound from '@/assets/success.mp3';
import errorSound from '@/assets/error.mp3';

function EscanearEntrada({ setActiveModule }) {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [scannerActivo, setScannerActivo] = useState(false);
  const scannerRef = useRef(null);
  const successAudio = useRef(new Audio(successSound));
  const errorAudio = useRef(new Audio(errorSound));

  const iniciarScanner = () => {
    if (scannerActivo) return;

    const qrCodeScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = qrCodeScanner;

    qrCodeScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      handleScanSuccess,
      handleScanError
    ).then(() => {
      setScannerActivo(true);
    }).catch((err) => {
      console.error("Error iniciando escáner:", err);
    });
  };

  const detenerScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setScannerActivo(false);
      }).catch((err) => {
        console.error("Error al detener escáner:", err);
      });
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const boletosRef = collection(db, 'boletos');
    const q = query(boletosRef, where('serie', '==', decodedText));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje(`❌ Boleto no encontrado`);
      setColor('crimson');
      errorAudio.current.play();
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    const hoy = new Date();
    const fechaVal = new Date(data.fecha_validacion);

    if (data.estado === 'usado') {
      setMensaje('⚠️ Boleto ya fue utilizado');
      setColor('orange');
      errorAudio.current.play();
    } else if (hoy > fechaVal) {
      setMensaje('⏰ Boleto vencido');
      setColor('gray');
      errorAudio.current.play();
    } else {
      await updateDoc(doc(db, 'boletos', boletoDoc.id), { estado: 'usado' });
      setMensaje('✅ Boleto válido y registrado como usado');
      setColor('green');
      successAudio.current.play();
    }
  };

  const handleScanError = (err) => {
    // Omitido: No interrumpe escaneo
  };

  useEffect(() => {
    return () => {
      detenerScanner(); // Detener al salir del componente
    };
  }, []);

  return (
    <div className="usuarios-container">
      <h2>Escanear Código QR</h2>

      {!scannerActivo && (
        <button onClick={iniciarScanner} className="btn-activar">
          Activar escáner
        </button>
      )}

      {scannerActivo && (
        <button onClick={detenerScanner} className="btn-detener">
          Detener escáner
        </button>
      )}

      <div id="qr-reader" style={{ width: '300px', margin: '1rem auto' }}></div>

      <p style={{ fontWeight: 'bold', color }}>{mensaje}</p>

      <button onClick={() => setActiveModule('Inicio')} className="btn-volver">
        Volver al Inicio
      </button>
    </div>
  );
}

export default EscanearEntrada;
