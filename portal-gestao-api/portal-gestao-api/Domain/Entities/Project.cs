namespace portal_gestao_api.Domain.Entities;

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

    // Navigations
    public Client? Client { get; set; }
    public List<Milestone> Milestones { get; set; } = new();
    public List<Allocation> Allocations { get; set; } = new();

    // Domain Logic - Calculando Saúde (Rich Domain Model)
    public decimal GetPhysicalProgress()
    {
        if (!Milestones.Any()) return 0;
        var totalWeight = Milestones.Sum(m => m.Weight);
        if (totalWeight == 0) return 0;
        var completedWeight = Milestones.Where(m => m.IsCompleted).Sum(m => m.Weight);
        return (decimal)completedWeight / totalWeight * 100;
    }

    public decimal GetConsumedHours()
    {
        return Allocations.SelectMany(a => a.TimeEntries).Sum(te => te.Hours);
    }

    public decimal GetHourBalance()
    {
        return SoldHours - GetConsumedHours();
    }

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

    public decimal GetRealizedCost()
    {
        return Allocations.Sum(a => a.GetTotalCost());
    }

    public decimal GetFinancialMargin()
    {
        return TotalValue - GetRealizedCost();
    }
}
