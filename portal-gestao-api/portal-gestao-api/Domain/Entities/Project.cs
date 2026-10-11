namespace portal_gestao_api.Domain.Entities;

/// <summary>
/// Entidade raiz de agregação que representa um Projeto de Consultoria.
/// Implementa o padrão Rich Domain Model, encapsulando regras de negócio
/// para cálculo de avanço físico, consumo de horas, margem financeira e diagnóstico de saúde.
/// </summary>
public class Project
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SoldHours { get; set; }
    public int PlannedHours { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? LastSyncDate { get; set; }
    public string? SyncStatus { get; set; }
    public string? ErpId { get; set; }

    // Propriedades de Navegação
    public Client? Client { get; set; }
    public List<Milestone> Milestones { get; set; } = new();
    public List<Allocation> Allocations { get; set; } = new();

    /// <summary>
    /// Calcula o percentual de avanço físico com base no peso dos marcos (Milestones) concluídos.
    /// Se a soma dos pesos for zero ou não houver marcos, retorna 0%.
    /// </summary>
    public decimal GetPhysicalProgress()
    {
        if (!Milestones.Any()) return 0;
        var totalWeight = Milestones.Sum(m => m.Weight);
        if (totalWeight == 0) return 0;
        var completedWeight = Milestones.Where(m => m.IsCompleted).Sum(m => m.Weight);
        return (decimal)completedWeight / totalWeight * 100;
    }

    /// <summary>
    /// Retorna o total de horas consumidas somando os apontamentos (TimeEntries) de todas as alocações.
    /// </summary>
    public decimal GetConsumedHours()
    {
        return Allocations.SelectMany(a => a.TimeEntries).Sum(te => te.Hours);
    }

    /// <summary>
    /// Retorna o saldo de horas disponíveis (Horas Vendidas - Horas Consumidas).
    /// </summary>
    public decimal GetHourBalance()
    {
        return SoldHours - GetConsumedHours();
    }

    /// <summary>
    /// Determina o status consolidado de saúde do projeto ("Saudável", "Atenção" ou "Crítico")
    /// baseado em regras combinadas de prazo, orçamento de horas e ritmo de entrega:
    /// - Crítico: consumo de horas estourado (>100%) OU data final expirada sem 100% de avanço.
    /// - Atenção: descompasso entre consumo e avanço físico (>15 p.p.) OU consumo preventivo >= 80%.
    /// - Saudável: execução alinhada com o planejado.
    /// </summary>
    public string GetHealthStatus()
    {
        if (SoldHours == 0) return "Saudável";

        decimal consumptionRate = (GetConsumedHours() / SoldHours) * 100;
        decimal physicalProgress = GetPhysicalProgress();

        if (consumptionRate > 100 || (DateTime.UtcNow > EndDate && physicalProgress < 100))
            return "Crítico";

        if (consumptionRate > physicalProgress + 15 || consumptionRate >= 80)
            return "Atenção";

        return "Saudável";
    }

    /// <summary>
    /// Retorna os motivos objetivos e diagnósticos explicativos que justificam a classificação de saúde.
    /// Utilizado pela UI para exibir popovers informativos aos gestores e coordenadores.
    /// </summary>
    public List<string> GetHealthReasons()
    {
        var reasons = new List<string>();
        if (SoldHours == 0) return reasons;

        decimal consumedHours = GetConsumedHours();
        decimal consumptionRate = (consumedHours / SoldHours) * 100;
        decimal physicalProgress = GetPhysicalProgress();

        // 1. Estouro de orçamento de horas
        if (consumptionRate > 100)
        {
            reasons.Add($"Horas contratadas estouradas: {consumedHours:0.#}h consumidas de {SoldHours}h vendidas ({consumptionRate:0.#}% consumido).");
        }

        // 2. Atraso de cronograma contratual
        if (DateTime.UtcNow > EndDate && physicalProgress < 100)
        {
            reasons.Add($"Prazo contratual expirado em {EndDate:dd/MM/yyyy} com avanço físico em {physicalProgress:0.#}%.");
        }

        // 3. Descompasso entre consumo de esforço e entrega tangível
        if (consumptionRate > physicalProgress + 15)
        {
            reasons.Add($"Descompasso entre consumo e entrega: {consumptionRate:0.#}% das horas consumidas para {physicalProgress:0.#}% de avanço físico ({consumptionRate - physicalProgress:0.#} p.p. de diferença).");
        }

        // 4. Alerta preventivo ao atingir 80% do teto contratual
        if (consumptionRate >= 80 && consumptionRate <= 100)
        {
            reasons.Add($"Consumo de horas atingiu {consumptionRate:0.#}%, ultrapassando o limiar de alerta preventivo (80%).");
        }

        return reasons;
    }

    /// <summary>
    /// Calcula o custo financeiro realizado do projeto com base nas horas apontadas
    /// e no valor/hora (HourlyCost) da alocação de cada analista.
    /// </summary>
    public decimal GetRealizedCost()
    {
        return Allocations.Sum(a => a.GetTotalCost());
    }

    /// <summary>
    /// Calcula a margem financeira bruta atual do projeto (Valor Total Contratado - Custo Realizado).
    /// </summary>
    public decimal GetFinancialMargin()
    {
        return TotalValue - GetRealizedCost();
    }
}
