import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Building2, 
  ExternalLink, 
  Filter
} from 'lucide-react';
import { Project } from '../types';
import { getProjects } from '../services/api';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { formatPercent, getStatusBadgeClass } from '../utils/format';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      p.healthStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Projetos</h1>
          <p className="page-subtitle">
            Catálogo completo da fábrica de software e implantações TOTVS ERP
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '260px'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Buscar por nome do projeto ou cliente TOTVS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          {['ALL', 'Saudável', 'Atenção', 'Crítico'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-secondary ${statusFilter === status ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                borderColor: statusFilter === status ? 'var(--accent)' : 'var(--card-border)',
                background: statusFilter === status ? 'var(--accent-subtle)' : 'transparent'
              }}
            >
              {status === 'ALL' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Projetos */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid var(--card-border)', 
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '1rem 1.25rem' }}>Projeto</th>
                <th style={{ padding: '1rem 1.25rem' }}>Cliente TOTVS</th>
                <th style={{ padding: '1rem 1.25rem' }}>Progresso Físico</th>
                <th style={{ padding: '1rem 1.25rem' }}>Horas (Consumidas / Vendidas)</th>
                <th style={{ padding: '1rem 1.25rem' }}>Saldo de Horas</th>
                <th style={{ padding: '1rem 1.25rem' }}>Margem Financeira</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const statusClass = getStatusBadgeClass(p.healthStatus);
                return (
                  <tr 
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    style={{
                      borderBottom: '1px solid var(--card-border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1.15rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={15} color="var(--text-muted)" />
                        <span>{p.clientName || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '80px', height: '4px', background: 'var(--bg-surface)', border: '1px solid var(--card-border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min(p.physicalProgressPercentage, 100)}%`, 
                            height: '100%', 
                            background: 'var(--accent)' 
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatPercent(p.physicalProgressPercentage)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem', color: 'var(--text-primary)' }}>
                      {p.consumedHours}h <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ {p.soldHours}h</span>
                    </td>
                    <td style={{ 
                      padding: '1.15rem 1.25rem', 
                      fontWeight: 700,
                      color: p.hourBalance < 0 ? 'var(--danger)' : 'var(--text-primary)'
                    }}>
                      {p.hourBalance}h
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem', color: 'var(--success)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.financialMargin)}
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem' }}>
                      <span className={`badge ${statusClass}`}>{p.healthStatus}</span>
                    </td>
                    <td style={{ padding: '1.15rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                      >
                        <span>Detalhes</span>
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Nenhum projeto encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
};
