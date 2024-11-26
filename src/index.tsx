import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Estilos generales de la aplicación
import App from './App'; // Componente principal
import reportWebVitals from './reportWebVitals'; // Para medir rendimiento (opcional)

// Crear el root y montar la aplicación
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Medición de rendimiento (opcional)
reportWebVitals();
