using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Domain.Interfaces;

/// <summary>
/// Contrato do repositório para persistência e recuperação de Projetos, Alocações e Marcos.
/// </summary>
public interface IProjectRepository
{
    /// <summary>
    /// Retorna todos os projetos com suas respectivas entidades filhas (Clientes, Alocações, TimeEntries, Marcos).
    /// </summary>
    Task<IEnumerable<Project>> GetAllWithDetailsAsync();

    /// <summary>
    /// Retorna um projeto específico com grafo completo de navegação pelo identificador único.
    /// </summary>
    Task<Project?> GetByIdWithDetailsAsync(Guid id);

    /// <summary>
    /// Adiciona um novo projeto ao contexto de dados.
    /// </summary>
    Task AddAsync(Project project);

    /// <summary>
    /// Atualiza dados de um projeto existente (ex: data e status de sincronização com o ERP).
    /// </summary>
    Task UpdateProjectAsync(Project project);

    /// <summary>
    /// Adiciona uma nova alocação de analista a um projeto.
    /// </summary>
    Task AddAllocationAsync(Allocation allocation);

    /// <summary>
    /// Busca uma alocação com seus apontamentos de horas e dados de usuário inclusos.
    /// </summary>
    Task<Allocation?> GetAllocationByIdAsync(Guid allocationId);

    /// <summary>
    /// Atualiza os dados persistidos de uma alocação existente.
    /// </summary>
    Task UpdateAllocationAsync(Allocation allocation);

    /// <summary>
    /// Remove uma alocação do repositório.
    /// </summary>
    Task DeleteAllocationAsync(Allocation allocation);

    /// <summary>
    /// Adiciona um novo marco de entrega (Milestone) ao projeto.
    /// </summary>
    Task AddMilestoneAsync(Milestone milestone);

    /// <summary>
    /// Busca um marco de entrega pelo seu identificador único.
    /// </summary>
    Task<Milestone?> GetMilestoneByIdAsync(Guid milestoneId);

    /// <summary>
    /// Atualiza as propriedades de um marco de entrega existente.
    /// </summary>
    Task UpdateMilestoneAsync(Milestone milestone);

    /// <summary>
    /// Remove um marco de entrega do repositório.
    /// </summary>
    Task DeleteMilestoneAsync(Milestone milestone);
}
