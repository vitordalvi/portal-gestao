namespace portal_gestao_api.Application.DTOs;

public class CreateAllocationDto
{
    public Guid UserId { get; set; }
    public int AllocatedHours { get; set; }
    public decimal HourlyCost { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
