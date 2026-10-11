namespace portal_gestao_api.Domain.Entities;

public class Allocation
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public int AllocatedHours { get; set; }
    public decimal HourlyCost { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Navigations
    public Project? Project { get; set; }
    public User? User { get; set; }
    public List<TimeEntry> TimeEntries { get; set; } = new();

    // Calcula o custo total gasto por esta alocação baseada nos apontamentos
    public decimal GetTotalCost()
    {
        return TimeEntries.Sum(te => te.Hours) * HourlyCost;
    }
}
