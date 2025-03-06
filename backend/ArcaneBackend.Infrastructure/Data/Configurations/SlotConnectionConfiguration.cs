using ArcaneBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

public class SlotConnectionConfiguration : IEntityTypeConfiguration<SlotConnection>
{
    public void Configure(EntityTypeBuilder<SlotConnection> builder)
    {
        builder.HasKey(e => e.Id);
        
        // 開始スロットとの関連（必須）
        builder.HasOne(e => e.CurrentSlot)
            .WithMany(e => e.NextConnections)
            .HasForeignKey(e => e.CurrentSlotId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 次のスロットとの関連（必須）
        builder.HasOne(e => e.NextSlot)
            .WithMany()
            .HasForeignKey(e => e.NextSlotId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 魔導回路との関連（必須）
        builder.HasOne(e => e.Circuit)
            .WithMany()
            .HasForeignKey(e => e.CircuitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
            
        // 順序（必須）
        builder.Property(e => e.Order)
            .IsRequired();
            
        // 同じCurrentSlotIdに対するOrderの一意性を保証
        builder.HasIndex(e => new { e.CurrentSlotId, e.Order })
            .IsUnique();
    }
}