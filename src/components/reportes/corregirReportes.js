import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

const corregirModuloEnReportes = async () => {
  const snap = await getDocs(collection(db, "reportes"));

  const actualizaciones = snap.docs
    .filter((d) => !d.data().modulo) // Solo los que no tienen campo "modulo"
    .map((d) => {
      const data = d.data();
      const tieneSerie = !!data.serie || !!data.tipoEntrada; // Campos típicos de entradas
      const nuevoModulo = tieneSerie ? "entradas" : "juegos";

      return updateDoc(doc(db, "reportes", d.id), { modulo: nuevoModulo });
    });

  await Promise.all(actualizaciones);
  console.log("✅ Reportes actualizados con el campo 'modulo'");
};

corregirModuloEnReportes();
