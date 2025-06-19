import React, { useMemo } from 'react';
import { useIndicadores } from '@/context/IndicadoresContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter as FilterIcon } from 'lucide-react';

const GanttChart = () => {
  const { indicadores, vps, areas } = useIndicadores();
  
  // Estados para filtros (sin forzar jerarquía)
  const [vpFiltro, setVpFiltro] = React.useState('todas');
  const [areaFiltro, setAreaFiltro] = React.useState('todas');
  const [indicadorFiltro, setIndicadorFiltro] = React.useState('');

  // Obtener áreas disponibles según VP seleccionado (opcional)
  const areasDisponibles = useMemo(() => {
    if (vpFiltro === 'todas' || !Array.isArray(indicadores)) return areas || [];
    
    return [...new Set(
      indicadores
        .filter(ind => ind && ind.vp === vpFiltro)
        .map(ind => ind.area)
        .filter(Boolean)
    )];
  }, [vpFiltro, indicadores, areas]);

  // Obtener indicadores disponibles según filtros
  const indicadoresDisponibles = useMemo(() => {
    if (!Array.isArray(indicadores)) return [];
    
    return indicadores.filter(ind => {
      if (!ind || !ind.nombreIndicador) return false;
      
      const cumpleVP = vpFiltro === 'todas' || ind.vp === vpFiltro;
      const cumpleArea = areaFiltro === 'todas' || ind.area === areaFiltro;
      
      return cumpleVP && cumpleArea;
    });
  }, [indicadores, vpFiltro, areaFiltro]);

  // Transformar datos para Gantt - solo hitos, sin barra del indicador
  const datosGantt = useMemo(() => {
    if (!indicadorFiltro || !Array.isArray(indicadores)) {
      return { datos: [], meses: [], fechaMin: new Date(), fechaMax: new Date() };
    }

    const indicador = indicadores.find(ind => ind.id === parseInt(indicadorFiltro));
    if (!indicador) {
      return { datos: [], meses: [], fechaMin: new Date(), fechaMax: new Date() };
    }

    // Función para obtener color según el estado del hito
    const obtenerColorPorEstado = (estadoHito) => {
      switch (estadoHito) {
        case 'Completado':
          return '#7dc383'; // Verde claro
        case 'En Progreso':
          return '#d4a574'; // Marrón claro
        case 'Por Comenzar':
          return '#9ca3af'; // Gris claro
        default:
          return '#9ca3af'; // Gris claro por defecto
      }
    };
    const hitosArray = Array.isArray(indicador.hitos) ? indicador.hitos : [];
    
    if (hitosArray.length === 0) {
      return { datos: [], meses: [], fechaMin: new Date(), fechaMax: new Date() };
    }

    // Encontrar fechas min y max solo de los hitos - con validación mejorada
    let fechaMin = null;
    let fechaMax = null;
    
    hitosArray.forEach(hito => {
      if (!hito) return;
      
      if (hito.fechaInicioHito) {
        const fecha = new Date(hito.fechaInicioHito);
        if (!isNaN(fecha.getTime())) {
          if (!fechaMin || fecha < fechaMin) fechaMin = fecha;
          if (!fechaMax || fecha > fechaMax) fechaMax = fecha;
        }
      }
      if (hito.fechaFinalizacionHito) {
        const fecha = new Date(hito.fechaFinalizacionHito);
        if (!isNaN(fecha.getTime())) {
          if (!fechaMin || fecha < fechaMin) fechaMin = fecha;
          if (!fechaMax || fecha > fechaMax) fechaMax = fecha;
        }
      }
    });

    // Si no hay fechas válidas, usar fechas por defecto
    if (!fechaMin || !fechaMax) {
      const ahora = new Date();
      fechaMin = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaMax = new Date(ahora.getFullYear(), ahora.getMonth() + 3, 1);
    }

    // Asegurar que fechaMax sea después de fechaMin
    if (fechaMax <= fechaMin) {
      fechaMax = new Date(fechaMin.getTime() + (30 * 24 * 60 * 60 * 1000)); // Agregar 30 días
    }

    // Generar meses del rango - con límite de seguridad
    const meses = [];
    const fechaActual = new Date(fechaMin.getFullYear(), fechaMin.getMonth(), 1);
    const fechaLimite = new Date(fechaMax.getFullYear(), fechaMax.getMonth() + 1, 1);
    let contador = 0;
    const MAX_MESES = 36; // Límite de seguridad para evitar bucles infinitos
    
    while (fechaActual < fechaLimite && contador < MAX_MESES) {
      meses.push({
        mes: fechaActual.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        fecha: new Date(fechaActual)
      });
      fechaActual.setMonth(fechaActual.getMonth() + 1);
      contador++;
    }

    // Procesar solo los hitos (sin indicador principal)
    const hitosData = [];
    
    hitosArray.forEach((hito, hitoIndex) => {
      if (!hito || !hito.nombreHito) return;

      const hitoColor = obtenerColorPorEstado(hito.estadoHito);
      
      // Validar fechas del hito
      let fechaInicioHito = fechaMin;
      let fechaFinHito = fechaMax;
      
      if (hito.fechaInicioHito) {
        const tempInicio = new Date(hito.fechaInicioHito);
        if (!isNaN(tempInicio.getTime())) {
          fechaInicioHito = tempInicio;
        }
      }
      
      if (hito.fechaFinalizacionHito) {
        const tempFin = new Date(hito.fechaFinalizacionHito);
        if (!isNaN(tempFin.getTime())) {
          fechaFinHito = tempFin;
        }
      }

      // Asegurar que la fecha de fin sea después de la de inicio
      if (fechaFinHito <= fechaInicioHito) {
        fechaFinHito = new Date(fechaInicioHito.getTime() + (7 * 24 * 60 * 60 * 1000)); // Agregar 7 días
      }
      
      hitosData.push({
        id: `hito-${hitoIndex}`,
        nombre: `${hito.nombreHito} (${hito.responsableHito || 'Sin responsable'})`,
        color: hitoColor,
        fechaInicio: fechaInicioHito,
        fechaFin: fechaFinHito,
        fechaFinTexto: fechaFinHito.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        progreso: Math.max(0, Math.min(100, hito.avanceHito || 0)),
        fechaConProgreso: `${fechaFinHito.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - ${Math.max(0, Math.min(100, hito.avanceHito || 0))}%`,
        estadoHito: hito.estadoHito || 'Sin estado'
      });
    });

    // Ordenar hitos por fecha de finalización (de la más cercana a la más lejana)
    hitosData.sort((a, b) => a.fechaFin - b.fechaFin);

    return { datos: hitosData, meses, fechaMin, fechaMax };
  }, [indicadores, indicadorFiltro]);

  // Función para calcular posición de una barra
  const calcularPosicion = (fechaInicio, fechaFin, fechaMin, fechaMax) => {
    const rangoTotal = fechaMax - fechaMin;
    if (rangoTotal <= 0) return { left: 0, width: 100 };
    
    const inicioRelativo = fechaInicio - fechaMin;
    const duracion = fechaFin - fechaInicio;
    
    const left = Math.max(0, (inicioRelativo / rangoTotal) * 100);
    const width = Math.max(1, (duracion / rangoTotal) * 100);
    
    // Asegurar que no se salga del contenedor
    const maxWidth = 100 - left;
    
    return { 
      left: Math.min(left, 99), 
      width: Math.min(width, maxWidth)
    };
  };

  return (
    <div className="space-y-6">
      {/* Título centrado */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Cronograma de Indicadores - Tablero de Control Estratégico
        </h1>
        
        {/* Filtros jerárquicos */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500" />
          
          {/* Filtro por VP */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">VP:</span>
            <Select value={vpFiltro} onValueChange={setVpFiltro}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las VPs</SelectItem>
                {(vps || []).map(vp => (
                  <SelectItem key={vp} value={vp}>{vp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Área */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Área:</span>
            <Select value={areaFiltro} onValueChange={setAreaFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasDisponibles.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Indicador */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Indicador:</span>
            <Select value={indicadorFiltro} onValueChange={setIndicadorFiltro}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecciona un indicador" />
              </SelectTrigger>
              <SelectContent>
                {indicadoresDisponibles.map(ind => (
                  <SelectItem key={ind.id} value={ind.id.toString()}>
                    {ind.nombreIndicador}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Gantt simple con HTML/CSS - Solo hitos */}
      <Card className="shadow-lg">
        <CardContent className="p-4">
          {datosGantt.datos.length > 0 ? (
            <div className="gantt-container">
              {/* Header con meses */}
              <div className="gantt-header" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', borderBottom: '2px solid #ccc' }}>
                <div className="gantt-tasks-header" style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>
                  Actividades
                </div>
                <div className="gantt-timeline-header" style={{ display: 'flex', padding: '10px 0' }}>
                  {datosGantt.meses.map((mes, index) => (
                    <div key={index} style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {mes.mes}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filas del Gantt - Solo hitos */}
              <div className="gantt-body">
                {datosGantt.datos.map((hito) => (
                  <div key={hito.id} style={{ display: 'grid', gridTemplateColumns: '400px 1fr', borderBottom: '1px solid #eee', minHeight: '50px' }}>
                    <div style={{ padding: '12px 15px', borderRight: '1px solid #ccc', fontSize: '14px' }}>
                      {hito.nombre}
                    </div>
                    <div style={{ position: 'relative', padding: '8px 0' }}>
                      {(() => {
                        const pos = calcularPosicion(hito.fechaInicio, hito.fechaFin, datosGantt.fechaMin, datosGantt.fechaMax);
                        return (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${pos.left}%`,
                              width: `${pos.width}%`,
                              height: '32px',
                              backgroundColor: hito.color,
                              border: '1px solid #666',
                              borderRadius: '3px',
                              top: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              padding: '0 4px'
                            }}
                            title={`Estado: ${hito.estadoHito} | Progreso: ${hito.progreso}%`}
                          >
                            {hito.fechaConProgreso}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium mb-2">
                {!indicadorFiltro ? 'Selecciona un indicador' : 'No hay datos para mostrar'}
              </h3>
              <p>
                {!indicadorFiltro 
                  ? 'Elige un indicador de la lista para ver su cronograma detallado.'
                  : 'El indicador seleccionado no tiene hitos válidos.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttChart; 