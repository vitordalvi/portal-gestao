namespace portal_gestao_api.Application.DTOs;

public class CreateTimeEntryDto
{
    public Guid ProjectId { get; set; }
    
    // Em um ambiente de produção real com autenticação (Identity/Keycloak),
    // esse UserId não precisaria vir no payload, ele seria extraído do Token JWT.
    // Ex: var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
    public Guid UserId { get; set; } 

    public DateTime Date { get; set; }
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
}
