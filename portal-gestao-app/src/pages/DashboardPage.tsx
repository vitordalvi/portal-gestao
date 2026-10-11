import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Plus, 
  Briefcase, 
  UserCheck, 
  FolderPlus,
  LayoutGrid,
  List,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';
import { TotvsSyncBadge } from '../components/TotvsSyncBadge';
import { Project } from '../types';
import { getProjects } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { formatPercent } from '../utils/format';

export const DashboardPage: React.FC = () => {
  const { currentUser, isAnalyst } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedProjectIdForTime, setSelectedProjectIdForTime] = useState<string | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDashboard = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    // Em localhost a resposta é quase instantânea; garantimos um feedback visual
    // suave de pelo menos 450ms para completar uma rotação fluida sem sobressaltos
    const minFeedbackTimer = !isInitial
      ? new Promise(resolve => setTimeout(resolve, 450))
      : Promise.resolve();

    try {
      const [data] = await Promise.all([getProjects(), minFeedbackTimer]);
      setProjects(data);
    } catch (err) {
      setError('Erro ao conectar com a API .NET. Certifique-se de que o backend está rodando.');
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  // Filtra projetos para o analista
  const displayedProjects = isAnalyst && currentUser
    ? projects.filter(p => p.allocatedUserIds?.includes(currentUser.id))
    : projects;

  // KPIs
  const totalProjects = displayedProjects.length;
  const totalSoldHours = displayedProjects.reduce((acc, p) => acc + p.soldHours, 0);
  const totalConsumedHours = displayedProjects.reduce((acc, p) => acc + p.consumedHours, 0);
  const totalBalanceHours = displayedProjects.reduce((acc, p) => acc + p.hourBalance, 0);
  const totalMargin = displayedProjects.reduce((acc, p) => acc + p.financialMargin, 0);
  const criticalCount = displayedProjects.filter(p => p.healthStatus === 'Crítico' || p.healthStatus === 'Atenção').length;

  const handleOpenTimeModal = (projectId?: string) => {
    setSelectedProjectIdForTime(projectId);
    setIsTimeModalOpen(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAnalyst ? 'Painel do Consultor' : 'Painel Executivo da Carteira'}
          </h1>
          <p className="page-subtitle">
            {isAnalyst 
              ? `Projetos vinculados a você (${currentUser?.name}) na Fábrica TOTVS` 
              : 'Monitoramento de Saúde Física, Horas e Margem Financeira em Tempo Real'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Alternador de visualização Cards vs Tabela */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--card-border)', 
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            marginRight: '0.25rem'
          }}>
            <button 
              type="button"
              className="btn"
              style={{
                padding: '0.35rem 0.55rem',
                fontSize: '0.78rem',
                background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: viewMode === 'table' ? 'var(--card-border)' : 'transparent'
              }}
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
            >
              <List size={15} />
            </button>
            <button 
              type="button"
              className="btn"
              style={{
                padding: '0.35rem 0.55rem',
                fontSize: '0.78rem',
                background: viewMode === 'cards' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: viewMode === 'cards' ? 'var(--card-border)' : 'transparent'
              }}
              onClick={() => setViewMode('cards')}
              title="Visualização em Cards"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={() => fetchDashboard(false)} 
            disabled={refreshing} 
            title="Atualizar dados dinamicamente sem recarregar a tela"
            style={{
              minWidth: '118px',
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          {!isAnalyst && (
            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(true)}>
              <FolderPlus size={15} />
              <span>Novo Projeto</span>
            </button>
          )}

          <button className="btn btn-primary" onClick={() => handleOpenTimeModal()}>
            <Plus size={15} />
            <span>Lançar Horas</span>
          </button>
        </div>
      </div>

      {/* Banner discreto para Analista */}
      {isAnalyst && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserCheck size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Olá, <strong>{currentUser?.name}</strong>. Você está vinculado a <strong>{totalProjects} projeto(s)</strong>.
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace' }}>
            Consumo na sua carga: <strong style={{ color: 'var(--text-primary)' }}>{totalConsumedHours}h</strong> de {totalSoldHours}h
          </div>
        </div>
      )}

      {/* KPI Tiles em Grid Mecânico */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Projetos {isAnalyst ? 'Alocados' : 'Ativos'}</div>
          <div className="kpi-value">{totalProjects}</div>
          <div className="kpi-sub">Carteira ativa TOTVS</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Horas Consumidas</div>
          <div className="kpi-value">{totalConsumedHours}h</div>
          <div className="kpi-sub">de {totalSoldHours}h vendidas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Saldo Disponível</div>
          <div className="kpi-value" style={{ color: totalBalanceHours < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {totalBalanceHours}h
          </div>
          <div className="kpi-sub">Balanço de horas da carteira</div>
        </div>

        {!isAnalyst ? (
          <div className="kpi-card">
            <div className="kpi-title">Margem Contratual</div>
            <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalMargin)}
            </div>
            <div className="kpi-sub">Receita líquida estimada</div>
          </div>
        ) : (
          <div className="kpi-card">
            <div className="kpi-title">Projetos em Alerta</div>
            <div className="kpi-value" style={{ color: criticalCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {criticalCount}
            </div>
            <div className="kpi-sub">Atenção ou Crítico</div>
          </div>
        )}
      </div>

      {/* Exibição dos Projetos com transição suave */}
      <div style={{
        transition: 'opacity 0.25s ease',
        opacity: refreshing ? 0.72 : 1,
        pointerEvents: refreshing ? 'none' : 'auto',
      }}>
      {loading && projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spinning" style={{ marginBottom: '0.75rem', color: 'var(--accent)' }} />
          <div style={{ fontSize: '0.88rem' }}>Carregando dados da fábrica TOTVS...</div>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '1rem', 
          background: 'var(--danger-bg)', 
          color: 'var(--danger)', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--danger-border)',
          fontSize: '0.88rem'
        }}>
          {error}
        </div>
      ) : displayedProjects.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1.5rem', 
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--card-border)',
          color: 'var(--text-secondary)' 
        }}>
          <Briefcase size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Nenhum projeto encontrado
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
            {isAnalyst 
              ? 'Você ainda não possui projetos alocados pela coordenação.' 
              : 'Nenhum projeto cadastrado no banco de dados.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISÃO 1: TABELA EXECUTIVA DE ALTA DENSIDADE */
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th style={{ textAlign: 'right' }}>Vendidas</th>
                <th style={{ textAlign: 'right' }}>Realizadas</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
                {!isAnalyst && <th style={{ textAlign: 'right' }}>Margem</th>}
                <th style={{ textAlign: 'center' }}>Avanço Físico</th>
                <th style={{ textAlign: 'center' }}>Saúde</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayedProjects.map(p => {
                return (
                  <tr key={p.id}>
                    <td>
                      <div 
                        style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => navigate(`/projects/${p.id}`)}
                      >
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                          {p.erpId || 'TOTVS-PRJ'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                        <TotvsSyncBadge compact lastSyncDate={p.lastSyncDate} syncStatus={p.syncStatus} erpId={p.erpId} />
                      </div>
                    </td>
                    <td>{p.clientName || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{p.soldHours}h</td>
                    <td style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: 'var(--text-primary)' }}>{p.consumedHours}h</td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontFamily: 'ui-monospace, monospace',
                      color: p.hourBalance < 0 ? 'var(--danger)' : 'var(--text-primary)'
                    }}>
                      {p.hourBalance}h
                    </td>
                    {!isAnalyst && (
                      <td style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: 'var(--text-primary)' }}>
                        {formatCurrency(p.financialMargin)}
                      </td>
                    )}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'ui-monospace, monospace' }}>
                          {formatPercent(p.physicalProgressPercentage)}
                        </span>
                        <div style={{ width: '45px', height: '4px', background: 'var(--bg-surface)', border: '1px solid var(--card-border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(p.physicalProgressPercentage, 100)}%`, height: '100%', background: 'var(--accent)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <HealthBadge 
                        status={p.healthStatus} 
                        reasons={p.healthReasons} 
                        align="center" 
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/projects/${p.id}`)}
                          title="Gerenciar projeto"
                        >
                          <span>Gerenciar</span>
                          <ArrowUpRight size={13} />
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenTimeModal(p.id)}
                          title="Apontar horas"
                        >
                          <Clock size={13} />
                          <span>Apontar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISÃO 2: CARDS LIMPOS */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1rem'
        }}>
          {displayedProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onLogHours={() => handleOpenTimeModal(project.id)}
            />
          ))}
        </div>
      )}
      </div>

      {/* Modais */}
      <TimeEntryModal 
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSuccess={() => {
          setIsTimeModalOpen(false);
          fetchDashboard();
        }}
        projectId={selectedProjectIdForTime}
        projects={displayedProjects}
      />

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchDashboard();
        }}
      />
    </div>
  );
};
