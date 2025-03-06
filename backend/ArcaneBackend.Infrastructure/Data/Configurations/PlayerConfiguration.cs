using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ArcaneBackend.Core.Entities;

namespace ArcaneBackend.Infrastructure.Data.Configurations;

/// <summary>
/// Playerエンティティの設定クラス
/// </summary>
public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    /// <summary>
    /// エンティティの設定を行います
    /// </summary>
    /// <param name="builder">エンティティビルダー</param>
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        // テーブル名を小文字で指定
        builder.ToTable("players");

        // 主キーの設定
        builder.HasKey(e => e.Id);

        // DeviceIdのユニーク制約とインデックス
        builder.HasIndex(e => e.DeviceId)
            .IsUnique();

        // プロパティの設定
        builder.Property(e => e.DeviceId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Nickname)
            .HasMaxLength(20);

        // タイムスタンプのデフォルト値設定
        builder.Property(e => e.LastLoginAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}