using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

public class ArcOrbConfiguration : IEntityTypeConfiguration<ArcOrb>
{
    public void Configure(EntityTypeBuilder<ArcOrb> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.Description)
            .HasMaxLength(500);
            
        // 性能値（必須）
        builder.Property(e => e.ManaCost)
            .IsRequired();
            
        builder.Property(e => e.CastTime)
            .IsRequired();
            
        builder.Property(e => e.Power)
            .IsRequired();
            
        builder.Property(e => e.Range)
            .IsRequired();
            
        // スロットとの関連（オプショナル、1:1）
        builder.HasOne(e => e.Slot)
            .WithOne(e => e.Orb)
            .HasForeignKey<ArcOrb>(e => e.SlotId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // タイムスタンプ
        builder.Property(e => e.CreatedAt)
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .IsRequired();
    }
}