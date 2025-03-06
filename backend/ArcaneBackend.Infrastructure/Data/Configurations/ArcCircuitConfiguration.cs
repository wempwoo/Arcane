using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

public class ArcCircuitConfiguration : IEntityTypeConfiguration<ArcCircuit>
{
    public void Configure(EntityTypeBuilder<ArcCircuit> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.Description)
            .HasMaxLength(500);
            
        builder.Property(e => e.ManaTransferRate)
            .IsRequired();
            
        // スロットとの関連（1:多）
        builder.HasMany(e => e.Slots)
            .WithOne(e => e.Circuit)
            .HasForeignKey(e => e.CircuitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 装備している魔導機との関連（オプショナル、1:1）
        builder.HasOne(e => e.Machine)
            .WithOne(e => e.EquippedCircuit)
            .HasForeignKey<ArcCircuit>(e => e.MachineId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // タイムスタンプ
        builder.Property(e => e.CreatedAt)
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .IsRequired();
    }
}