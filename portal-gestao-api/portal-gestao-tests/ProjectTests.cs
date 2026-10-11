using portal_gestao_api.Domain.Entities;
using Xunit;

namespace portal_gestao_tests;

public class ProjectTests
{
    [Fact]
    public void GetHealthStatus_WhenConsumptionIsLessThanPhysicalProgress_ReturnsSaudavel()
    {
        // Arrange
        var project = new Project
        {
            Id = Guid.NewGuid(),
            SoldHours = 100,
            EndDate = DateTime.UtcNow.AddMonths(1)
        };

        var allocation = new Allocation { Id = Guid.NewGuid(), HourlyCost = 100 };
        project.Allocations.Add(allocation);
        
        // 40 horas trabalhadas (40% de consumo)
        allocation.TimeEntries.Add(new TimeEntry { Hours = 40 });

        // 50% de avanço físico
        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = true });
        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = false });

        // Act
        var health = project.GetHealthStatus();

        // Assert
        Assert.Equal("Saudável", health);
    }

    [Fact]
    public void GetHealthStatus_WhenConsumptionIsMoreThan15PercentAheadOfPhysicalProgress_ReturnsAtencao()
    {
        // Arrange
        var project = new Project
        {
            Id = Guid.NewGuid(),
            SoldHours = 100,
            EndDate = DateTime.UtcNow.AddMonths(1)
        };

        var allocation = new Allocation { Id = Guid.NewGuid(), HourlyCost = 100 };
        project.Allocations.Add(allocation);
        
        // 70 horas trabalhadas (70% de consumo)
        allocation.TimeEntries.Add(new TimeEntry { Hours = 70 });

        // 50% de avanço físico
        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = true });
        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = false });

        // Act
        var health = project.GetHealthStatus();

        // Assert
        // 70% de consumo > 50% (avanço) + 15% (limite) = 65%. Retorna Atenção.
        Assert.Equal("Atenção", health);
    }

    [Fact]
    public void GetFinancialMargin_ShouldCalculateCorrectlyBasedOnHourlyCost()
    {
        // Arrange
        var project = new Project
        {
            Id = Guid.NewGuid(),
            TotalValue = 10000m // Projeto vendido por R$ 10.000
        };

        var devAllocation = new Allocation { HourlyCost = 50m };
        var qaAllocation = new Allocation { HourlyCost = 30m };

        devAllocation.TimeEntries.Add(new TimeEntry { Hours = 100m }); // Custo Dev = 100 * 50 = R$ 5.000
        qaAllocation.TimeEntries.Add(new TimeEntry { Hours = 50m });   // Custo QA = 50 * 30 = R$ 1.500

        project.Allocations.Add(devAllocation);
        project.Allocations.Add(qaAllocation);

        // Act
        var margin = project.GetFinancialMargin();

        // Assert
        // Custo total = 6.500. Margem = 10.000 - 6.500 = 3.500.
        Assert.Equal(3500m, margin);
    }

    /// <summary>
    /// Valida que projetos em conformidade (sem estouro, sem atraso e ritmo saudável)
    /// não geram nenhum motivo de alerta.
    /// </summary>
    [Fact]
    public void GetHealthReasons_WhenHealthy_ReturnsEmptyList()
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            SoldHours = 100,
            EndDate = DateTime.UtcNow.AddMonths(1)
        };

        var reasons = project.GetHealthReasons();

        Assert.Empty(reasons);
    }

    /// <summary>
    /// Valida que projeto com descompasso de ritmo e consumo preventivo alto (>= 80%)
    /// gera os motivos explicativos correspondentes.
    /// </summary>
    [Fact]
    public void GetHealthReasons_WhenAttentionDueToPaceAndHighConsumption_ReturnsExpectedReasons()
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            SoldHours = 100,
            EndDate = DateTime.UtcNow.AddMonths(1)
        };

        var allocation = new Allocation { HourlyCost = 100 };
        project.Allocations.Add(allocation);
        allocation.TimeEntries.Add(new TimeEntry { Hours = 85 });

        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = true });
        project.Milestones.Add(new Milestone { Weight = 50, IsCompleted = false });

        var reasons = project.GetHealthReasons();

        Assert.Contains(reasons, r => r.Contains("Descompasso entre consumo e entrega"));
        Assert.Contains(reasons, r => r.Contains("ultrapassando o limiar de alerta preventivo (80%)"));
    }

    /// <summary>
    /// Valida que estouro de horas (>100%) e vencimento de prazo contratual geram alertas de criticidade.
    /// </summary>
    [Fact]
    public void GetHealthReasons_WhenCriticalDueToOverrunAndExpiredDate_ReturnsCriticalReasons()
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            SoldHours = 100,
            EndDate = DateTime.UtcNow.AddDays(-2)
        };

        var allocation = new Allocation { HourlyCost = 100 };
        project.Allocations.Add(allocation);
        allocation.TimeEntries.Add(new TimeEntry { Hours = 120 });

        project.Milestones.Add(new Milestone { Weight = 100, IsCompleted = false });

        var reasons = project.GetHealthReasons();

        Assert.Contains(reasons, r => r.Contains("Horas contratadas estouradas"));
        Assert.Contains(reasons, r => r.Contains("Prazo contratual expirado"));
    }

    /// <summary>
    /// Valida que a edição de peso ou a remoção de um marco de entrega
    /// recalcula o percentual de avanço físico proporcionalmente.
    /// </summary>
    [Fact]
    public void GetPhysicalProgress_WhenMilestoneIsRemovedOrUpdated_RecalculatesAccurately()
    {
        var project = new Project();
        var m1 = new Milestone { Weight = 30, IsCompleted = true };
        var m2 = new Milestone { Weight = 70, IsCompleted = false };
        project.Milestones.Add(m1);
        project.Milestones.Add(m2);

        // Inicial: 30% concluído
        Assert.Equal(30m, project.GetPhysicalProgress());

        // Atualiza peso do marco 1 para 50 e do marco 2 para 50
        m1.Weight = 50;
        m2.Weight = 50;
        Assert.Equal(50m, project.GetPhysicalProgress());

        // Remove marco 2: resta apenas o marco 1 (concluído)
        project.Milestones.Remove(m2);
        Assert.Equal(100m, project.GetPhysicalProgress());
    }

    /// <summary>
    /// Valida que o ajuste da taxa horária do consultor reflete diretamente
    /// no custo realizado e na margem financeira do projeto.
    /// </summary>
    [Fact]
    public void UpdateAllocationHourlyCost_RecalculatesRealizedCostAndFinancialMargin()
    {
        // Arrange
        var project = new Project
        {
            Id = Guid.NewGuid(),
            TotalValue = 20000m
        };

        var allocation = new Allocation
        {
            Id = Guid.NewGuid(),
            HourlyCost = 100m,
            AllocatedHours = 80
        };
        allocation.TimeEntries.Add(new TimeEntry { Hours = 50m }); // 50h * R$100 = R$5.000
        project.Allocations.Add(allocation);

        Assert.Equal(5000m, project.GetRealizedCost());
        Assert.Equal(15000m, project.GetFinancialMargin());

        // Act: Coordenador atualiza o valor da hora do analista para R$ 150
        allocation.HourlyCost = 150m;

        // Assert: 50h * R$150 = R$7.500, Margem = 20.000 - 7.500 = R$12.500
        Assert.Equal(7500m, project.GetRealizedCost());
        Assert.Equal(12500m, project.GetFinancialMargin());
    }

    /// <summary>
    /// Valida que uma alocação sem apontamentos de horas pode ser removida do projeto sem violar integridade.
    /// </summary>
    [Fact]
    public void RemoveAllocation_WhenNoTimeEntries_RemovesFromProjectSuccessfully()
    {
        // Arrange
        var project = new Project
        {
            Id = Guid.NewGuid(),
            TotalValue = 10000m
        };

        var allocation = new Allocation
        {
            Id = Guid.NewGuid(),
            HourlyCost = 120m,
            AllocatedHours = 40
        };
        project.Allocations.Add(allocation);
        Assert.Single(project.Allocations);

        // Act
        project.Allocations.Remove(allocation);

        // Assert
        Assert.Empty(project.Allocations);
        Assert.Equal(0m, project.GetRealizedCost());
    }
}

