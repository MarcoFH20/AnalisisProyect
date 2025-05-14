import React, { useState } from "react";
import ReportesJuegos from "./reportes/ReportesJuegos";
import ReportesEntradas from "./reportes/ReportesEntradas";

const Reportes = ({ setActiveModule }) => {
  const [moduloActivo, setModuloActivo] = useState("juegos");

  return (
    <div className="usuarios-container">
      <h2>Reportes Generales</h2>
      <p style={{ marginBottom: "0.5rem" }}>
        Selecciona un módulo para ver sus reportes específicos
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <button
          className={moduloActivo === "entradas" ? "boton-primario" : ""}
          onClick={() => setModuloActivo("entradas")}
        >
          Reportes de Entradas
        </button>
        <button
          className={moduloActivo === "juegos" ? "boton-primario" : ""}
          onClick={() => setModuloActivo("juegos")}
        >
          Reportes de Juegos
        </button>
        <button onClick={() => setActiveModule("Inicio")}>Volver al Inicio</button>
      </div>

      {moduloActivo === "juegos" && <ReportesJuegos />}
      {moduloActivo === "entradas" && <ReportesEntradas />}
    </div>
  );
};

export default Reportes;
