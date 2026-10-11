import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calendar, Clock } from 'lucide-react';
import { allocateUserToProject, getUsers } from '../services/api';
import { User } from '../types';
import './TimeEntryModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  projectName: string;
}

export const AllocateModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId,
  projectName
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [allocatedHours, setAllocatedHours] = useState('40');
  const [hourlyCost, setHourlyCost] = useState('160');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getUsers()
        .then(data => {
          // Pega preferencialmente analistas
          const analysts = data.filter(u => u.role === 2);
          setUsers(analysts.length > 0 ? analysts : data);
          if (data.length > 0) {
            setSelectedUserId(analysts.length > 0 ? analysts[0].id : data[0].id);
          }
        })
        .catch(err => {
          console.error('Erro ao carregar usuários:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Selecione um analista.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await allocateUserToProject(projectId, {
        userId: selectedUserId,
        allocatedHours: parseInt(allocatedHours, 10),
        hourlyCost: parseFloat(hourlyCost),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao alocar analista:', err);
      setError(err?.response?.data?.message || 'Falha ao alocar analista.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Alocar Analista</h2>
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
            <label className="form-label">Analista da Fábrica / Consultor:</label>
            <select 
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Horas Previstas:
              </label>
              <div className="input-group">
                <span className="input-group-addon"><Clock size={15} /></span>
                <input 
                  className="form-input"
                  type="number" 
                  min="1" 
                  max="500"
                  required 
                  value={allocatedHours}
                  onChange={(e) => setAllocatedHours(e.target.value)}
                />
                <span className="input-group-addon input-group-addon-right">horas</span>
              </div>
              <div className="quick-chips-row">
                {['20', '40', '80', '120'].map(h => (
                  <button key={h} type="button" className="quick-chip" onClick={() => setAllocatedHours(h)}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Custo Horário:
              </label>
              <div className="input-group">
                <span className="input-group-addon">R$</span>
                <input 
                  className="form-input"
                  type="number" 
                  min="1" 
                  required 
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(e.target.value)}
                />
                <span className="input-group-addon input-group-addon-right">/h</span>
              </div>
              <div className="quick-chips-row">
                {['130', '150', '180', '220'].map(c => (
                  <button key={c} type="button" className="quick-chip" onClick={() => setHourlyCost(c)}>
                    R$ {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                Data de Início:
              </label>
              <div className="input-group">
                <span className="input-group-addon"><Calendar size={15} /></span>
                <input 
                  className="form-input"
                  type="date" 
                  required 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Data de Fim:
              </label>
              <div className="input-group">
                <span className="input-group-addon"><Calendar size={15} /></span>
                <input 
                  className="form-input"
                  type="date" 
                  required 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
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
              className="btn-modal-primary btn-modal-purple" 
              disabled={isSubmitting}
            >
              <UserPlus size={16} />
              <span>{isSubmitting ? 'Alocando Analista...' : 'Confirmar Alocação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
