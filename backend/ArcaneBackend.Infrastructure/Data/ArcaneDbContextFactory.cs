using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ArcaneBackend.Infrastructure.Data;

public class ArcaneDbContextFactory : IDesignTimeDbContextFactory<ArcaneDbContext>
{
    public ArcaneDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ArcaneDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=arcane_db;Username=arcane;Password=arcane_dev");

        return new ArcaneDbContext(optionsBuilder.Options);
    }
}