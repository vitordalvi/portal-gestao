import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowUpRight, Building2, UserCheck } from 'lucide-react';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatPercent } from '../utils/format';
import { HealthBadge } from './HealthBadge';
import './ProjectCard.css';

interface Props {
  project: Project;
  onLogHours?: (projectId: string) => void;
}

export const ProjectCard: React.FC<Props> = ({ project, onLogHours }) => {
  const [fillWidth, setFillWidth] = useState('0%');
  const navigate = useNavigate();
  const { currentUser, isAnalyst } = useAuth();

  const isUserAllocated = currentUser && project.allocatedUserIds?.includes(currentUser.id);

  useEffect(() => {
    setTimeout(() => {
      setFillWidth(`${Math.min(project.physicalProgressPercentage, 100)}%`);
    }, 100);
  }, [project.physicalProgressPercentage]);

  const marginFormatted = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(project.financialMargin);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          {project.clientName && (
            <div className="card-client-tag">
              <Building2 size={13} />
              <span>{project.clientName}</span>
            </div>
          )}
          <div className="card-title" onClick={() => navigate(`/projects/${project.id}`)}>
            {project.name}
          </div>
        </div>
        <HealthBadge 
          status={project.healthStatus} 
          reasons={project.healthReasons} 
          align="right" 
          placement="bottom" 
        />
      </div>

      {isUserAllocated && (
        <div className="allocated-badge-strip">
          <UserCheck size={14} />
          <span>Você está alocado neste projeto</span>
        </div>
      )}
      
      <div className="stat-group">
        <div>
          <div className="stat-label">Horas Consumidas</div>
          <div className="stat-value">{project.consumedHours}h <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {project.soldHours}h</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-label">Saldo de Horas</div>
          <div className={`stat-value ${project.hourBalance < 0 ? 'negative-balance' : ''}`}>
            {project.hourBalance}h
          </div>
        </div>
      </div>

      {!isAnalyst && (
        <div className="stat-group" style={{ border: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <div>
            <div className="stat-label">Margem Contratual</div>
            <div className="stat-value money">{marginFormatted}</div>
          </div>
        </div>
      )}

      <div className="progress-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="stat-label">Avanço Físico</span>
          <span className="stat-value" style={{ fontSize: '0.85rem' }}>{formatPercent(project.physicalProgressPercentage)}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: fillWidth }}></div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="btn btn-secondary card-action-btn"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <span>Gerenciar</span>
          <ArrowUpRight size={15} />
        </button>

        {onLogHours && (
          <button 
            className="btn btn-primary card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onLogHours(project.id);
            }}
          >
            <Clock size={15} />
            <span>Apontar</span>
          </button>
        )}
      </div>
    </div>
  );
};
