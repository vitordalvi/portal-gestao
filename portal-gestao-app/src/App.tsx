import { useEffect, useState } from 'react';
import { RefreshCw, PlusCircle, LayoutDashboard } from 'lucide-react';
import { Project } from './types';
import { getProjects } from './services/api';
import { ProjectCard } from './components/ProjectCard';
import { TimeEntryModal } from './components/TimeEntryModal';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError('Erro ao conectar com a API .NET. Certifique-se de que o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchDashboard(); // recarrega a tabela após apontar horas
  };

  return (
    <>
      <div className="background-orb"></div>
      
      <main className="container">
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={40} color="var(--accent)" />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>
              Painel de Projetos <span style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>(Case PVT)</span>
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Monitoramento de Saúde Física e Financeira em Tempo Real
          </p>
        </header>

        <section style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn primary-btn" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
            Atualizar Dados
          </button>
          <button className="btn secondary-btn" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={20} />
            Lançar Horas
          </button>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Carregando projetos...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        ) : (
          <section className="grid">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {projects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Nenhum projeto encontrado.
              </div>
            )}
          </section>
        )}
      </main>

      <TimeEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
      />
    </>
  );
}

export default App;
