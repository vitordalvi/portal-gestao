namespace portal_gestao_api.Application.DTOs;

/// <summary>
/// DTO para atualização de um Marco de Entrega (Milestone) existente.
/// Permite renomear a entrega e ajustar o peso percentual ponderado para o avanço físico.
/// </summary>
public class UpdateMilestoneDto
{
    /// <summary>
    /// Novo título ou descrição do marco de entrega.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Novo peso percentual (1 a 100) do marco no cálculo de avanço físico total.
    /// </summary>
    public int Weight { get; set; }
}
