namespace portal_gestao_api.Application.DTOs;

public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public int SoldHours { get; set; }
    public int PlannedHours { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
