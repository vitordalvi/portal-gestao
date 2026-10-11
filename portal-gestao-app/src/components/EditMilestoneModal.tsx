import React, { useState, useEffect } from 'react';
import { X, Percent, Check } from 'lucide-react';
import { Milestone } from '../types';
import { updateMilestone } from '../services/api';
import './TimeEntryModal.css';

/**
 * Propriedades para o modal de edição de marco de entrega (Milestone).
 */
interface Props {
  /** Indica se o modal está visível */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback executado após salvar com sucesso na API */
  onSuccess: () => void;
  /** ID do projeto vinculado */
  projectId: string;
  /** Nome do projeto exibido no cabeçalho */
  projectName: string;
  /** Marco de entrega a ser editado */
  milestone: Milestone | null;
  /** Soma atual dos pesos de todos os marcos cadastrados no projeto */
  currentTotalWeight?: number;
}

/**
 * Modal para edição de nome e peso de um marco de entrega.
 * Valida se a soma projetada dos pesos não ultrapassa 100% e permite
 * ajustes ágeis via chips numéricos.
 */
export const EditMilestoneModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectName,
  milestone,
  currentTotalWeight = 0,
}) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (milestone) {
      setName(milestone.name);
      setWeight(milestone.weight.toString());
      setError(null);
    }
  }, [milestone]);

  if (!isOpen || !milestone) return null;

  // Peso dos outros marcos (excluindo este que está sendo editado)
  const otherMilestonesWeight = Math.max(0, currentTotalWeight - milestone.weight);
  const suggestedWeight = Math.max(0, 100 - otherMilestonesWeight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do marco de entrega.');
      return;
    }

    const weightNum = parseInt(weight, 10);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('O peso deve ser um número maior que zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateMilestone(projectId, milestone.id, {
        name: name.trim(),
        weight: weightNum,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao editar marco:', err);
      setError(err?.response?.data?.message || 'Falha ao atualizar marco na API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Editar Marco de Entrega</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{projectName}</div>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
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
            <label className="form-label">Nome da Entrega / Marco:</label>
            <input 
              className="form-input"
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Blueprint e Parametrizações"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Peso Ponderado no Avanço Físico (%):
            </label>
            <div className="input-group">
              <span className="input-group-addon"><Percent size={15} /></span>
              <input 
                className="form-input"
                type="number" 
                min="1" 
                max="100" 
                required 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="input-group-addon input-group-addon-right">% do escopo</span>
            </div>
            
            <div className="quick-chips-row">
              {['10', '20', '30', '40', '50'].map(w => (
                <button key={w} type="button" className="quick-chip" onClick={() => setWeight(w)}>
                  {w}%
                </button>
              ))}
              {suggestedWeight > 0 && suggestedWeight !== milestone.weight && (
                <button 
                  type="button" 
                  className="quick-chip" 
                  style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                  onClick={() => setWeight(suggestedWeight.toString())}
                >
                  Sugerido: {suggestedWeight}% (Fecha 100%)
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
              Peso dos outros marcos: <strong>{otherMilestonesWeight}%</strong> | Nova soma total: <strong>{otherMilestonesWeight + (parseInt(weight, 10) || 0)}%</strong>
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
