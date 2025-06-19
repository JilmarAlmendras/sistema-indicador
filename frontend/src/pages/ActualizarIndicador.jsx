import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIndicadores } from '@/context/IndicadoresContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Filter, RefreshCw, CheckCircle, Clock, Circle, Target } from 'lucide-react';

const ActualizarIndicador = () => {
  const navigate = useNavigate();
  const { indicadores, actualizarIndicador, estados, vps, areas } = useIndicadores();
  
  // Estados para filtros siguiendo jerarquía: VP → Área → Indicador → Hito → Responsable
  const [vpFiltro, setVpFiltro] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('');
  const [indicadorFiltro, setIndicadorFiltro] = useState('');
  const [hitoFiltro, setHitoFiltro] = useState('');
  const [responsableFiltro, setResponsableFiltro] = useState('');
  
  // Estados para la actualización
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [formData, setFormData] = useState({
    avanceHito: 0,
    estadoHito: '',
    comentarioHito: '',
    fechaFinalizacionHito: '',
    fechaInicioHito: '' // Solo para referencia, no editable
  });

  // Crear lista de todos los hitos con información del indicador padre
  const todosLosHitos = useMemo(() => {
    if (!Array.isArray(indicadores)) return [];
    
    return indicadores.flatMap(indicador => {
      if (!indicador || !Array.isArray(indicador.hitos)) return [];
      
      return indicador.hitos
        .filter(hito => hito) // Filtrar hitos null/undefined
        .map(hito => ({
          ...hito,
          indicadorId: indicador.id,
          indicadorNombre: indicador.nombreIndicador || 'Sin nombre',
          vp: indicador.vp || 'Sin VP',
          area: indicador.area || 'Sin área',
          tipoIndicador: indicador.tipoIndicador || 'Sin tipo'
        }));
    });
  }, [indicadores]);

  // Obtener áreas disponibles según VP seleccionado
  const areasDisponibles = useMemo(() => {
    if (!vpFiltro || !Array.isArray(indicadores)) return [];
    
    return [...new Set(
      indicadores
        .filter(ind => ind && ind.vp === vpFiltro)
        .map(ind => ind.area)
        .filter(Boolean) // Filtrar valores null/undefined
    )];
  }, [vpFiltro, indicadores]);

  // Obtener indicadores disponibles según VP y Área seleccionados
  const indicadoresDisponibles = useMemo(() => {
    if (!vpFiltro || !areaFiltro || !Array.isArray(indicadores)) return [];
    
    return indicadores.filter(ind => ind && ind.vp === vpFiltro && ind.area === areaFiltro);
  }, [vpFiltro, areaFiltro, indicadores]);

  // Obtener hitos disponibles según indicador seleccionado
  const hitosDisponibles = useMemo(() => {
    if (!indicadorFiltro || !Array.isArray(indicadores)) return [];
    
    const indicadorSeleccionado = indicadores.find(ind => ind && ind.id === indicadorFiltro);
    return indicadorSeleccionado && Array.isArray(indicadorSeleccionado.hitos) ? 
      indicadorSeleccionado.hitos.filter(hito => hito) : [];
  }, [indicadorFiltro, indicadores]);

  // Obtener responsables disponibles según los filtros actuales
  const responsablesDisponibles = useMemo(() => {
    if (!Array.isArray(todosLosHitos)) return [];
    
    let hitosParaResponsables = todosLosHitos;
    
    if (vpFiltro) {
      hitosParaResponsables = hitosParaResponsables.filter(hito => hito && hito.vp === vpFiltro);
    }
    if (areaFiltro) {
      hitosParaResponsables = hitosParaResponsables.filter(hito => hito && hito.area === areaFiltro);
    }
    if (indicadorFiltro) {
      hitosParaResponsables = hitosParaResponsables.filter(hito => hito && hito.indicadorId === indicadorFiltro);
    }
    if (hitoFiltro) {
      hitosParaResponsables = hitosParaResponsables.filter(hito => hito && hito.idHito === hitoFiltro);
    }
    
    const responsables = [...new Set(
      hitosParaResponsables
        .map(hito => hito.responsableHito)
        .filter(Boolean) // Filtrar valores null/undefined
    )];
    
    return responsables.sort();
  }, [todosLosHitos, vpFiltro, areaFiltro, indicadorFiltro, hitoFiltro]);

  // Verificar si hay filtros activos
  const hayFiltrosActivos = vpFiltro || areaFiltro || indicadorFiltro || hitoFiltro || responsableFiltro;

  // Filtrar hitos según los criterios seleccionados
  const hitosFiltrados = useMemo(() => {
    if (!hayFiltrosActivos || !Array.isArray(todosLosHitos)) return [];
    
    return todosLosHitos.filter(hito => {
      if (!hito) return false;
      
      const cumpleVP = !vpFiltro || hito.vp === vpFiltro;
      const cumpleArea = !areaFiltro || hito.area === areaFiltro;
      const cumpleIndicador = !indicadorFiltro || hito.indicadorId === indicadorFiltro;
      const cumpleHito = !hitoFiltro || hito.idHito === hitoFiltro;
      const cumpleResponsable = !responsableFiltro || hito.responsableHito === responsableFiltro;
      
      return cumpleVP && cumpleArea && cumpleIndicador && cumpleHito && cumpleResponsable;
    });
  }, [todosLosHitos, vpFiltro, areaFiltro, indicadorFiltro, hitoFiltro, responsableFiltro, hayFiltrosActivos]);

  // Limpiar filtros dependientes cuando cambia un filtro padre
  useEffect(() => {
    if (vpFiltro && areaFiltro && !areasDisponibles.includes(areaFiltro)) {
      setAreaFiltro('');
    }
  }, [vpFiltro, areaFiltro, areasDisponibles]);

  useEffect(() => {
    if (areaFiltro && indicadorFiltro && !indicadoresDisponibles.find(ind => ind.id === indicadorFiltro)) {
      setIndicadorFiltro('');
    }
  }, [areaFiltro, indicadorFiltro, indicadoresDisponibles]);

  useEffect(() => {
    if (indicadorFiltro && hitoFiltro && !hitosDisponibles.find(h => h.idHito === hitoFiltro)) {
      setHitoFiltro('');
    }
  }, [indicadorFiltro, hitoFiltro, hitosDisponibles]);

  useEffect(() => {
    if (responsableFiltro && !responsablesDisponibles.includes(responsableFiltro)) {
      setResponsableFiltro('');
    }
  }, [responsableFiltro, responsablesDisponibles]);

  const abrirModalActualizacion = (hito) => {
    setHitoSeleccionado(hito);
    setFormData({
      avanceHito: hito.avanceHito || 0,
      estadoHito: hito.estadoHito || '',
      comentarioHito: hito.comentarioHito || '',
      fechaFinalizacionHito: hito.fechaFinalizacionHito || '',
      fechaInicioHito: hito.fechaInicioHito || ''
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setHitoSeleccionado(null);
    setMostrarModal(false);
    setFormData({ avanceHito: 0, estadoHito: '', comentarioHito: '', fechaFinalizacionHito: '', fechaInicioHito: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hitoSeleccionado) return;
    
    try {
      const indicadorActual = indicadores.find(ind => ind.id === hitoSeleccionado.indicadorId);
      
      const indicadorActualizado = {
        ...indicadorActual,
        hitos: indicadorActual.hitos.map(hito => 
          hito.idHito === hitoSeleccionado.idHito 
            ? { ...hito, ...formData }
            : hito
        )
      };
      
      await actualizarIndicador(hitoSeleccionado.indicadorId, indicadorActualizado);
      cerrarModal();
    } catch (error) {
      console.error('Error al actualizar el hito:', error);
      alert('Error al actualizar el hito. Por favor, intente nuevamente.');
    }
  };

  const limpiarFiltros = () => {
    setVpFiltro('');
    setAreaFiltro('');
    setIndicadorFiltro('');
    setHitoFiltro('');
    setResponsableFiltro('');
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Completado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'En Progreso':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Por Comenzar':
        return <Circle className="h-4 w-4 text-gray-600" />;
      default:
        return <Circle className="h-4 w-4 text-red-600" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Por Comenzar':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Actualizar Hitos de Indicadores</h1>
        <p className="text-gray-600 mt-1">
          Sigue la jerarquía: VP → Área → Indicador → Hito → Responsable para encontrar el hito a actualizar.
        </p>
      </div>

      {/* Panel de Filtros */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Jerárquicos
          </CardTitle>
          <CardDescription>
            Sigue el orden: primero VP, luego Área, después Indicador, luego Hito, y finalmente Responsable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="space-y-2">
              <Label>1. Vicepresidencia</Label>
              <Select value={vpFiltro} onValueChange={setVpFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar VP" />
                </SelectTrigger>
                <SelectContent>
                  {vps.map(vp => (
                    <SelectItem key={vp} value={vp}>{vp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>2. Área</Label>
              <Select value={areaFiltro} onValueChange={setAreaFiltro} disabled={!vpFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder={vpFiltro ? "Seleccionar Área" : "Primero seleccione VP"} />
                </SelectTrigger>
                <SelectContent>
                  {areasDisponibles.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>3. Indicador</Label>
              <Select value={indicadorFiltro} onValueChange={setIndicadorFiltro} disabled={!areaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder={areaFiltro ? "Seleccionar Indicador" : "Primero seleccione Área"} />
                </SelectTrigger>
                <SelectContent>
                  {indicadoresDisponibles.map(indicador => (
                    <SelectItem key={indicador.id} value={indicador.id}>
                      {indicador.nombreIndicador}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>4. Hito</Label>
              <Select value={hitoFiltro} onValueChange={setHitoFiltro} disabled={!indicadorFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder={indicadorFiltro ? "Seleccionar Hito" : "Primero seleccione Indicador"} />
                </SelectTrigger>
                <SelectContent>
                  {hitosDisponibles.map(hito => (
                    <SelectItem key={hito.idHito} value={hito.idHito}>
                      {hito.nombreHito}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>5. Responsable (opcional)</Label>
              <Select value={responsableFiltro} onValueChange={setResponsableFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Responsable" />
                </SelectTrigger>
                <SelectContent>
                  {responsablesDisponibles.map(responsable => (
                    <SelectItem key={responsable} value={responsable}>{responsable}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            {hayFiltrosActivos ? (
              <p className="text-sm text-gray-600">
                {hitosFiltrados.length > 0 
                  ? `Encontrados ${hitosFiltrados.length} hitos`
                  : 'No se encontraron hitos con estos filtros'
                }
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Comienza seleccionando una Vicepresidencia
              </p>
            )}
            
            {hayFiltrosActivos && (
              <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de instrucciones cuando no hay filtros */}
      {!hayFiltrosActivos && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-12">
            <div className="text-center">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sigue la jerarquía de filtros
              </h3>
              <p className="text-gray-500 mb-4">
                Para encontrar el hito que deseas actualizar, sigue este orden:
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">1. VP</span>
                  <span>→</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">2. Área</span>
                  <span>→</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">3. Indicador</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  El filtro por Responsable es opcional y puede aplicarse en cualquier momento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Hitos - Solo se muestra cuando hay filtros activos */}
      {hayFiltrosActivos && (
        <Card>
          <CardHeader>
            <CardTitle>Hitos Encontrados</CardTitle>
            <CardDescription>
              Haz clic en "Actualizar" para modificar el avance y estado de cualquier hito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hitosFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Indicador</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Hito</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">VP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Área</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Responsable</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Avance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitosFiltrados.map((hito, index) => (
                      <tr key={`${hito.idHito}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{hito.indicadorNombre}</td>
                        <td className="py-3 px-4 text-sm font-medium">{hito.nombreHito}</td>
                        <td className="py-3 px-4 text-sm">{hito.vp}</td>
                        <td className="py-3 px-4 text-sm">{hito.area}</td>
                        <td className="py-3 px-4 text-sm">{hito.responsableHito}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${hito.avanceHito}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{hito.avanceHito}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(hito.estadoHito)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(hito.estadoHito)}`}>
                              {hito.estadoHito}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            size="sm" 
                            onClick={() => abrirModalActualizacion(hito)}
                            className="flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            Actualizar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Target className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p>No se encontraron hitos con los filtros aplicados.</p>
                <Button variant="link" onClick={limpiarFiltros} className="mt-2">
                  Limpiar filtros e intentar de nuevo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Actualización */}
      {mostrarModal && hitoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b">
                <CardTitle>Actualizar Hito</CardTitle>
                <CardDescription>
                  {hitoSeleccionado.indicadorNombre} - {hitoSeleccionado.nombreHito}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del Hito */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Información del Hito</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">VP:</span> {hitoSeleccionado.vp}</div>
                      <div><span className="font-medium">Área:</span> {hitoSeleccionado.area}</div>
                      <div><span className="font-medium">Responsable:</span> {hitoSeleccionado.responsableHito}</div>
                      <div><span className="font-medium">Orden:</span> {hitoSeleccionado.ordenHito}</div>
                      <div><span className="font-medium">Fecha Inicio:</span> {hitoSeleccionado.fechaInicioHito}</div>
                      <div><span className="font-medium">Fecha Fin:</span> {hitoSeleccionado.fechaFinalizacionHito}</div>
                    </div>
                  </div>

                  {/* Campos de Actualización */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="avanceHito">Avance del Hito (%)</Label>
                      <Input
                        id="avanceHito"
                        name="avanceHito"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.avanceHito}
                        onChange={handleChange}
                      />
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${formData.avanceHito}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estadoHito">Estado del Hito</Label>
                      <Select 
                        value={formData.estadoHito} 
                        onValueChange={(value) => handleSelectChange('estadoHito', value)}
                      >
                        <SelectTrigger id="estadoHito">
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map(estado => (
                            <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Campo de Fecha de Finalización */}
                  <div className="space-y-2">
                    <Label htmlFor="fechaFinalizacionHito">Fecha de Finalización</Label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          id="fechaFinalizacionHito"
                          name="fechaFinalizacionHito"
                          type="date"
                          value={formData.fechaFinalizacionHito}
                          onChange={handleChange}
                          min={formData.fechaInicioHito}
                          className="w-full"
                        />
                      </div>
                      {formData.fechaInicioHito && (
                        <div className="text-xs text-gray-500 md:self-center">
                          <span className="font-medium">Fecha de inicio:</span> {new Date(formData.fechaInicioHito).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta fecha se mostrará en el cronograma Gantt y debe ser posterior a la fecha de inicio
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comentarioHito">Comentario del Hito (opcional)</Label>
                    <Input
                      id="comentarioHito"
                      name="comentarioHito"
                      value={formData.comentarioHito}
                      onChange={handleChange}
                      placeholder="Añada un comentario sobre la actualización del hito"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={cerrarModal}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Actualizar Hito
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ActualizarIndicador;