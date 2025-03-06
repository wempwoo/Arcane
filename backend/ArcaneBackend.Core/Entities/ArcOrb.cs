namespace ArcaneBackend.Core.Entities;

/// <summary>
/// 宝珠は魔法の本体となる結晶体です。
/// 1つの宝珠に1種類の魔法が込められており、魔導回路のスロットに装着して使用します。
/// </summary>
public class ArcOrb
{
    /// <summary>
    /// 宝珠のID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 宝珠の名前
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 宝珠の説明
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// 魔法発動に必要なマナ量。
    /// 魔導機のマナ容量を超える場合は使用できません。
    /// </summary>
    public int ManaCost { get; set; }

    /// <summary>
    /// 魔法の発動に必要な時間（ミリ秒単位）。
    /// 回路がこの宝珠に到達したとき、この時間分の待機が必要です。
    /// </summary>
    public int CastTime { get; set; }

    /// <summary>
    /// 魔法攻撃の基本的な強さを表す相対的な数値
    /// </summary>
    public int Power { get; set; }

    /// <summary>
    /// 魔法の有効射程距離。
    /// 短射程で高威力など、特徴的な組み合わせが可能です。
    /// </summary>
    public int Range { get; set; }

    /// <summary>
    /// 作成日時
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 更新日時
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// 装着されているスロットのID。
    /// nullの場合は未装着状態を表します。
    /// </summary>
    public Guid? SlotId { get; set; }

    /// <summary>
    /// 装着されているスロット。
    /// nullの場合は未装着状態を表します。
    /// </summary>
    public ArcOrbSlot? Slot { get; set; }
}