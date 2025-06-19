import { useState, useEffect } from "react";

const Dashboard = () => {
  const [indicadores, setIndicadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [datosVisualizacion, setDatosVisualizacion] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const API_BASE_URL = "https://backend-indicadores-production.up.railway.app";

  const cargarIndicadores = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/api/indicadores`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      // Asegurar que data es un array
      if (!Array.isArray(data)) {
        console.warn("Los datos no son un array:", data);
        setIndicadores([]);
      } else {
        setIndicadores(data);
      }

      procesarDatosVisualizacion(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando indicadores:", error);
      setError(error.message);
      setIndicadores([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/indicadores/cargar-datos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("✅ Datos cargados exitosamente. Recargando página...");
        window.location.reload(); // Recargar para mostrar nuevos datos
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error de conexión: ${error.message}`);
    } finally {
      setCargandoDatos(false);
    }
  };

  const procesarDatosVisualizacion = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      setDatosVisualizacion({
        totalIndicadores: 0,
        porArea: {},
        porTipo: {},
        porEstado: {},
      });
      return;
    }

    const stats = {
      totalIndicadores: data.length,
      porArea: {},
      porTipo: {},
      porEstado: {},
    };

    data.forEach((indicador) => {
      // Conteo por área
      const area = indicador.area || "Sin área";
      stats.porArea[area] = (stats.porArea[area] || 0) + 1;

      // Conteo por tipo
      const tipo = indicador.tipoIndicador || "Sin tipo";
      stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;

      // Análisis de estado basado en hitos
      if (Array.isArray(indicador.hitos)) {
        indicador.hitos.forEach((hito) => {
          const estado = hito.estadoHito || "Sin estado";
          stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
        });
      }
    });

    setDatosVisualizacion(stats);
  };

  useEffect(() => {
    cargarIndicadores();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error de conexión
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarIndicadores}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay indicadores, mostrar opción para cargar datos
  if (Array.isArray(indicadores) && indicadores.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
          <div className="text-blue-600 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Base de datos vacía
          </h2>
          <p className="text-blue-600 mb-6">
            No se encontraron indicadores. Carga los datos reales de tu
            organización para comenzar.
          </p>

          <button
            onClick={cargarDatos}
            disabled={cargandoDatos}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {cargandoDatos ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cargando datos reales...
              </>
            ) : (
              <>📊 Cargar datos de la organización</>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Se cargarán los datos reales: VPD, VPE, Alianza Estratégica, etc.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Indicadores
        </h1>
        <p className="mt-2 text-gray-600">
          Vista general del sistema de gestión de indicadores
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      {datosVisualizacion && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Indicadores
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {datosVisualizacion.totalIndicadores}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🏢</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Áreas Activas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(datosVisualizacion.porArea).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📈</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tipos de Indicador
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(datosVisualizacion.porTipo).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">✅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Estados Únicos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(datosVisualizacion.porEstado).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de indicadores recientes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Indicadores Recientes
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Lista de los últimos indicadores registrados en el sistema
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {Array.isArray(indicadores) &&
            indicadores.slice(0, 5).map((indicador) => (
              <li key={indicador.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {indicador.nombreIndicador}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {indicador.area}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        📊 {indicador.tipoIndicador}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        👤 {indicador.responsableGeneral}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        📅 {indicador.fechaInicioGeneral} -{" "}
                        {indicador.fechaFinalizacionGeneral}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Gráficos de distribución */}
      {datosVisualizacion && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución por área */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribución por Área
              </h3>
              <div className="space-y-3">
                {Object.entries(datosVisualizacion.porArea).map(
                  ([area, cantidad]) => (
                    <div
                      key={area}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{area}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (cantidad /
                                  datosVisualizacion.totalIndicadores) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {cantidad}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Distribución por tipo */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribución por Tipo
              </h3>
              <div className="space-y-3">
                {Object.entries(datosVisualizacion.porTipo).map(
                  ([tipo, cantidad]) => (
                    <div
                      key={tipo}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{tipo}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (cantidad /
                                  datosVisualizacion.totalIndicadores) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {cantidad}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
