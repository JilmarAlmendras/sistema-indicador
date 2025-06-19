import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Users, 
  Calendar,
  FileText,
  Settings,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/indicadores", icon: Target, label: "Indicadores" },
    { to: "/areas", icon: Users, label: "Áreas" },
    { to: "/gantt", icon: Calendar, label: "Gantt Chart" },
    { to: "/gantt-syncfusion", icon: BarChart3, label: "Gantt Syncfusion" },
    { to: "/historial", icon: Activity, label: "Historial" },
    { to: "/reportes", icon: FileText, label: "Reportes" },
    { to: "/configuracion", icon: Settings, label: "Configuración" }
  ];

  return (
    <nav className="mt-8">
      <div className="px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar; 