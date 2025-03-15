import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ComboBox.css'; // Crea este archivo para los estilos

// Interfaz para los datos de la aplicación
interface Application {
  id: string;
  name: string;
  domains: string[];
}

const ComboBox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Función para obtener las aplicaciones desde la API
  const fetchApplications = async (search: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/applications?q=${search}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  // Maneja el cambio en el input y aplica debounce para limitar peticiones
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (value.trim() !== '') {
        fetchApplications(value);
      } else {
        setApplications([]);
      }
    }, 300); // 300ms de retardo
  };

  // Maneja la navegación con el teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => Math.min(prev + 1, applications.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < applications.length) {
        selectApplication(applications[activeIndex]);
      }
    }
  };

  // Función para seleccionar una aplicación de la lista
  const selectApplication = (app: Application) => {
    setSelectedApp(app);
    setQuery(app.name);
    setApplications([]);
    setActiveIndex(-1);
  };

  return (
    <div className="combo-box">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar aplicación..."
        className="combo-input"
      />
      {isLoading && <div className="loading">Cargando...</div>}
      {applications.length > 0 && (
        <ul className="suggestions">
          {applications.map((app, index) => (
            <li
              key={app.id}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => selectApplication(app)}
            >
              {/* Imagenes */}
              <img src={`/icons/ic_${app.id}.svg`} alt={app.name} className="app-icon" />
              <span className="app-name">{app.name}</span> - <span className="app-domain">{app.domains[0]}</span>
            </li>
          ))}
        </ul>
      )}
      {selectedApp && (
        <div className="selected-app">
          <strong>Seleccionado:</strong> {selectedApp.name}
        </div>
      )}
    </div>
  );
};

export default ComboBox;
