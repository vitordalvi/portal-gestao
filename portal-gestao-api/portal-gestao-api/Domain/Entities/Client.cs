namespace portal_gestao_api.Domain.Entities;

public class Client
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string Segment { get; set; } = string.Empty;

    // Navigations
    public List<Project> Projects { get; set; } = new();
}
