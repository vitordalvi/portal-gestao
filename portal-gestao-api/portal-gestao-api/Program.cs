using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configurando Entity Framework Core (SQL Server)
// String de conexão mockada pra usar com o Docker Compose do case (mssqlserver:2022-latest)
var connectionString = "Server=localhost,1433;Database=PortalGestaoDb;User Id=sa;Password=123456;TrustServerCertificate=True;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

// Garantir que o banco de dados e as tabelas sejam criadas automaticamente na inicialização
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated(); // Cria o banco baseado no Model e insere o Seed Data
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();