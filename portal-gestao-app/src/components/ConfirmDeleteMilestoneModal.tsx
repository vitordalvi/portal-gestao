import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import './TimeEntryModal.css';

/**
 * Propriedades para o modal de confirmação de exclusão de marco.
 */
interface Props {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback para confirmar a exclusão na API */
  onConfirm: () => void;
  /** Nome descritivo do marco a ser excluído */
  milestoneName: string;
  /** Peso percentual do marco */
  milestoneWeight: number;
  /** Estado de carregamento da chamada à API */
  isDeleting: boolean;
}

/**
 * Modal de confirmação para exclusão de marco de entrega (Milestone).
 * Alerta o usuário sobre a irreversibilidade da ação e o recálculo imediato do avanço físico.
 */
export const ConfirmDeleteMilestoneModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  milestoneName,
  milestoneWeight,
  isDeleting,
}) => {
  const { overlayProps } = useModalA11y({ isOpen, onClose, disabled: isDeleting });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" {...overlayProps}>
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <Trash2 size={20} />
            <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Excluir Marco</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isDeleting}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
            Tem certeza de que deseja excluir o marco <strong>"{milestoneName}"</strong> (peso <strong>{milestoneWeight}%</strong>)?
            <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Esta ação é irreversível. O avanço físico e a saúde do projeto serão recalculados imediatamente.
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem 1.25rem' }}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn"
            style={{
              padding: '0.55rem 1.25rem',
              background: 'var(--danger)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'var(--transition)'
            }}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir Marco'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
