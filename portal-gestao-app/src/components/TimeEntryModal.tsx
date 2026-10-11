import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { createTimeEntry } from '../services/api';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModalA11y } from '../hooks/useModalA11y';
import './TimeEntryModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  projects?: Project[];
}

export const TimeEntryModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId: initialProjectId, 
  projects = [] 
}) => {
  const { currentUser } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { overlayProps } = useModalA11y({ isOpen, onClose, disabled: isSubmitting });

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [initialProjectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Por favor selecione um projeto.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTimeEntry({
        projectId: selectedProjectId,
        userId: currentUser?.id || 'bbbbbbbb-3333-3333-3333-333333333333',
        date: new Date().toISOString(),
        hours: parseFloat(hours),
        description: description.trim()
      });
      setHours('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao apontar horas:', err);
      if (!err?.response) {
        setError('Não foi possível conectar à API .NET (porta 5062). Certifique-se de que o backend está rodando com `dotnet run`.');
      } else {
        const backendMsg = err.response.data?.message || (typeof err.response.data === 'string' ? err.response.data : null);
        setError(backendMsg || 'Erro ao registrar apontamento na API.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" {...overlayProps}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Apontamento de Horas</h2>
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
          {projects.length > 0 && (
            <div className="form-group">
              <label className="form-label">Projeto Destino:</label>
              <select 
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.clientName ? `(${p.clientName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Quantidade de Horas:</label>
            <div className="input-group">
              <span className="input-group-addon"><Clock size={15} /></span>
              <input 
                className="form-input"
                type="number" 
                step="0.5" 
                min="0.5" 
                max="24"
                required 
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Ex: 4.0"
              />
              <span className="input-group-addon input-group-addon-right">horas</span>
            </div>
            <div className="quick-chips-row">
              {['1.0', '2.0', '4.0', '6.0', '8.0'].map(h => (
                <button key={h} type="button" className="quick-chip" onClick={() => setHours(h)}>
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição das Atividades:</label>
            <textarea 
              className="form-textarea"
              rows={3}
              required 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Customização de rotina ADVPL e testes unitários no ambiente de homologação"
            />
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
              className="btn-modal-primary" 
              disabled={isSubmitting}
            >
              <Clock size={16} />
              <span>{isSubmitting ? 'Gravando Apontamento...' : 'Confirmar Apontamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
