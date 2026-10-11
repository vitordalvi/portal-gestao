using Microsoft.AspNetCore.Mvc;
using portal_gestao_api.Domain.Interfaces;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        return Ok(users);
    }
}
