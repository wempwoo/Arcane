using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

public class ArcOrbSlotConfiguration : IEntityTypeConfiguration<ArcOrbSlot>
{
    public void Configure(EntityTypeBuilder<ArcOrbSlot> builder)
    {
        builder.HasKey(e => e.Id);
        
        // IsStartPointプロパティ（必須）
        builder.Property(e => e.IsStartPoint)
            .IsRequired();
            
        // 各回路に1つの開始点のみを許可
        builder.HasIndex(e => new { e.CircuitId, e.IsStartPoint })
            .HasFilter("\"IsStartPoint\" = true")
            .IsUnique();
            
        // 魔導回路との関連（必須）
        builder.HasOne(e => e.Circuit)
            .WithMany(e => e.Slots)
            .HasForeignKey(e => e.CircuitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 宝珠との関連（オプショナル、1:1）
        builder.HasOne(e => e.Orb)
            .WithOne(e => e.Slot)
            .HasForeignKey<ArcOrb>(e => e.SlotId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // 次のスロットへの接続（順序付きコレクション）
        builder.HasMany(e => e.NextConnections)
            .WithOne(e => e.CurrentSlot)
            .HasForeignKey(e => e.CurrentSlotId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}