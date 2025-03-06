namespace ArcaneBackend.Core.Entities;

/// <summary>
/// 魔導機は戦闘シーンにおける実際の戦闘ユニットです。
/// マナを生成・蓄積し、装備した魔導回路を通じて魔法を発動します。
/// </summary>
public class ArcMachine
{
    /// <summary>
    /// 魔導機のID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 魔導機の名前
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 魔導機の説明
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// 最大HP（ヒットポイント）。
    /// ユニットの耐久値であり、0になると撃破されます。
    /// </summary>
    public int MaxHp { get; set; }

    /// <summary>
    /// マナ容量。魔導機が蓄積できるマナの最大量です。
    /// 戦闘開始時は満タンの状態でスタートし、個々の宝珠の消費マナ量がこの値を超える場合は使用できません。
    /// </summary>
    public int ManaCapacity { get; set; } = 100;

    /// <summary>
    /// マナ生成力。単位時間（秒）あたりのマナ生成量です。
    /// 常時一定速度でマナを生成し続け、マナ容量を上限として蓄積されます。
    /// </summary>
    public int ManaGenerationRate { get; set; } = 5;

    /// <summary>
    /// 現在のHP
    /// </summary>
    public int CurrentHp { get; set; }

    /// <summary>
    /// 現在のマナ量
    /// </summary>
    public int CurrentMana { get; set; }

    /// <summary>
    /// 作成日時
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 更新日時
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// 所有プレイヤーのID
    /// </summary>
    public Guid PlayerId { get; set; }

    /// <summary>
    /// 所有プレイヤー
    /// </summary>
    public Player Player { get; set; } = null!;

    /// <summary>
    /// 装備中の魔導回路のID
    /// </summary>
    public Guid EquippedCircuitId { get; set; }

    /// <summary>
    /// 装備中の魔導回路。
    /// 魔導機は常に1つの魔導回路を装備している必要があります。
    /// </summary>
    public ArcCircuit EquippedCircuit { get; set; } = null!;
}