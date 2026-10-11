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
}
