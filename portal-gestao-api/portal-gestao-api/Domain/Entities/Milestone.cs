namespace portal_gestao_api.Domain.Entities;

public class Milestone
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Weight { get; set; }
    public bool IsCompleted { get; set; }

    public Project? Project { get; set; }
}
