import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import './ProjectCard.css';

interface Props {
  project: Project;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const [fillWidth, setFillWidth] = useState('0%');

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => {
      setFillWidth(`${project.physicalProgressPercentage}%`);
    }, 100);
  }, [project.physicalProgressPercentage]);

  const marginFormatted = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(project.financialMargin);
  
  const statusClass = project.healthStatus.toLowerCase().replace('á', 'a').replace('ç', 'c');

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{project.name}</div>
        <div className={`badge ${statusClass}`}>{project.healthStatus}</div>
      </div>
      
      <div className="stat-group">
        <div>
          <div className="stat-label">Horas Consumidas</div>
          <div className="stat-value">{project.consumedHours}h / {project.soldHours}h</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-label">Saldo de Horas</div>
          <div className="stat-value">{project.hourBalance}h</div>
        </div>
      </div>

      <div className="stat-group" style={{ border: 'none', paddingBottom: 0, marginBottom: 0 }}>
        <div>
          <div className="stat-label">Margem Financeira</div>
          <div className="stat-value money">{marginFormatted}</div>
        </div>
      </div>

      <div className="progress-container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="stat-label">Avanço Físico</span>
          <span className="stat-value" style={{ fontSize: '0.875rem' }}>{project.physicalProgressPercentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: fillWidth }}></div>
        </div>
      </div>
    </div>
  );
};
