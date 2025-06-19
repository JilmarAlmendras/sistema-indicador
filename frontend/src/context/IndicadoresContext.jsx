import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { indicadoresApi } from '@/lib/api';

const IndicadoresContext = createContext();

export const useIndicadores = () => {
  const context = useContext(IndicadoresContext);
  if (!context) {
    throw new Error('useIndicadores debe ser usado dentro de un IndicadoresProvider');
  }
  return context;
};

export const IndicadoresProvider = ({ children }) => {
  const [indicadores, setIndicadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // VPs basados en los datos reales
  const vps = [
    'VPD',
    'VPE', 
    'PRE'
  ];

  // Áreas basadas en los datos reales (nombres exactos como aparecen en la BD)
  const areasPorVP = {
    VPD: ['Alianza Estratégica', 'Análisis y Estudios Ecónomicos', 'Efectividad y Desarrollo'],
    VPE: ['TEI', 'Talento Humano'],
    PRE: ['Auditoria', 'Comunicación', 'Gestión de Riesgos', 'Legal']
  };

  // Lista completa de todas las áreas para compatibilidad
  const areas = Object.values(areasPorVP).flat();

  // Función para obtener áreas según VP
  const obtenerAreasPorVP = (vp) => {
    return areasPorVP[vp] || [];
  };

  // Estados basados en los datos reales (nombres exactos como aparecen en la BD)
  const estados = [
    'Completado',
    'En Progreso', 
    'Por Comenzar'
  ];

  // Tipos de indicador basados en los datos reales (nombres exactos como aparecen en la BD)
  const tiposIndicador = [
    'Estratégico',
    'Gestion'
  ];

  const cargarIndicadores = async () => {
    try {
      setLoading(true);
      console.log('🔍 CONTEXTO - Cargando indicadores...');
      
      let dataToUse = [];
      
      const response = await indicadoresApi.getIndicadores();
      console.log('🔍 CONTEXTO - Respuesta de la API:', response);
      
      if (Array.isArray(response.data)) {
        dataToUse = response.data;
        console.log('✅ CONTEXTO - API funcionó correctamente, datos cargados:', dataToUse.length);
      } else {
        throw new Error('La API no devolvió un array válido de indicadores');
      }
      
      // Log detallado de estructura si hay datos
      if (Array.isArray(dataToUse) && dataToUse.length > 0) {
        console.log('🔍 CONTEXTO - Primer indicador completo:', dataToUse[0]);
        console.log('🔍 CONTEXTO - Propiedades del primer indicador:', Object.keys(dataToUse[0] || {}));
        if (dataToUse[0]?.hitos) {
          console.log('🔍 CONTEXTO - Hitos del primer indicador:', dataToUse[0].hitos);
          console.log('🔍 CONTEXTO - Es array de hitos?:', Array.isArray(dataToUse[0].hitos));
          console.log('🔍 CONTEXTO - Cantidad de hitos:', dataToUse[0].hitos.length);
          if (dataToUse[0].hitos.length > 0) {
            console.log('🔍 CONTEXTO - Primer hito:', dataToUse[0].hitos[0]);
            console.log('🔍 CONTEXTO - Propiedades del primer hito:', Object.keys(dataToUse[0].hitos[0] || {}));
          }
        }
      }
      
      console.log('🔍 CONTEXTO - Antes de setIndicadores, dataToUse:', dataToUse);
      console.log('🔍 CONTEXTO - dataToUse es array?:', Array.isArray(dataToUse));
      console.log('🔍 CONTEXTO - dataToUse length:', dataToUse.length);
      
      setIndicadores(dataToUse);
      console.log('✅ CONTEXTO - setIndicadores ejecutado con:', dataToUse.length, 'elementos');
      
      // Verificar que se seteó correctamente
      setTimeout(() => {
        console.log('🔍 CONTEXTO - Verificación post-setState completada');
      }, 100);
      
      setError(null);
    } catch (err) {
      console.error('❌ CONTEXTO - Error final al cargar los indicadores:', err);
      setError('Error al cargar los indicadores: ' + err.message);
      setIndicadores([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
      console.log('🔍 CONTEXTO - Loading finalizado');
    }
  };

  useEffect(() => {
    cargarIndicadores();
  }, []);

  const agregarIndicador = async (nuevoIndicador) => {
    try {
      const response = await indicadoresApi.createIndicador(nuevoIndicador);
      setIndicadores(prev => [...prev, response.data]);
      toast({
        title: "Indicador agregado",
        description: "El indicador y sus hitos han sido agregados exitosamente.",
        duration: 3000,
      });
      return response.data;
    } catch (err) {
      let errorMessage = 'Error al crear el indicador';
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMessage = 'No se puede conectar al servidor. Verifique que el backend esté corriendo.';
      } else if (err.message.includes('HTTP')) {
        // Error del servidor con respuesta (tu nueva API estructura)
        errorMessage = `Error del servidor: ${err.message}`;
      } else if (err.message.includes('Mixed Content')) {
        errorMessage = 'Error de seguridad: Protocolo HTTPS/HTTP mixto. Contacte al administrador.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      console.error('Error completo:', err);
      
      toast({
        title: "Error al agregar indicador",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      throw new Error(errorMessage);
    }
  };

  const actualizarIndicador = async (id, datosActualizados) => {
    try {
      const response = await indicadoresApi.updateIndicador(id, datosActualizados);
      setIndicadores(prev => prev.map(ind => ind.id === id ? response.data : ind));
      toast({
        title: "Hito actualizado",
        description: "El hito ha sido actualizado exitosamente.",
        duration: 3000,
      });
      return response.data;
    } catch (err) {
      setError('Error al actualizar el indicador');
      console.error('Error:', err);
      throw err;
    }
  };
  
  const eliminarIndicador = async (id) => {
    try {
      await indicadoresApi.deleteIndicador(id);
      setIndicadores(prev => prev.filter(ind => ind.id !== id));
      toast({
        title: "Indicador eliminado",
        description: "El indicador ha sido eliminado exitosamente.",
        variant: "destructive",
        duration: 3000,
      });
    } catch (err) {
      setError('Error al eliminar el indicador');
      console.error('Error:', err);
      throw err;
    }
  };

  const obtenerEstadisticas = async () => {
    try {
      const response = await indicadoresApi.getEstadisticas();
      return response.data;
    } catch (err) {
      setError('Error al obtener estadísticas');
      console.error('Error:', err);
      return {
        totalIndicadores: 0,
        totalHitos: 0,
        hitosCompletados: 0,
        hitosEnProceso: 0,
        promedioAvance: 0
      };
    }
  };

  const filtrarPorArea = async (area) => {
    try {
      if (area === 'Todas') {
        const response = await indicadoresApi.getIndicadores();
        return response.data;
      }
      const response = await indicadoresApi.getIndicadoresByArea(area);
      return response.data;
    } catch (err) {
      setError('Error al filtrar los indicadores');
      console.error('Error:', err);
      return [];
    }
  };

  const exportarXLSX = () => {
    if (!indicadores || indicadores.length === 0) {
      toast({
        title: "Error al exportar",
        description: "No hay datos para exportar.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }

    // Preparar datos para Excel
    const excelData = [];
    
    (indicadores || []).forEach(indicador => {
      if (indicador && Array.isArray(indicador.hitos)) {
        indicador.hitos.forEach(hito => {
          if (hito) {
            excelData.push({
              'ID Indicador': indicador.id,
              'VP': indicador.vp,
              'Área': indicador.area,
              'Nombre Indicador': indicador.nombreIndicador,
              'Tipo Indicador': indicador.tipoIndicador,
              'Fecha Inicio General': indicador.fechaInicioGeneral,
              'Fecha Finalización General': indicador.fechaFinalizacionGeneral,
              'Responsable General': indicador.responsableGeneral,
              'Responsable Carga General': indicador.responsableCargaGeneral,
              'Fecha Carga Indicador': indicador.fechaCarga,
              'ID Hito': hito.idHito,
              'Nombre Hito': hito.nombreHito,
              'Orden Hito': hito.ordenHito,
              'Fecha Inicio Hito': hito.fechaInicioHito,
              'Fecha Finalización Hito': hito.fechaFinalizacionHito,
              'Avance Hito (%)': hito.avanceHito,
              'Estado Hito': hito.estadoHito,
              'Responsable Hito': hito.responsableHito
            });
          }
        });
      }
    });

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar ancho de columnas automático
    const columnWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15) // Mínimo 15 caracteres de ancho
    }));
    worksheet['!cols'] = columnWidths;
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Indicadores y Hitos');
    
    // Generar nombre del archivo con fecha
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Indicadores_Horizons_${fechaActual}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
    
    toast({
      title: "Exportación exitosa",
      description: `Los datos han sido exportados a ${nombreArchivo}`,
      duration: 3000,
    });
    
    return workbook;
  };

  const value = {
    indicadores,
    loading,
    error,
    vps,
    areas,
    areasPorVP,
    obtenerAreasPorVP,
    estados,
    tiposIndicador,
    agregarIndicador,
    actualizarIndicador,
    eliminarIndicador,
    cargarIndicadores,
    obtenerEstadisticas,
    filtrarPorArea,
    exportarXLSX
  };

  return (
    <IndicadoresContext.Provider value={value}>
      {children}
    </IndicadoresContext.Provider>
  );
};