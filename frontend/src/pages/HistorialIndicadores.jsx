import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Search } from 'lucide-react';
import { useIndicadores } from '@/context/IndicadoresContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

const HistorialIndicadores = () => {
  const { indicadores, vps, areas, estados, exportarXLSX } = useIndicadores();
  
  console.log('🔍 HISTORIAL - Componente renderizándose');
  console.log('🔍 HISTORIAL - indicadores:', indicadores);
  console.log('🔍 HISTORIAL - indicadores es array?:', Array.isArray(indicadores));
  console.log('🔍 HISTORIAL - indicadores length:', indicadores?.length);
  console.log('🔍 HISTORIAL - vps:', vps);
  console.log('🔍 HISTORIAL - areas:', areas);
  
  // Estados para filtros jerárquicos: VP → Área → Indicador
  const [vpFiltro, setVpFiltro] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('');
  const [indicadorFiltro, setIndicadorFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Áreas filtradas basadas en VP seleccionado
  const areasFiltradas = useMemo(() => {
    if (!vpFiltro || !Array.isArray(indicadores)) return [];
    
    return [...new Set(
      indicadores
        .filter(ind => ind && ind.vp === vpFiltro)
        .map(ind => ind.area)
        .filter(Boolean) // Filtrar valores null/undefined
    )].sort();
  }, [indicadores, vpFiltro]);

  // Indicadores filtrados basados en VP y Área seleccionados
  const indicadoresFiltrados = useMemo(() => {
    if (!vpFiltro || !areaFiltro || !Array.isArray(indicadores)) return [];
    
    return indicadores
      .filter(ind => ind && ind.vp === vpFiltro && ind.area === areaFiltro)
      .sort((a, b) => (a.nombreIndicador || '').localeCompare(b.nombreIndicador || ''));
  }, [indicadores, vpFiltro, areaFiltro]);

  // Limpiar filtros dependientes cuando cambia un filtro padre
  const handleVpChange = (nuevoVp) => {
    setVpFiltro(nuevoVp || '');
    setAreaFiltro('');
    setIndicadorFiltro('');
  };

  const handleAreaChange = (nuevaArea) => {
    setAreaFiltro(nuevaArea || '');
    setIndicadorFiltro('');
  };

  // Hitos filtrados según la jerarquía
  const hitosFiltrados = useMemo(() => {
    if (!Array.isArray(indicadores)) return [];
    
    let indicadoresParaMostrar = indicadores;

    // Aplicar filtros jerárquicos con validaciones
    if (vpFiltro) {
      indicadoresParaMostrar = indicadoresParaMostrar.filter(ind => ind && ind.vp === vpFiltro);
    }
    if (areaFiltro) {
      indicadoresParaMostrar = indicadoresParaMostrar.filter(ind => ind && ind.area === areaFiltro);
    }
    if (indicadorFiltro) {
      const indicadorId = parseInt(indicadorFiltro);
      if (!isNaN(indicadorId)) {
        indicadoresParaMostrar = indicadoresParaMostrar.filter(ind => ind && ind.id === indicadorId);
      }
    }

    // Convertir a hitos con validaciones robustas
    const todosLosHitos = indicadoresParaMostrar.flatMap(indicador => {
      if (!indicador || !Array.isArray(indicador.hitos)) return [];
      
      return indicador.hitos
        .filter(hito => hito) // Filtrar hitos null/undefined
        .map(hito => ({
          ...hito,
          idIndicador: indicador.id,
          nombreIndicador: indicador.nombreIndicador || 'Sin nombre',
          area: indicador.area || 'Sin área',
          vp: indicador.vp || 'Sin VP',
          tipoIndicador: indicador.tipoIndicador || 'Sin tipo',
          responsableGeneral: indicador.responsableGeneral || 'Sin responsable'
        }));
    });

    // Aplicar búsqueda con validaciones
    return todosLosHitos.filter(hito => {
      if (!hito) return false;
      
      const terminoBusqueda = (busqueda || '').toLowerCase();
      if (!terminoBusqueda) return true;
      
      const campos = [
        hito.nombreIndicador,
        hito.nombreHito,
        hito.responsableHito,
        hito.responsableGeneral
      ];
      
      return campos.some(campo => 
        campo && typeof campo === 'string' && campo.toLowerCase().includes(terminoBusqueda)
      );
    });
  }, [indicadores, vpFiltro, areaFiltro, indicadorFiltro, busqueda]);

  const handleExportar = () => {
    exportarXLSX();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historial Detallado de Hitos</h1>
          <p className="text-gray-600 mt-1">Consulta y exporta el historial completo de indicadores y sus hitos.</p>
        </div>
        
        <Button 
          onClick={handleExportar}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros Jerárquicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 1. Vicepresidencia */}
            <div className="space-y-2">
              <Label htmlFor="vp-select" className="text-sm font-medium">
                1. Vicepresidencia
              </Label>
              <Select value={vpFiltro} onValueChange={handleVpChange}>
                <SelectTrigger id="vp-select">
                  <SelectValue placeholder="Seleccionar VP" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(vps) && vps.map(vp => (
                    <SelectItem key={vp} value={vp}>{vp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Área */}
            <div className="space-y-2">
              <Label htmlFor="area-select" className="text-sm font-medium">
                2. Área
              </Label>
              <Select 
                value={areaFiltro} 
                onValueChange={handleAreaChange}
                disabled={!vpFiltro}
              >
                <SelectTrigger id="area-select">
                  <SelectValue placeholder={!vpFiltro ? "Primero seleccione VP" : "Seleccionar Área"} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(areasFiltradas) && areasFiltradas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Indicador */}
            <div className="space-y-2">
              <Label htmlFor="indicador-select" className="text-sm font-medium">
                3. Indicador
              </Label>
              <Select 
                value={indicadorFiltro} 
                onValueChange={setIndicadorFiltro}
                disabled={!areaFiltro}
              >
                <SelectTrigger id="indicador-select">
                  <SelectValue placeholder={!areaFiltro ? "Primero seleccione Área" : "Seleccionar Indicador"} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(indicadoresFiltrados) && indicadoresFiltrados.map(indicador => (
                    <SelectItem key={indicador.id} value={indicador.id.toString()}>
                      {indicador.nombreIndicador || 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="busqueda" className="text-sm font-medium">
                Búsqueda
              </Label>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  id="busqueda"
                  placeholder="Buscar hito o responsable"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {(vpFiltro || areaFiltro || indicadorFiltro || busqueda) && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setVpFiltro('');
                  setAreaFiltro('');
                  setIndicadorFiltro('');
                  setBusqueda('');
                }}
                className="text-sm"
              >
                Limpiar todos los filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Listado de Hitos
            {hitosFiltrados.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({hitosFiltrados.length} hitos encontrados)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VP</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Hito</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(hitosFiltrados) && hitosFiltrados.length > 0 ? (
                  hitosFiltrados.map((hito) => (
                    <TableRow key={hito.idHito || Math.random()} className="table-row-alt">
                      <TableCell className="font-medium">{hito.vp || 'N/A'}</TableCell>
                      <TableCell>{hito.area || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{hito.nombreIndicador || 'N/A'}</TableCell>
                      <TableCell>{hito.nombreHito || 'N/A'}</TableCell>
                      <TableCell>
                        {hito.fechaInicioHito ? 
                          new Date(hito.fechaInicioHito).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {hito.fechaFinalizacionHito ? 
                          new Date(hito.fechaFinalizacionHito).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${Math.max(0, Math.min(100, hito.avanceHito || 0))}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{hito.avanceHito || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hito.estadoHito === 'Completado' ? 'bg-green-100 text-green-800' :
                          hito.estadoHito === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                          hito.estadoHito === 'Por Comenzar' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hito.estadoHito || 'Sin estado'}
                        </span>
                      </TableCell>
                      <TableCell>{hito.responsableHito || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {!vpFiltro ? (
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="h-8 w-8 text-gray-400" />
                          <span>Selecciona una Vicepresidencia para comenzar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-gray-400" />
                          <span>No se encontraron hitos con los filtros seleccionados</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HistorialIndicadores;