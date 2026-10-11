namespace portal_gestao_api.Domain.Entities;

public class TimeEntry
{
    public Guid Id { get; set; }
    public Guid AllocationId { get; set; }
    public DateTime Date { get; set; }
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ErpId { get; set; }

    public Allocation? Allocation { get; set; }
}
