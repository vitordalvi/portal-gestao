using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }
}
