import React from 'react';
import { X, UserMinus, AlertTriangle, AlertCircle } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import './TimeEntryModal.css';

/**
 * Propriedades para o modal de confirmação de desalocação de analista.
 */
interface Props {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback para confirmar a remoção da alocação */
  onConfirm: () => void;
  /** Nome do analista exibido na confirmação */
  analystName: string;
  /** Horas contratadas na alocação */
  allocatedHours: number;
  /** Total de horas já apontadas pelo analista neste projeto */
  consumedHours: number;
  /** Estado de carregamento da chamada de exclusão na API */
  isDeallocating: boolean;
  /** Mensagem de erro caso a API recuse a exclusão */
  errorMessage?: string | null;
}

/**
 * Modal de confirmação para remoção de alocação de analista.
 * Implementa verificação preventiva: se o analista já tiver apontamentos (consumedHours > 0),
 * exibe alerta educativo e desativa o botão de confirmação para proteger a integridade contábil.
 */
export const ConfirmDeallocateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  analystName,
  allocatedHours,
  consumedHours,
  isDeallocating,
  errorMessage,
}) => {
  const { overlayProps } = useModalA11y({ isOpen, onClose, disabled: isDeallocating });

  if (!isOpen) return null;

  const hasLoggedHours = consumedHours > 0;

  return (
    <div className="modal-overlay" {...overlayProps}>
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <UserMinus size={20} />
            <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Desalocar Analista</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isDeallocating}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            color: 'var(--danger)',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{
          padding: '1rem',
          background: hasLoggedHours ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${hasLoggedHours ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} style={{ color: hasLoggedHours ? 'var(--warning)' : 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
            Tem certeza de que deseja remover a alocação de <strong>{analystName}</strong> ({allocatedHours}h alocadas)?
            
            {hasLoggedHours ? (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 500 }}>
                ⚠️ Este analista já possui <strong>{consumedHours}h</strong> de horas apontadas. Para preservar a integridade contábil e o histórico do projeto, alocações com apontamentos não podem ser excluídas. Caso queira encerrar a atuação, encerre a data fim ou ajuste as horas alocadas.
              </div>
            ) : (
              <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Esta ação removerá o analista da equipe do projeto e liberará as horas do orçamento.
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem 1.25rem' }}
            onClick={onClose}
            disabled={isDeallocating}
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
              opacity: hasLoggedHours ? 0.6 : 1,
              cursor: hasLoggedHours ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)'
            }}
            onClick={onConfirm}
            disabled={isDeallocating || hasLoggedHours}
            title={hasLoggedHours ? 'Não é possível remover alocação com horas já apontadas' : ''}
          >
            <UserMinus size={15} />
            <span>{isDeallocating ? 'Removendo...' : 'Sim, Desalocar Analista'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
