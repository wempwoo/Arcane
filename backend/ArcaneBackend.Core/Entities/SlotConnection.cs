namespace ArcaneBackend.Core.Entities;

/// <summary>
/// 魔導回路上のスロット間の接続を表す中間エンティティです。
/// 魔力の伝達経路と、分岐時の処理順序を定義します。
/// </summary>
public class SlotConnection
{
    /// <summary>
    /// 接続のID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 魔力の伝達元となるスロットのID
    /// </summary>
    public Guid CurrentSlotId { get; set; }

    /// <summary>
    /// 魔力の伝達元となるスロット
    /// </summary>
    public ArcOrbSlot CurrentSlot { get; set; } = null!;

    /// <summary>
    /// 魔力の伝達先となるスロットのID
    /// </summary>
    public Guid NextSlotId { get; set; }

    /// <summary>
    /// 魔力の伝達先となるスロット
    /// </summary>
    public ArcOrbSlot NextSlot { get; set; } = null!;

    /// <summary>
    /// 分岐時の処理順序（0から開始）。
    /// 同じCurrentSlotから複数のNextSlotへの接続がある場合、
    /// この値の順序で並列処理が開始されます。
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// この接続が属する魔導回路のID
    /// </summary>
    public Guid CircuitId { get; set; }

    /// <summary>
    /// この接続が属する魔導回路
    /// </summary>
    public ArcCircuit Circuit { get; set; } = null!;
}