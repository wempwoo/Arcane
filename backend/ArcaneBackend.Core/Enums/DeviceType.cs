using System.Text.Json.Serialization;

namespace ArcaneBackend.Core.Enums;

/// <summary>
/// デバイスの種類を表す列挙型
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DeviceType
{
    /// <summary>
    /// Webブラウザ
    /// </summary>
    Web,

    /// <summary>
    /// iOSデバイス
    /// </summary>
    Ios,

    /// <summary>
    /// Androidデバイス
    /// </summary>
    Android
}