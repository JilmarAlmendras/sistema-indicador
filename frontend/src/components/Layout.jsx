import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, PlusCircle, RefreshCw, ClipboardList, Menu, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/nuevo-indicador', label: 'Nuevo Indicador', icon: <PlusCircle className="h-5 w-5" /> },
    { path: '/actualizar-indicador', label: 'Actualizar Indicador', icon: <RefreshCw className="h-5 w-5" /> },
    { path: '/gantt', label: 'Gantt', icon: <Calendar className="h-5 w-5" /> },
    { path: '/historial', label: 'Historial', icon: <ClipboardList className="h-5 w-5" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="gradient-bg text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded">
              <img  alt="Logo de indicadores" className="h-8 w-8" src="https://images.unsplash.com/photo-1586448354773-30706da80a04" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Sistema de Carga de Indicadores</h1>
          </Link>
          
          <button 
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-white/20 font-medium"
                    : "hover:bg-white/10"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden gradient-bg text-white shadow-lg"
        >
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-3 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-white/20 font-medium"
                    : "hover:bg-white/10"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </motion.div>
      )}

      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm">Sistema de Carga de Indicadores © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
