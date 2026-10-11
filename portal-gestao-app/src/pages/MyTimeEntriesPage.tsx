import React, { useEffect, useState } from 'react';
import { Clock, PlusCircle, Building2 } from 'lucide-react';
import { getProjects } from '../services/api';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { getStatusBadgeClass } from '../utils/format';

export const MyTimeEntriesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      const myProjects = data.filter(p => currentUser && p.allocatedUserIds?.includes(currentUser.id));
      setProjects(myProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleOpenModal = (pId?: string) => {
    setSelectedProjectId(pId);
    setIsTimeModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meus Apontamentos de Horas</h1>
          <p className="page-subtitle">
            Registro diário de atividades técnicas e acompanhamento de saldo de projetos
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusCircle size={18} />
          <span>Novo Apontamento</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {projects.map(p => (
          <div key={p.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={13} />
                  <span>{p.clientName}</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {p.name}
                </div>
              </div>
              <span className={`badge ${getStatusBadgeClass(p.healthStatus)}`}>
                {p.healthStatus}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horas Totais do Projeto</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{p.consumedHours}h / {p.soldHours}h</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo do Projeto</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: p.hourBalance < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {p.hourBalance}h
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: 'auto', width: '100%' }}
              onClick={() => handleOpenModal(p.id)}
            >
              <Clock size={16} />
              <span>Apontar Horas Neste Projeto</span>
            </button>
          </div>
        ))}

        {projects.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Nenhum projeto alocado no momento para seu usuário.
          </div>
        )}
      </div>

      <TimeEntryModal 
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSuccess={() => {
          setIsTimeModalOpen(false);
          loadData();
        }}
        projectId={selectedProjectId}
        projects={projects}
      />
    </div>
  );
};
