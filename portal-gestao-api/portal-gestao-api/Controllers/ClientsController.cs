using Microsoft.AspNetCore.Mvc;
using portal_gestao_api.Domain.Interfaces;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientRepository _clientRepository;

    public ClientsController(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _clientRepository.GetAllAsync();
        return Ok(clients);
    }
}
