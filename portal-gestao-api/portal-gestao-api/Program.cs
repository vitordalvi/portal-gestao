using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Adicionar lib jwt

var app = builder.Build();

// Adiciona a rota do Swagger
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting(); // Middleware para encaminhar a request pro endpoint

app.UseAuthentication(); // Middleware para identificar o usuário
app.UseAuthorization(); // Middleware para autorizar/revokar acesso ao endpoint

app.MapControllers(); // Middleware para executar o endpoint
// app.UseHttpsRedirection();

app.Run();