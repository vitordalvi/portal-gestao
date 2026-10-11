import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  Circle,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';
import { TotvsSyncBadge } from '../components/TotvsSyncBadge';
import { ProjectDetail, Milestone, AllocationDetail } from '../types';
import { getProjectById, toggleMilestone, deleteMilestone, deleteAllocation, syncProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AllocateModal } from '../components/AllocateModal';
import { EditAllocationModal } from '../components/EditAllocationModal';
import { ConfirmDeallocateModal } from '../components/ConfirmDeallocateModal';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { CreateMilestoneModal } from '../components/CreateMilestoneModal';
import { EditMilestoneModal } from '../components/EditMilestoneModal';
import { ConfirmDeleteMilestoneModal } from '../components/ConfirmDeleteMilestoneModal';
import { formatPercent } from '../utils/format';

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
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [isDeletingMilestoneAction, setIsDeletingMilestoneAction] = useState(false);
  const [isTogglingMilestone, setIsTogglingMilestone] = useState<string | null>(null);

  const [editingAllocation, setEditingAllocation] = useState<AllocationDetail | null>(null);
  const [deallocatingAllocation, setDeallocatingAllocation] = useState<AllocationDetail | null>(null);
  const [isDeallocatingAction, setIsDeallocatingAction] = useState(false);
  const [deallocateError, setDeallocateError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchProject = async (isInitial = false) => {
    if (!id) return;
    if (isInitial) setLoading(true);
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar os detalhes do projeto.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  /**
   * Alterna a conclusão de um marco (concluído <-> pendente) e recarrega os dados do projeto
   * para refletir o novo percentual de avanço físico e saúde calculada.
   */
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

  /**
   * Confirma e executa a exclusão definitiva de um marco de entrega.
   * Recalcula o avanço físico ponderado dos marcos restantes.
   */
  const handleConfirmDeleteMilestone = async () => {
    if (!project || !deletingMilestone || isDeletingMilestoneAction) return;
    setIsDeletingMilestoneAction(true);
    try {
      await deleteMilestone(project.id, deletingMilestone.id);
      setDeletingMilestone(null);
      await fetchProject();
    } catch (err) {
      console.error('Erro ao excluir marco:', err);
    } finally {
      setIsDeletingMilestoneAction(false);
    }
  };

  /**
   * Confirma e executa a remoção de alocação de analista da equipe do projeto.
   * Se o analista já possuir apontamentos de horas, a API bloqueia a exclusão
   * e a mensagem de erro é exibida no banner do modal.
   */
  const handleConfirmDeallocate = async () => {
    if (!project || !deallocatingAllocation || isDeallocatingAction) return;
    setIsDeallocatingAction(true);
    setDeallocateError(null);
    try {
      await deleteAllocation(project.id, deallocatingAllocation.id);
      setDeallocatingAllocation(null);
      await fetchProject();
    } catch (err: any) {
      console.error('Erro ao desalocar analista:', err);
      const message = err.response?.data?.message || err.message || 'Erro ao remover a alocação do analista.';
      setDeallocateError(message);
    } finally {
      setIsDeallocatingAction(false);
    }
  };

  /**
   * Dispara a sincronização manual sob demanda com o ERP TOTVS.
   */
  const handleSyncWithErp = async () => {
    if (!project || isSyncing) return;
    setIsSyncing(true);
    try {
      const updated = await syncProject(project.id);
      setProject(updated);
    } catch (err) {
      console.error('Erro ao sincronizar com TOTVS:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchProject(true);
  }, [id]);

  if (loading && !project) {
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
              <HealthBadge 
                status={project.healthStatus} 
                reasons={project.healthReasons} 
                align="left" 
                placement="bottom" 
              />
              <TotvsSyncBadge 
                lastSyncDate={project.lastSyncDate}
                syncStatus={project.syncStatus}
                erpId={project.erpId}
                onSync={handleSyncWithErp}
                isSyncing={isSyncing}
                canSync={!isAnalyst}
              />
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
                        {alloc.user?.email || 'N/A'}{!isAnalyst ? ` • R$ ${alloc.hourlyCost}/h` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {alloc.consumedHours}h <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>/ {alloc.allocatedHours}h</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: userPct > 100 ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {userPct}% consumido
                        </div>
                      </div>

                      {!isAnalyst && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.45rem', fontSize: '0.75rem', borderColor: 'var(--card-border-subtle)' }}
                            title="Editar horas e custo da alocação"
                            onClick={() => setEditingAllocation(alloc)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ 
                              padding: '0.3rem 0.45rem', 
                              fontSize: '0.75rem', 
                              color: 'var(--danger)',
                              borderColor: 'rgba(239, 68, 68, 0.25)'
                            }}
                            title="Desalocar analista do projeto"
                            onClick={() => {
                              setDeallocateError(null);
                              setDeallocatingAllocation(alloc);
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Peso:</span>
                    <strong style={{ color: m.isCompleted ? 'var(--success)' : 'var(--accent-light)' }}>{m.weight}%</strong>
                  </div>

                  {!isAnalyst && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.45rem', fontSize: '0.75rem', borderColor: 'var(--card-border-subtle)' }}
                        title="Editar este marco"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMilestone(m);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ 
                          padding: '0.3rem 0.45rem', 
                          fontSize: '0.75rem', 
                          color: 'var(--danger)',
                          borderColor: 'rgba(239, 68, 68, 0.25)'
                        }}
                        title="Excluir este marco"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingMilestone(m);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
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
      <EditMilestoneModal 
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        onSuccess={() => {
          setEditingMilestone(null);
          fetchProject();
        }}
        projectId={project.id}
        projectName={project.name}
        milestone={editingMilestone}
        currentTotalWeight={project.milestones.reduce((acc, m) => acc + m.weight, 0)}
      />
      <ConfirmDeleteMilestoneModal 
        isOpen={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleConfirmDeleteMilestone}
        milestoneName={deletingMilestone?.name || ''}
        milestoneWeight={deletingMilestone?.weight || 0}
        isDeleting={isDeletingMilestoneAction}
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

      <EditAllocationModal 
        isOpen={!!editingAllocation}
        onClose={() => setEditingAllocation(null)}
        onSuccess={() => {
          setEditingAllocation(null);
          fetchProject();
        }}
        projectId={project.id}
        projectName={project.name}
        allocation={editingAllocation}
      />

      <ConfirmDeallocateModal 
        isOpen={!!deallocatingAllocation}
        onClose={() => {
          setDeallocatingAllocation(null);
          setDeallocateError(null);
        }}
        onConfirm={handleConfirmDeallocate}
        analystName={deallocatingAllocation?.user?.name || 'Analista'}
        allocatedHours={deallocatingAllocation?.allocatedHours || 0}
        consumedHours={deallocatingAllocation?.consumedHours || 0}
        isDeallocating={isDeallocatingAction}
        errorMessage={deallocateError}
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
