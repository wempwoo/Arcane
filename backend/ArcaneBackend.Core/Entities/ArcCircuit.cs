namespace ArcaneBackend.Core.Entities;

/// <summary>
/// 魔導機に搭載される魔法発動のための回路システム。
/// 探索中に新しい回路を入手することで、より多様な戦術が可能になります。
/// </summary>
public class ArcCircuit
{
    /// <summary>
    /// 魔導回路のID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 魔導回路の名前
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 魔導回路の説明
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// 宝珠から宝珠へと魔力が伝わる速度（ミリ秒単位）。
    /// 各宝珠の起動間隔を決定する要素です。
    /// </summary>
    public int ManaTransferRate { get; set; }

    /// <summary>
    /// 作成日時
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 更新日時
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// 回路の開始スロットのID
    /// </summary>
    public Guid StartSlotId { get; set; }

    /// <summary>
    /// 回路の開始スロット。
    /// ここから魔力が流れ始め、接続された次のスロットへと伝播していきます。
    /// </summary>
    public ArcOrbSlot StartSlot { get; set; } = null!;

    /// <summary>
    /// この回路を装備している魔導機のID。
    /// nullの場合は未装備状態を表します。
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// この回路を装備している魔導機。
    /// 魔導回路は最大で1つの魔導機に装備可能です。
    /// </summary>
    public ArcMachine? Machine { get; set; }
}