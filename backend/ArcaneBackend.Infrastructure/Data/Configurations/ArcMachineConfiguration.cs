using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

public class ArcMachineConfiguration : IEntityTypeConfiguration<ArcMachine>
{
    public void Configure(EntityTypeBuilder<ArcMachine> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.Description)
            .HasMaxLength(500);
            
        // 基本性能値（必須）
        builder.Property(e => e.MaxHp)
            .IsRequired();
            
        builder.Property(e => e.ManaCapacity)
            .IsRequired();
            
        builder.Property(e => e.ManaGenerationRate)
            .IsRequired();
            
        // 現在の状態（必須）
        builder.Property(e => e.CurrentHp)
            .IsRequired();
            
        builder.Property(e => e.CurrentMana)
            .IsRequired();
            
        // プレイヤーとの関連（必須）
        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 装備中の魔導回路との関連（必須、1:1）
        builder.HasOne(e => e.EquippedCircuit)
            .WithOne(e => e.Machine)
            .HasForeignKey<ArcMachine>(e => e.EquippedCircuitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
            
        // タイムスタンプ
        builder.Property(e => e.CreatedAt)
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .IsRequired();
    }
}