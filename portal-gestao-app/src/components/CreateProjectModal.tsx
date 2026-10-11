import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Calendar } from 'lucide-react';
import { createProject, getClients } from '../services/api';
import { Client } from '../types';
import './TimeEntryModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [soldHours, setSoldHours] = useState('120');
  const [plannedHours, setPlannedHours] = useState('120');
  const [totalValue, setTotalValue] = useState('72000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getClients()
        .then(data => {
          setClients(data);
          if (data.length > 0) {
            setClientId(data[0].id);
          }
        })
        .catch(err => {
          console.error('Erro ao carregar clientes:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Selecione um cliente cadastrado no ERP TOTVS.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProject({
        name: name.trim(),
        clientId,
        soldHours: parseInt(soldHours, 10),
        plannedHours: parseInt(plannedHours, 10),
        totalValue: parseFloat(totalValue),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
      setName('');
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar projeto:', err);
      setError(err?.response?.data?.message || 'Falha ao cadastrar projeto na API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Novo Projeto</h2>
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
            <label className="form-label">Nome do Projeto:</label>
            <input 
              className="form-input"
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Implantação TOTVS Folha & Ponto Eletrônico"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cliente (TOTVS ERP / CRM):</label>
            <select 
              className="form-select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Segmento: {c.segment} (CNPJ: {c.cnpj})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Horas Vendidas:</label>
              <div className="input-group">
                <input 
                  className="form-input"
                  type="number" 
                  min="1" 
                  required 
                  value={soldHours}
                  onChange={(e) => setSoldHours(e.target.value)}
                />
                <span className="input-group-addon input-group-addon-right">h</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Horas Previstas:</label>
              <div className="input-group">
                <input 
                  className="form-input"
                  type="number" 
                  min="1" 
                  required 
                  value={plannedHours}
                  onChange={(e) => setPlannedHours(e.target.value)}
                />
                <span className="input-group-addon input-group-addon-right">h</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contrato:</label>
              <div className="input-group">
                <span className="input-group-addon">R$</span>
                <input 
                  className="form-input"
                  type="number" 
                  min="1" 
                  required 
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Início Previsto:</label>
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
              <label className="form-label">Término Previsto:</label>
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
              className="btn-modal-primary" 
              disabled={isSubmitting}
            >
              <FolderPlus size={16} />
              <span>{isSubmitting ? 'Cadastrando...' : 'Criar Projeto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
