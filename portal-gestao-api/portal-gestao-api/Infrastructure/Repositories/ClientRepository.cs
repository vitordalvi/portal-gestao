using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Infrastructure.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _context;

    public ClientRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        return await _context.Clients.ToListAsync();
    }
}
