namespace ArcaneBackend.Core.Entities;

/// <summary>
/// 魔導回路上の宝珠を装着するためのスロットです。
/// 魔力は一方向に伝達され、装着された宝珠を順番に起動させていきます。
/// </summary>
public class ArcOrbSlot
{
    /// <summary>
    /// スロットのID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// このスロットが属する魔導回路のID
    /// </summary>
    public Guid CircuitId { get; set; }

    /// <summary>
    /// このスロットが属する魔導回路
    /// </summary>
    public ArcCircuit Circuit { get; set; } = null!;

    /// <summary>
    /// 装着されている宝珠のID
    /// </summary>
    public Guid? OrbId { get; set; }

    /// <summary>
    /// 装着されている宝珠。
    /// nullの場合は何も装着されていない状態を表します。
    /// </summary>
    public ArcOrb? Orb { get; set; }

    /// <summary>
    /// このスロットから魔力が伝達される次のスロットへの接続情報。
    /// 順序付きリストで、分岐時の魔力の流れる順序を定義します。
    /// </summary>
    public IList<SlotConnection> NextConnections { get; set; } = new List<SlotConnection>();
}