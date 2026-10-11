import React, { useState, useEffect } from 'react';
import { X, Check, Clock } from 'lucide-react';
import { AllocationDetail } from '../types';
import { updateAllocation } from '../services/api';
import { useModalA11y } from '../hooks/useModalA11y';
import './TimeEntryModal.css';

/**
 * Propriedades para o modal de edição de parâmetros de alocação de analista.
 */
interface Props {
  /** Indica se o modal está visível */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback executado após salvar com sucesso na API */
  onSuccess: () => void;
  /** ID do projeto */
  projectId: string;
  /** Nome do projeto exibido no cabeçalho */
  projectName: string;
  /** Objeto com os dados atuais da alocação do analista */
  allocation: AllocationDetail | null;
}

/**
 * Modal que permite ao coordenador ou diretor:
 * 1. Alterar a carga horária prevista do analista no escopo do projeto;
 * 2. Alterar o valor da taxa/hora (HourlyCost) para recálculo de margem bruta;
 * 3. Prorrogar ou antecipar o período de atuação (StartDate / EndDate);
 * 4. Visualizar comparativamente o impacto financeiro (Custo Realizado Atual vs. Custo Projetado).
 */
export const EditAllocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectName,
  allocation,
}) => {
  const [allocatedHours, setAllocatedHours] = useState('40');
  const [hourlyCost, setHourlyCost] = useState('160');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { overlayProps } = useModalA11y({ isOpen, onClose, disabled: isSubmitting });

  useEffect(() => {
    if (allocation) {
      setAllocatedHours(allocation.allocatedHours.toString());
      setHourlyCost(allocation.hourlyCost.toString());
      setStartDate(allocation.startDate ? allocation.startDate.split('T')[0] : '');
      setEndDate(allocation.endDate ? allocation.endDate.split('T')[0] : '');
      setError(null);
    }
  }, [allocation]);

  if (!isOpen || !allocation) return null;

  const hoursNum = parseInt(allocatedHours, 10) || 0;
  const costNum = parseFloat(hourlyCost) || 0;
  const projectedTotalCost = hoursNum * costNum;
  const currentRealizedCost = allocation.consumedHours * costNum;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hoursNum <= 0) {
      setError('A carga horária deve ser maior que zero.');
      return;
    }

    if (costNum <= 0) {
      setError('O custo por hora deve ser maior que zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateAllocation(projectId, allocation.id, {
        allocatedHours: hoursNum,
        hourlyCost: costNum,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao atualizar alocação:', err);
      setError(err?.response?.data?.message || 'Falha ao atualizar a alocação na API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" {...overlayProps}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Gerenciar Horas e Taxa do Analista</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{projectName}</div>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {/* Informações do Analista */}
        <div style={{
          padding: '0.85rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {allocation.user?.name || 'Analista'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {allocation.user?.email || 'N/A'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horas já apontadas:</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {allocation.consumedHours}h realizadas
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Horas Alocadas / Previstas:</label>
            <div className="input-group">
              <span className="input-group-addon"><Clock size={16} /></span>
              <input 
                className="form-input"
                type="number" 
                min="1" 
                required 
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(e.target.value)}
              />
              <span className="input-group-addon input-group-addon-right">horas no escopo</span>
            </div>

            <div className="quick-chips-row">
              {['20', '40', '60', '80', '100', '120'].map(h => (
                <button key={h} type="button" className="quick-chip" onClick={() => setAllocatedHours(h)}>
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custo por Hora do Consultor (R$/h):</label>
            <div className="input-group">
              <span className="input-group-addon">R$</span>
              <input 
                className="form-input"
                type="number" 
                min="1" 
                step="0.01"
                required 
                value={hourlyCost}
                onChange={(e) => setHourlyCost(e.target.value)}
              />
              <span className="input-group-addon input-group-addon-right">/ hora</span>
            </div>

            <div className="quick-chips-row">
              {['120', '150', '180', '200', '250'].map(c => (
                <button key={c} type="button" className="quick-chip" onClick={() => setHourlyCost(c)}>
                  R$ {c}/h
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data Início:</label>
              <input 
                className="form-input"
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Fim:</label>
              <input 
                className="form-input"
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Resumo de Impacto Financeiro */}
          <div style={{
            marginTop: '0.5rem',
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Custo Realizado Atual:</div>
              <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(currentRealizedCost)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)' }}>Custo Total Previsto da Alocação:</div>
              <strong style={{ color: 'var(--accent-light)' }}>{formatCurrency(projectedTotalCost)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
