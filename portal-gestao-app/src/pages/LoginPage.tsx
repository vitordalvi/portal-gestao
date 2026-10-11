import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Code2, 
  Check, 
  Layers
} from 'lucide-react';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import { getUsers } from '../services/api';
import { User } from '../types';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { loginAs } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    getUsers()
      .then(users => {
        if (users && users.length > 0) {
          setAllUsers(users);
        }
      })
      .catch(() => {});
  }, []);

  const coordinatorUser = allUsers.find(u => u.role === 1) || MOCK_USERS[1];
  const analystUser = allUsers.find(u => u.id === 'bbbbbbbb-3333-3333-3333-333333333333') || MOCK_USERS[0];

  const handleSelectUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = allUsers.find(u => u.id === e.target.value);
    if (selected) {
      loginAs(selected);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="login-brand-tag">
          <Layers size={14} />
          <span>TOTVS • Fábrica de Software</span>
        </div>
        <h1 className="login-title">Acesse o Portal de Gestão</h1>
        <p className="login-description">
          Selecione o perfil operacional para testar a segregação de métricas e permissões (RBAC).
        </p>
      </div>

      <div className="persona-cards-grid">
        {/* Card 1: Coordenador / Gerência */}
        <div 
          className="persona-card coordinator-card" 
          onClick={() => loginAs(coordinatorUser)}
        >
          <div className="persona-header">
            <div className="persona-icon-indicator">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="persona-name">Mariana Costa</div>
              <div className="persona-role-badge">
                <span className="badge badge-role-coordinator">Coordenadora de Projetos</span>
              </div>
            </div>
          </div>

          <p className="persona-summary">
            Gestão operacional, saúde física e controle financeiro de contratos.
          </p>

          <ul className="persona-features">
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Painel executivo com margem de lucro em R$</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Visão da carteira completa e criação de projetos</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Alocação de analistas e taxas horárias</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Gestão de marcos contratuais (milestones)</span>
            </li>
          </ul>

          <button className="btn btn-primary persona-btn">
            Entrar como Coordenadora
          </button>
        </div>

        {/* Card 2: Analista */}
        <div 
          className="persona-card analyst-card" 
          onClick={() => loginAs(analystUser)}
        >
          <div className="persona-header">
            <div className="persona-icon-indicator">
              <Code2 size={20} />
            </div>
            <div>
              <div className="persona-name">Lucas Mendes</div>
              <div className="persona-role-badge">
                <span className="badge badge-role-analyst">Consultor Protheus Sênior</span>
              </div>
            </div>
          </div>

          <p className="persona-summary">
            Execução técnica, controle de esforço e apropriação de horas.
          </p>

          <ul className="persona-features">
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Acesso restrito aos projetos vinculados</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Apontamento de horas em alocações ativas</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Acompanhamento de avanço físico de entrega</span>
            </li>
            <li className="persona-feature-item">
              <Check size={14} />
              <span>Valores monetários estritamente ocultos</span>
            </li>
          </ul>

          <button className="btn btn-secondary persona-btn">
            Entrar como Analista
          </button>
        </div>
      </div>

      <div className="other-users-box">
        <label htmlFor="user-select" className="other-users-label">
          Ou selecione outro colaborador:
        </label>
        <select 
          id="user-select"
          className="other-users-select" 
          defaultValue="" 
          onChange={handleSelectUser}
        >
          <option value="" disabled>Selecione um usuário...</option>
          {allUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.role === 0 ? 'Diretoria' : u.role === 1 ? 'Coordenação' : 'Analista'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
