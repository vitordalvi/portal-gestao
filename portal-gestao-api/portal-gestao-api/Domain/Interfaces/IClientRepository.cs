using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Domain.Interfaces;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();
}
