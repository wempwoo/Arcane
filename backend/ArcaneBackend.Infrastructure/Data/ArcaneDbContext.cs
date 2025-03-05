using Microsoft.EntityFrameworkCore;
using ArcaneBackend.Core.Entities;

namespace ArcaneBackend.Infrastructure.Data;

/// <summary>
/// Arcaneアプリケーションのデータベースコンテキスト
/// </summary>
public class ArcaneDbContext : DbContext
{
    /// <summary>
    /// プレイヤー情報のDbSet
    /// </summary>
    public DbSet<Player> Players => Set<Player>();

    /// <summary>
    /// コンストラクタ
    /// </summary>
    /// <param name="options">DbContextオプション</param>
    public ArcaneDbContext(DbContextOptions<ArcaneDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// モデル構築時の設定
    /// </summary>
    /// <param name="modelBuilder">モデルビルダー</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Player>(entity =>
        {
            // テーブル名を小文字で指定
            entity.ToTable("players");

            entity.HasKey(e => e.Id);

            entity.HasIndex(e => e.DeviceId)
                .IsUnique();

            entity.Property(e => e.DeviceId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Nickname)
                .HasMaxLength(20);

            entity.Property(e => e.LastLoginAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}