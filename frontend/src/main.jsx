// ========== POLYFILLS PARA COMPATIBILIDAD ==========
// Polyfill para Array.flat()
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth = 1) {
    const flatten = (arr, currentDepth) => {
      return currentDepth > 0 ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, currentDepth - 1) : val), []) : arr.slice();
    };
    return flatten(this, depth);
  };
}

// Polyfill para Array.flatMap()
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function(callback, thisArg) {
    return this.map(callback, thisArg).flat();
  };
}

// Polyfill para arrays no nativos o que pueden no tener flatMap
const originalFlatMap = Array.prototype.flatMap;
Array.prototype.flatMap = function(callback, thisArg) {
  // Asegurar que tenemos un array válido
  if (this == null) {
    throw new TypeError('Array.prototype.flatMap called on null or undefined');
  }
  
  // Convertir a objeto
  const O = Object(this);
  
  // Obtener length como entero
  const len = parseInt(O.length) || 0;
  
  // Si no hay callback, error
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  // Crear array resultado
  const result = [];
  
  // Iterar elementos
  for (let i = 0; i < len; i++) {
    if (i in O) {
      const mapped = callback.call(thisArg, O[i], i, O);
      if (Array.isArray(mapped)) {
        result.push(...mapped);
      } else {
        result.push(mapped);
      }
    }
  }
  
  return result;
};

// ========== IMPORTS PRINCIPALES ==========
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
