import React, { useState } from 'react';
import { X, Flag, Percent } from 'lucide-react';
import { createMilestone } from '../services/api';
import { useModalA11y } from '../hooks/useModalA11y';
import './TimeEntryModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  projectName: string;
  currentTotalWeight?: number;
}

export const CreateMilestoneModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId,
  projectName,
  currentTotalWeight = 0
}) => {
  const suggestedWeight = Math.max(0, 100 - currentTotalWeight);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(suggestedWeight > 0 ? suggestedWeight.toString() : '20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { overlayProps } = useModalA11y({ isOpen, onClose, disabled: isSubmitting });

  if (!isOpen) return null;

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
      await createMilestone(projectId, {
        name: name.trim(),
        weight: weightNum
      });
      setName('');
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar marco:', err);
      setError(err?.response?.data?.message || 'Falha ao cadastrar marco na API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" {...overlayProps}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Novo Marco de Entrega</h2>
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
              placeholder="Ex: Homologação e Testes Integrados UAT"
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
              {['10', '20', '30', '40'].map(w => (
                <button key={w} type="button" className="quick-chip" onClick={() => setWeight(w)}>
                  {w}%
                </button>
              ))}
              {suggestedWeight > 0 && (
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
              Peso acumulado atual dos outros marcos: <strong>{currentTotalWeight}%</strong>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-modal-cancel" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-modal-primary btn-modal-emerald" 
              disabled={isSubmitting}
            >
              <Flag size={16} />
              <span>{isSubmitting ? 'Gravando Marco...' : 'Adicionar Marco'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
