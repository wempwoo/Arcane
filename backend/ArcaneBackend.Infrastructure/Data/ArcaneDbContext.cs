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
        // 同じアセンブリ内のすべてのEntityTypeConfigurationを適用
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ArcaneDbContext).Assembly);
    }
}