namespace portal_gestao_api.Application.DTOs;

/// <summary>
/// DTO para atualização dos parâmetros de alocação de um analista em um projeto.
/// Permite renegociação da carga horária contratada, taxa/hora de custo e período de vigência.
/// </summary>
public class UpdateAllocationDto
{
    /// <summary>
    /// Total de horas contratadas e previstas para o analista no projeto.
    /// </summary>
    public int AllocatedHours { get; set; }

    /// <summary>
    /// Custo horário do analista (R$/hora), utilizado no cálculo do custo realizado e margem financeira.
    /// </summary>
    public decimal HourlyCost { get; set; }

    /// <summary>
    /// Data prevista de início da atuação no projeto (opcional).
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Data limite ou encerramento previsto da atuação no projeto (opcional).
    /// </summary>
    public DateTime? EndDate { get; set; }
}
