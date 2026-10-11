import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  Circle,
  Plus
} from 'lucide-react';
import { ProjectDetail } from '../types';
import { getProjectById, toggleMilestone } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AllocateModal } from '../components/AllocateModal';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { CreateMilestoneModal } from '../components/CreateMilestoneModal';
import { formatPercent, getStatusBadgeClass } from '../utils/format';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAnalyst } = useAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isTogglingMilestone, setIsTogglingMilestone] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar os detalhes do projeto.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!project || isTogglingMilestone) return;
    setIsTogglingMilestone(milestoneId);
    try {
      await toggleMilestone(project.id, milestoneId);
      await fetchProject();
    } catch (err) {
      console.error('Erro ao alternar marco:', err);
    } finally {
      setIsTogglingMilestone(null);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        <div>Carregando detalhes do projeto...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ padding: '2rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
          {error || 'Projeto não encontrado.'}
        </div>
      </div>
    );
  }

  const statusClass = getStatusBadgeClass(project.healthStatus);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div>
      {/* Botão de navegação de volta */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Voltar para Projetos</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isAnalyst && (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAllocateModalOpen(true)}
            >
              <UserPlus size={16} />
              <span>Alocar Analista</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={() => setIsTimeModalOpen(true)}>
            <Clock size={16} />
            <span>Lançar Horas</span>
          </button>
        </div>
      </div>

      {/* Header do Projeto */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
                {project.name}
              </h1>
              <span className={`badge ${statusClass}`}>{project.healthStatus}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                ERP: {project.erpId || 'TOTVS'}
              </span>
            </div>

            {project.client && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} color="var(--accent-light)" />
                  <strong style={{ color: 'var(--text-primary)' }}>{project.client.name}</strong>
                </div>
                <div>Segmento: {project.client.segment}</div>
                <div>CNPJ: {project.client.cnpj}</div>
              </div>
            )}
          </div>

          {!isAnalyst && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contrato Total</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                  {formatCurrency(project.totalValue)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Métricas Principais */}
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          <div className="kpi-card">
            <div className="kpi-title">Horas Consumidas</div>
            <div className="kpi-value">{project.consumedHours}h</div>
            <div className="kpi-sub">de {project.soldHours}h vendidas</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Saldo de Horas</div>
            <div className="kpi-value" style={{ color: project.hourBalance < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {project.hourBalance}h
            </div>
            <div className="kpi-sub">Horas restantes do contrato</div>
          </div>

          {!isAnalyst ? (
            <div className="kpi-card">
              <div className="kpi-title">Margem Contratual</div>
              <div className="kpi-value" style={{ color: 'var(--success)' }}>
                {formatCurrency(project.financialMargin)}
              </div>
              <div className="kpi-sub">Custo realizado: {formatCurrency(project.realizedCost)}</div>
            </div>
          ) : (
            <div className="kpi-card">
              <div className="kpi-title">Horas Contratadas</div>
              <div className="kpi-value">{project.soldHours}h</div>
              <div className="kpi-sub">Carga total prevista no escopo</div>
            </div>
          )}

          <div className="kpi-card">
            <div className="kpi-title">Avanço Físico</div>
            <div className="kpi-value">{formatPercent(project.physicalProgressPercentage)}</div>
            <div style={{ marginTop: '0.5rem', height: '5px', background: 'var(--bg-surface)', border: '1px solid var(--card-border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(project.physicalProgressPercentage, 100)}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid com Duas Colunas: Analistas Alocados & Marcos */}
      <div className="project-detail-grid">
        
        {/* Seção de Analistas Alocados */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Equipe Alocada (Analistas)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Consultores dedicados a este projeto e consumo de carga horária
              </p>
            </div>

            {!isAnalyst && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setIsAllocateModalOpen(true)}
              >
                <UserPlus size={15} />
                <span>Alocar</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {project.allocations.map(alloc => {
              const userPct = alloc.allocatedHours > 0 
                ? Math.round((alloc.consumedHours / alloc.allocatedHours) * 100) 
                : 0;

              return (
                <div 
                  key={alloc.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {alloc.user?.name || 'Analista'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {alloc.user?.email || 'N/A'}{!isAnalyst ? ` • Custo: R$ ${alloc.hourlyCost}/h` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {alloc.consumedHours}h <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>/ {alloc.allocatedHours}h</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: userPct > 100 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {userPct}% consumido
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso do analista */}
                  <div style={{ height: '5px', background: 'var(--bg-surface)', border: '1px solid var(--card-border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(userPct, 100)}%`, 
                      height: '100%', 
                      background: userPct > 100 ? 'var(--danger)' : 'var(--accent)' 
                    }} />
                  </div>
                </div>
              );
            })}

            {project.allocations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Nenhum analista alocado neste projeto até o momento.
              </div>
            )}
          </div>
        </div>

        {/* Seção de Marcos do Projeto (Milestones) */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  Marcos de Entrega (Milestones)
                </h2>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  Total: {project.milestones.reduce((acc, m) => acc + m.weight, 0)}%
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Clique no marco para alternar conclusão e recalcular o avanço físico
              </p>
            </div>

            {!isAnalyst && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setIsMilestoneModalOpen(true)}
              >
                <Plus size={15} />
                <span>Novo Marco</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {project.milestones.map(m => (
              <div 
                key={m.id}
                onClick={() => handleToggleMilestone(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: m.isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${m.isCompleted ? 'rgba(16, 185, 129, 0.35)' : 'var(--card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isTogglingMilestone === m.id ? 0.6 : 1
                }}
                title="Clique para alternar status de conclusão"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {m.isCompleted ? (
                    <CheckCircle2 size={19} color="var(--success)" />
                  ) : (
                    <Circle size={19} color="var(--text-muted)" />
                  )}
                  <div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 500,
                      color: m.isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textDecoration: m.isCompleted ? 'line-through' : 'none'
                    }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: m.isCompleted ? 'var(--success)' : 'var(--text-muted)' }}>
                      {m.isCompleted ? 'Entrega concluída' : 'Pendente de validação'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Peso:</span>
                  <strong style={{ color: m.isCompleted ? 'var(--success)' : 'var(--accent-light)' }}>{m.weight}%</strong>
                </div>
              </div>
            ))}

            {project.milestones.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Nenhum marco cadastrado para este projeto.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modais */}
      <CreateMilestoneModal 
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSuccess={() => {
          setIsMilestoneModalOpen(false);
          fetchProject();
        }}
        projectId={project.id}
        projectName={project.name}
        currentTotalWeight={project.milestones.reduce((acc, m) => acc + m.weight, 0)}
      />
      <AllocateModal 
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSuccess={() => {
          setIsAllocateModalOpen(false);
          fetchProject();
        }}
        projectId={project.id}
        projectName={project.name}
      />

      <TimeEntryModal 
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSuccess={() => {
          setIsTimeModalOpen(false);
          fetchProject();
        }}
        projectId={project.id}
        projects={[{ ...project, clientName: project.client?.name }]}
      />
    </div>
  );
};
