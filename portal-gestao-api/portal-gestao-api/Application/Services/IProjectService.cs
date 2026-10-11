using portal_gestao_api.Application.DTOs;

namespace portal_gestao_api.Application.Services;

/// <summary>
/// Contrato da camada de aplicação para orquestração de casos de uso de Projetos,
/// Alocações e Marcos de Entrega.
/// </summary>
public interface IProjectService
{
    /// <summary>
    /// Lista todos os projetos com indicadores calculados (avanço físico, saúde, saldo de horas e margem financeira).
    /// </summary>
    Task<object> GetAllProjectsAsync();

    /// <summary>
    /// Obtém os detalhes completos de um projeto pelo identificador único.
    /// </summary>
    Task<object?> GetProjectByIdAsync(Guid id);

    /// <summary>
    /// Cadastra um novo projeto no sistema.
    /// </summary>
    Task<object> CreateProjectAsync(CreateProjectDto request);

    /// <summary>
    /// Aloca um analista em um projeto com escopo de horas e valor hora pré-definidos.
    /// </summary>
    Task<object> AllocateUserAsync(Guid projectId, CreateAllocationDto request);

    /// <summary>
    /// Atualiza as horas alocadas, valor da hora e datas de vigência da alocação de um analista.
    /// Recalcula automaticamente custos realizados e margem financeira.
    /// </summary>
    Task<object?> UpdateAllocationAsync(Guid projectId, Guid allocationId, UpdateAllocationDto request);

    /// <summary>
    /// Remove a alocação de um analista caso ele ainda não possua apontamentos registrados.
    /// Bloqueia a exclusão se houver apontamentos para garantir integridade contábil.
    /// </summary>
    Task<(bool Success, string? ErrorMessage)> DeleteAllocationAsync(Guid projectId, Guid allocationId);

    /// <summary>
    /// Adiciona um novo marco de entrega vinculado ao projeto.
    /// </summary>
    Task<object> AddMilestoneAsync(Guid projectId, CreateMilestoneDto request);

    /// <summary>
    /// Atualiza o nome e o peso percentual de um marco de entrega.
    /// </summary>
    Task<object?> UpdateMilestoneAsync(Guid projectId, Guid milestoneId, UpdateMilestoneDto request);

    /// <summary>
    /// Remove um marco de entrega e recalcula o avanço físico ponderado dos marcos remanescentes.
    /// </summary>
    Task<bool> DeleteMilestoneAsync(Guid projectId, Guid milestoneId);

    /// <summary>
    /// Alterna o status de conclusão (concluído/pendente) de um marco de entrega.
    /// </summary>
    Task<object?> ToggleMilestoneAsync(Guid projectId, Guid milestoneId);

    /// <summary>
    /// Dispara a sincronização manual do projeto com o ERP TOTVS RM / Protheus,
    /// atualizando LastSyncDate para agora e SyncStatus para 'Sincronizado'.
    /// </summary>
    Task<object?> SyncProjectWithErpAsync(Guid id);
}
