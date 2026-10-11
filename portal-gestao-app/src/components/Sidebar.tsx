import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  Layers,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { currentUser, logout, isAnalyst, isCoordinator, isDirector } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getRoleBadge = () => {
    if (isDirector) return <span className="badge badge-role-director">Diretoria</span>;
    if (isCoordinator) return <span className="badge badge-role-coordinator">Coordenador</span>;
    return <span className="badge badge-role-analyst">Analista</span>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <Layers size={16} />
          <span>TOTVS • Gestão 360</span>
        </div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop para mobile */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={closeMobile}
          aria-hidden="true" 
        />
      )}

      {/* Drawer da Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-left">
            <div className="brand-icon-box">
              <Layers size={18} />
            </div>
            <div>
              <div className="brand-title">TOTVS 360</div>
              <div className="brand-subtitle">Gestão de Projetos</div>
            </div>
          </div>
          <button 
            className="sidebar-mobile-close"
            onClick={closeMobile}
            aria-label="Fechar menu lateral"
          >
            <X size={18} />
          </button>
        </div>

        {currentUser && (
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {getInitials(currentUser.name)}
            </div>
            <div className="user-info">
              <div className="user-name" title={currentUser.name}>
                {currentUser.name}
              </div>
              <div className="user-role-text">
                {getRoleBadge()}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu Principal</div>

          {/* Home / Dashboard - Ambos têm */}
          <NavLink 
            to="/" 
            end
            onClick={closeMobile}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Início</span>
          </NavLink>

          {/* Visão do Analista */}
          {isAnalyst && (
            <NavLink 
              to="/my-time-entries" 
              onClick={closeMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Clock size={16} />
              <span>Meus Apontamentos</span>
            </NavLink>
          )}

          {/* Visão do Coordenador / Cargos Superiores */}
          {!isAnalyst && (
            <>
              <NavLink 
                to="/projects" 
                onClick={closeMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <FolderKanban size={16} />
                <span>Projetos</span>
              </NavLink>

              <NavLink 
                to="/analysts" 
                onClick={closeMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={16} />
                <span>Analistas</span>
              </NavLink>

              <NavLink 
                to="/schedule" 
                onClick={closeMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Calendar size={16} />
                <span>Agenda</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn-switch-user" 
            onClick={() => {
              closeMobile();
              logout();
            }} 
            title="Alternar usuário mockado"
          >
            <LogOut size={15} />
            <span>Trocar de Usuário</span>
          </button>
        </div>
      </aside>
    </>
  );
};
