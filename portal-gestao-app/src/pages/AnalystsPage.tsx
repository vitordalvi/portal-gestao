import React, { useEffect, useState } from 'react';
import { Mail, Briefcase } from 'lucide-react';
import { getUsers, getProjects } from '../services/api';
import { User, Project } from '../types';
import { getStatusBadgeClass } from '../utils/format';

export const AnalystsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getProjects()])
      .then(([userData, projectData]) => {
        setUsers(userData.filter(u => u.role === 2)); // Apenas analistas
        setProjects(projectData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipe de Analistas & Consultores</h1>
          <p className="page-subtitle">
            Quadro de consultores técnicos da Fábrica TOTVS e distribuição de carga horária
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Carregando analistas...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem'
        }}>
          {users.map(analyst => {
            const assignedProjects = projects.filter(p => p.allocatedUserIds?.includes(analyst.id));

            return (
              <div key={analyst.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}>
                    {analyst.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                      {analyst.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      <Mail size={13} />
                      <span>{analyst.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Projetos Vinculados ({assignedProjects.length})
                  </div>
                  {assignedProjects.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {assignedProjects.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>• {p.name}</span>
                          <span className={`badge ${getStatusBadgeClass(p.healthStatus)}`} style={{ fontSize: '0.7rem' }}>
                            {p.healthStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Nenhum projeto alocado no momento.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Briefcase size={14} />
                    <span>Status:</span>
                    <strong style={{ color: 'var(--success)' }}>Disponível para alocações</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
