using ArcaneBackend.Core.Entities;
using ArcaneBackend.Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace ArcaneBackend.Infrastructure.Data;

public class ArcaneDbContext : DbContext
{
    public ArcaneDbContext(DbContextOptions<ArcaneDbContext> options)
        : base(options)
    {
    }

    public DbSet<Player> Players { get; set; } = null!;
    public DbSet<ArcMachine> ArcMachines { get; set; } = null!;
    public DbSet<ArcCircuit> ArcCircuits { get; set; } = null!;
    public DbSet<ArcOrb> ArcOrbs { get; set; } = null!;
    public DbSet<ArcOrbSlot> ArcOrbSlots { get; set; } = null!;
    public DbSet<SlotConnection> SlotConnections { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // エンティティの設定を適用
        modelBuilder.ApplyConfiguration(new PlayerConfiguration());
        modelBuilder.ApplyConfiguration(new ArcMachineConfiguration());
        modelBuilder.ApplyConfiguration(new ArcCircuitConfiguration());
        modelBuilder.ApplyConfiguration(new ArcOrbConfiguration());
        modelBuilder.ApplyConfiguration(new ArcOrbSlotConfiguration());
        modelBuilder.ApplyConfiguration(new SlotConnectionConfiguration());
    }
}