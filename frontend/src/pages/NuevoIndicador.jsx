import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useIndicadores } from '@/context/IndicadoresContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NuevoIndicador = () => {
  const navigate = useNavigate();
  const { agregarIndicador, vps, obtenerAreasPorVP, estados, tiposIndicador } = useIndicadores();
  
  const [formData, setFormData] = useState({
    vp: '',
    area: '',
    nombreIndicador: '',
    tipoIndicador: '',
    fechaInicioGeneral: '',
    fechaFinalizacionGeneral: '',
    responsableGeneral: '',
    responsableCargaGeneral: '',
    hitos: [
      { 
        nombreHito: '', 
        fechaInicioHito: '', 
        fechaFinalizacionHito: '', 
        avanceHito: 0, 
        estadoHito: 'Por Comenzar', 
        responsableHito: '' 
      }
    ]
  });

  // Obtener áreas disponibles según el VP seleccionado
  const areasDisponibles = formData.vp ? obtenerAreasPorVP(formData.vp) : [];

  const handleIndicadorChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndicadorSelectChange = (name, value) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Si cambió el VP, resetear el área
      if (name === 'vp') {
        newData.area = '';
      }
      return newData;
    });
  };

  const handleHitoChange = (index, e) => {
    const { name, value } = e.target;
    const newHitos = [...formData.hitos];
    newHitos[index] = { ...newHitos[index], [name]: value };
    setFormData(prev => ({ ...prev, hitos: newHitos }));
  };

  const handleHitoSelectChange = (index, name, value) => {
    const newHitos = [...formData.hitos];
    newHitos[index] = { ...newHitos[index], [name]: value };
    setFormData(prev => ({ ...prev, hitos: newHitos }));
  };

  const agregarNuevoHito = () => {
    setFormData(prev => ({
      ...prev,
      hitos: [
        ...prev.hitos, 
        { 
          nombreHito: '', 
          fechaInicioHito: '', 
          fechaFinalizacionHito: '', 
          avanceHito: 0, 
          estadoHito: 'Por Comenzar', 
          responsableHito: '' 
        }
      ]
    }));
  };

  const eliminarHito = (index) => {
    if (formData.hitos.length <= 1) {
      alert("Debe haber al menos un hito.");
      return;
    }
    const newHitos = formData.hitos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, hitos: newHitos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const camposRequeridosIndicador = [
      'vp', 'area', 'nombreIndicador', 'tipoIndicador', 
      'fechaInicioGeneral', 'fechaFinalizacionGeneral', 'responsableGeneral'
    ];
    
    const camposFaltantesIndicador = camposRequeridosIndicador.filter(campo => !formData[campo]);
    if (camposFaltantesIndicador.length > 0) {
      alert(`Por favor complete los siguientes campos del indicador: ${camposFaltantesIndicador.join(', ')}`);
      return;
    }

    for (let i = 0; i < formData.hitos.length; i++) {
      const hito = formData.hitos[i];
      const camposRequeridosHito = ['nombreHito', 'fechaInicioHito', 'fechaFinalizacionHito', 'responsableHito'];
      const camposFaltantesHito = camposRequeridosHito.filter(campo => !hito[campo]);
      if (camposFaltantesHito.length > 0) {
        alert(`Por favor complete los siguientes campos del Hito ${i + 1}: ${camposFaltantesHito.join(', ')}`);
        return;
      }
    }
    
    try {
      // Convertir las fechas al formato correcto para el backend
      const formDataFormatted = {
        ...formData,
        fechaInicioGeneral: new Date(formData.fechaInicioGeneral).toISOString(),
        fechaFinalizacionGeneral: new Date(formData.fechaFinalizacionGeneral).toISOString(),
        hitos: formData.hitos.map(hito => ({
          ...hito,
          fechaInicioHito: new Date(hito.fechaInicioHito).toISOString(),
          fechaFinalizacionHito: new Date(hito.fechaFinalizacionHito).toISOString(),
          avanceHito: parseFloat(hito.avanceHito)
        }))
      };

      await agregarIndicador(formDataFormatted);
      navigate('/');
    } catch (error) {
      console.error('Error al guardar el indicador:', error);
      alert('Error al guardar el indicador. Por favor, asegúrese de que el servidor esté corriendo e intente nuevamente.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Nuevo Indicador</h1>
        <p className="text-gray-600 mt-1">Registra un nuevo indicador y sus hitos asociados</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Información General del Indicador</CardTitle>
            <CardDescription>Complete los detalles generales del indicador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="vp">VP (Vicepresidencia)</Label>
                <Select value={formData.vp} onValueChange={(value) => handleIndicadorSelectChange('vp', value)}>
                  <SelectTrigger id="vp"><SelectValue placeholder="Seleccione un VP" /></SelectTrigger>
                  <SelectContent>{vps.map(vp => (<SelectItem key={vp} value={vp}>{vp}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select value={formData.area} onValueChange={(value) => handleIndicadorSelectChange('area', value)}>
                  <SelectTrigger id="area"><SelectValue placeholder="Seleccione un área" /></SelectTrigger>
                  <SelectContent>{areasDisponibles.map(area => (<SelectItem key={area} value={area}>{area}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipoIndicador">Tipo de Indicador</Label>
                <Select value={formData.tipoIndicador} onValueChange={(value) => handleIndicadorSelectChange('tipoIndicador', value)}>
                  <SelectTrigger id="tipoIndicador"><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger>
                  <SelectContent>{tiposIndicador.map(tipo => (<SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nombreIndicador">Nombre del Indicador</Label>
                <Input id="nombreIndicador" name="nombreIndicador" value={formData.nombreIndicador} onChange={handleIndicadorChange} placeholder="Ej: Eficiencia de producción" />
              </div>
              <div>
                <Label htmlFor="fechaInicioGeneral">Fecha de Inicio General</Label>
                <Input id="fechaInicioGeneral" name="fechaInicioGeneral" type="date" value={formData.fechaInicioGeneral} onChange={handleIndicadorChange} />
              </div>
              <div>
                <Label htmlFor="fechaFinalizacionGeneral">Fecha de Finalización General</Label>
                <Input id="fechaFinalizacionGeneral" name="fechaFinalizacionGeneral" type="date" value={formData.fechaFinalizacionGeneral} onChange={handleIndicadorChange} />
              </div>
              <div>
                <Label htmlFor="responsableGeneral">Responsable General</Label>
                <Input id="responsableGeneral" name="responsableGeneral" value={formData.responsableGeneral} onChange={handleIndicadorChange} placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <Label htmlFor="responsableCargaGeneral">Responsable de Carga General</Label>
                <Input id="responsableCargaGeneral" name="responsableCargaGeneral" value={formData.responsableCargaGeneral} onChange={handleIndicadorChange} placeholder="Ej: María García" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Hitos del Indicador</CardTitle>
                <CardDescription>Añada uno o más hitos para este indicador.</CardDescription>
              </div>
              <Button type="button" size="sm" onClick={agregarNuevoHito} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Añadir Hito
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {formData.hitos.map((hito, index) => (
              <motion.div 
                key={index} 
                className="p-4 border rounded-md shadow-sm relative bg-slate-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-purple-700">Hito {index + 1}</h4>
                  {formData.hitos.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => eliminarHito(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar Hito
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor={`nombreHito-${index}`}>Nombre del Hito</Label>
                    <Input id={`nombreHito-${index}`} name="nombreHito" value={hito.nombreHito} onChange={(e) => handleHitoChange(index, e)} placeholder="Ej: Optimización de línea A" />
                  </div>
                  <div>
                    <Label htmlFor={`fechaInicioHito-${index}`}>Fecha de Inicio Hito</Label>
                    <Input id={`fechaInicioHito-${index}`} name="fechaInicioHito" type="date" value={hito.fechaInicioHito} onChange={(e) => handleHitoChange(index, e)} />
                  </div>
                  <div>
                    <Label htmlFor={`fechaFinalizacionHito-${index}`}>Fecha de Finalización Hito</Label>
                    <Input id={`fechaFinalizacionHito-${index}`} name="fechaFinalizacionHito" type="date" value={hito.fechaFinalizacionHito} onChange={(e) => handleHitoChange(index, e)} />
                  </div>
                  <div>
                    <Label htmlFor={`avanceHito-${index}`}>Avance Hito (%)</Label>
                    <Input id={`avanceHito-${index}`} name="avanceHito" type="number" min="0" max="100" value={hito.avanceHito} onChange={(e) => handleHitoChange(index, e)} placeholder="Ej: 50" />
                  </div>
                  <div>
                    <Label htmlFor={`estadoHito-${index}`}>Estado Hito</Label>
                    <Select value={hito.estadoHito} onValueChange={(value) => handleHitoSelectChange(index, 'estadoHito', value)}>
                      <SelectTrigger id={`estadoHito-${index}`}><SelectValue placeholder="Seleccione un estado" /></SelectTrigger>
                      <SelectContent>{estados.map(estado => (<SelectItem key={estado} value={estado}>{estado}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`responsableHito-${index}`}>Responsable Hito</Label>
                    <Input id={`responsableHito-${index}`} name="responsableHito" value={hito.responsableHito} onChange={(e) => handleHitoChange(index, e)} placeholder="Ej: Ana Torres" />
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancelar</Button>
          <Button type="submit">Guardar Indicador y Hitos</Button>
        </div>
      </form>
    </motion.div>
  );
};

export default NuevoIndicador;