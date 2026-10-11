import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { getProjects } from '../services/api';
import { Project } from '../types';
import { formatPercent, getStatusBadgeClass } from '../utils/format';

export const SchedulePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Carregando agenda...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda & Cronograma</h1>
          <p className="page-subtitle">
            Calendário de entregas, marcos contratuais e prazos da fábrica de projetos
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {projects.map(p => (
          <div key={p.id} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {p.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Building2 size={14} color="var(--accent-light)" />
                  <span>{p.clientName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge ${getStatusBadgeClass(p.healthStatus)}`}>
                  {p.healthStatus}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-light)' }}>
                  {formatPercent(p.physicalProgressPercentage)} Concluído
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horas Consumidas</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{p.consumedHours}h / {p.soldHours}h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo Atual</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: p.hourBalance < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{p.hourBalance}h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status da Entrega</div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 600, 
                  color: p.healthStatus === 'Saudável' ? 'var(--success)' : p.healthStatus === 'Crítico' ? 'var(--danger)' : 'var(--warning)' 
                }}>
                  {p.healthStatus === 'Saudável' ? 'No Prazo Contratual' : p.healthStatus === 'Crítico' ? 'Risco Crítico de Atraso' : 'Requer Atenção da Gestão'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
