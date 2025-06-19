import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Filter,
  ListChecks,
  TrendingUp,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { useIndicadores } from '@/context/IndicadoresContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard = () => {
  const { indicadores, areas } = useIndicadores();
  const [areaSeleccionada, setAreaSeleccionada] = useState('Todas');
  const [indicadoresFiltrados, setIndicadoresFiltrados] = useState([]);



  // Filtrar indicadores cuando cambia el área seleccionada
  useEffect(() => {
    if (!Array.isArray(indicadores)) {
      setIndicadoresFiltrados([]);
      return;
    }
    
    if (areaSeleccionada === 'Todas') {
      setIndicadoresFiltrados(indicadores);
    } else {
      const filtrados = indicadores.filter(ind => ind && ind.area === areaSeleccionada);
      setIndicadoresFiltrados(filtrados);
    }
  }, [indicadores, areaSeleccionada]);

  // Calcular estadísticas basadas en los indicadores filtrados
  const estadisticasFiltradas = React.useMemo(() => {
    console.log('🔍 DASHBOARD - Calculando estadísticas');
    console.log('🔍 DASHBOARD - indicadoresFiltrados:', indicadoresFiltrados);
    console.log('🔍 DASHBOARD - indicadoresFiltrados es array?:', Array.isArray(indicadoresFiltrados));
    console.log('🔍 DASHBOARD - indicadoresFiltrados length:', indicadoresFiltrados?.length);
    
    if (!Array.isArray(indicadoresFiltrados)) {
      console.warn('⚠️ DASHBOARD - indicadoresFiltrados no es array');
      return {
        totalIndicadores: 0,
        totalHitos: 0,
        hitosCompletados: 0,
        hitosEnProgreso: 0,
        hitosPorComenzar: 0,
        promedioAvance: 0
      };
    }
    
    const todosLosHitos = indicadoresFiltrados.flatMap(ind => {
      if (!ind || !Array.isArray(ind.hitos)) {
        console.log('⚠️ DASHBOARD - Indicador sin hitos válidos:', ind);
        return [];
      }
      console.log('✅ DASHBOARD - Indicador con hitos:', ind.nombreIndicador, 'hitos:', ind.hitos.length);
      return ind.hitos.filter(hito => hito);
    });
    
    console.log('🔍 DASHBOARD - todosLosHitos:', todosLosHitos);
    console.log('🔍 DASHBOARD - total hitos encontrados:', todosLosHitos.length);
    
    const hitosCompletados = todosLosHitos.filter(hito => hito && hito.estadoHito === 'Completado').length;
    const hitosEnProgreso = todosLosHitos.filter(hito => hito && hito.estadoHito === 'En Progreso').length;
    const hitosPorComenzar = todosLosHitos.filter(hito => hito && hito.estadoHito === 'Por Comenzar').length;
    
    // Calcular promedio de avance con validaciones
    const avanceTotal = todosLosHitos.reduce((sum, hito) => {
      const avance = hito && typeof hito.avanceHito === 'number' ? hito.avanceHito : 0;
      return sum + avance;
    }, 0);
    
    const promedioAvance = todosLosHitos.length > 0 ? 
      Math.round(avanceTotal / todosLosHitos.length * 100) / 100 : 0;

    const stats = {
      totalIndicadores: indicadoresFiltrados.length,
      totalHitos: todosLosHitos.length,
      hitosCompletados,
      hitosEnProgreso,
      hitosPorComenzar,
      promedioAvance
    };
    
    console.log('📊 DASHBOARD - Estadísticas calculadas:', stats);
    return stats;
  }, [indicadoresFiltrados]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const hitosRecientes = React.useMemo(() => {
    if (!Array.isArray(indicadoresFiltrados)) return [];
    
    return indicadoresFiltrados
      .flatMap(indicador => {
        if (!indicador || !Array.isArray(indicador.hitos)) return [];
        
        return indicador.hitos
          .filter(hito => hito)
          .map(hito => ({
            ...hito, 
            indicadorNombre: indicador.nombreIndicador || 'Sin nombre', 
            area: indicador.area || 'Sin área'
          }));
      })
      .slice(0, 5);
  }, [indicadoresFiltrados]);

  return (
    <div className="space-y-6">
      
      {/* Panel de debugging visual */}
      <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h3 className="font-bold mb-2">🔍 DEBUG - Valores en tiempo real:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>indicadores (contexto):</strong>
            <p>Array: {Array.isArray(indicadores) ? 'Sí' : 'No'}</p>
            <p>Length: {Array.isArray(indicadores) ? indicadores.length : 'N/A'}</p>
          </div>
          <div>
            <strong>indicadoresFiltrados:</strong>
            <p>Array: {Array.isArray(indicadoresFiltrados) ? 'Sí' : 'No'}</p>
            <p>Length: {Array.isArray(indicadoresFiltrados) ? indicadoresFiltrados.length : 'N/A'}</p>
          </div>
          <div>
            <strong>estadisticasFiltradas:</strong>
            <p>Total Indicadores: {estadisticasFiltradas?.totalIndicadores ?? 'N/A'}</p>
            <p>Total Hitos: {estadisticasFiltradas?.totalHitos ?? 'N/A'}</p>
          </div>
          <div>
            <strong>hitosRecientes:</strong>
            <p>Array: {Array.isArray(hitosRecientes) ? 'Sí' : 'No'}</p>
            <p>Length: {Array.isArray(hitosRecientes) ? hitosRecientes.length : 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* DEBUG: Logs antes del renderizado */}
      {console.log('🎯 DASHBOARD RENDER - estadisticasFiltradas:', estadisticasFiltradas)}
      {console.log('🎯 DASHBOARD RENDER - indicadoresFiltrados:', indicadoresFiltrados)}
      {console.log('🎯 DASHBOARD RENDER - hitosRecientes:', hitosRecientes)}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoreo de indicadores y progreso de proyectos</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={areaSeleccionada} onValueChange={setAreaSeleccionada}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas las áreas</SelectItem>
              {Array.isArray(areas) && areas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500 h-full">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Indicadores</p>
                <p className="text-3xl font-bold text-blue-600 mb-2">{estadisticasFiltradas.totalIndicadores}</p>
                <BarChart className="h-6 w-6 text-blue-500 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-teal-500 h-full">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Hitos</p>
                <p className="text-3xl font-bold text-teal-600 mb-2">{estadisticasFiltradas.totalHitos}</p>
                <ListChecks className="h-6 w-6 text-teal-500 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500 h-full">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Completados</p>
                <p className="text-3xl font-bold text-green-600 mb-2">{estadisticasFiltradas.hitosCompletados}</p>
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500 h-full">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">En Progreso</p>
                <p className="text-3xl font-bold text-amber-600 mb-2">{estadisticasFiltradas.hitosEnProgreso}</p>
                <Clock className="h-6 w-6 text-amber-500 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-gray-500 h-full">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Por Comenzar</p>
                <p className="text-3xl font-bold text-gray-600 mb-2">{estadisticasFiltradas.hitosPorComenzar}</p>
                <div className="w-6 h-6 bg-gray-500 rounded mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-2 md:col-span-3 lg:col-span-5">
          <Card className="border-l-4 border-l-purple-500 h-full">
            <CardContent className="p-4">
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-2">Avance Promedio de Hitos</p>
                  <p className="text-4xl font-bold text-purple-600">{estadisticasFiltradas.promedioAvance}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Hitos Recientes ({areaSeleccionada === 'Todas' ? 'Todas las áreas' : areaSeleccionada})</CardTitle>
                <Link to="/historial">
                  <Button variant="ghost" className="flex items-center gap-1 text-primary">
                    Ver todos <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Indicador</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Hito</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Área</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Avance Hito</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado Hito</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Responsable Hito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitosRecientes.map((hito, index) => (
                      <tr key={`${hito.idHito}-${index}`} className="table-row-alt">
                        <td className="py-3 px-4">{hito.indicadorNombre}</td>
                        <td className="py-3 px-4">{hito.nombreHito}</td>
                        <td className="py-3 px-4">{hito.area}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${hito.avanceHito}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{hito.avanceHito}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hito.estadoHito === 'Completado' ? 'bg-green-100 text-green-800' :
                            hito.estadoHito === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                            hito.estadoHito === 'Por Comenzar' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {hito.estadoHito}
                          </span>
                        </td>
                        <td className="py-3 px-4">{hito.responsableHito}</td>
                      </tr>
                    ))}
                    {hitosRecientes.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                          No hay hitos disponibles para el área seleccionada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row gap-6"
      >
        <motion.div variants={itemVariants} className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/nuevo-indicador">
                <Button className="w-full justify-start">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Nuevo Indicador
                </Button>
              </Link>
              <Link to="/actualizar-indicador">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar Hito Existente
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <img alt="Icono de información detallada" className="w-6 h-6 mt-1" src="https://images.unsplash.com/photo-1662057219054-ac91f1c562b5" />
                  <div>
                    <h4 className="font-medium">Seguimiento Detallado</h4>
                    <p className="text-sm text-gray-600">Monitorea el progreso de tus indicadores y cada uno de sus hitos de forma individual.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img alt="Icono de gráfico para reportes" className="w-6 h-6 mt-1" src="https://images.unsplash.com/photo-1618044733300-9472054094ee" />
                  <div>
                    <h4 className="font-medium">Reportes Completos</h4>
                    <p className="text-sm text-gray-600">Exporta todos los datos, incluyendo detalles de hitos, a CSV para análisis.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;