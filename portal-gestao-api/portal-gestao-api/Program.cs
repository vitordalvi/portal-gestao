using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Infrastructure.Data;
using portal_gestao_api.Domain.Interfaces;
using portal_gestao_api.Infrastructure.Repositories;
using portal_gestao_api.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var connectionString = "Server=localhost,1433;Database=PortalGestaoDb;User Id=sa;Password=PortalGestao@2024;TrustServerCertificate=True;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Dependency Injection - Clean Architecture / Domain & Application Services
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITimeEntryRepository, TimeEntryRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITimeEntryService, TimeEntryService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        _ = context.Clients.Any();
    }
    catch
    {
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();