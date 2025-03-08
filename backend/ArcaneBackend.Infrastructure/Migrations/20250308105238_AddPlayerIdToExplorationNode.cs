using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ArcaneBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerIdToExplorationNode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExplorationNodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Lane = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Visited = table.Column<bool>(type: "boolean", nullable: false),
                    ExplorationMapId = table.Column<string>(type: "text", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExplorationNodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DeviceType = table.Column<int>(type: "integer", nullable: false),
                    Nickname = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExplorationPathways",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FromNodeId = table.Column<int>(type: "integer", nullable: false),
                    ToNodeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExplorationPathways", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExplorationPathways_ExplorationNodes_FromNodeId",
                        column: x => x.FromNodeId,
                        principalTable: "ExplorationNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExplorationPathways_ExplorationNodes_ToNodeId",
                        column: x => x.ToNodeId,
                        principalTable: "ExplorationNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ArcMachines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MaxHp = table.Column<int>(type: "integer", nullable: false),
                    ManaCapacity = table.Column<int>(type: "integer", nullable: false),
                    ManaGenerationRate = table.Column<int>(type: "integer", nullable: false),
                    CurrentHp = table.Column<int>(type: "integer", nullable: false),
                    CurrentMana = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    EquippedCircuitId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArcMachines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArcMachines_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArcCircuits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ManaTransferRate = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MachineId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArcCircuits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArcCircuits_ArcMachines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "ArcMachines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ArcOrbSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsStartPoint = table.Column<bool>(type: "boolean", nullable: false),
                    CircuitId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrbId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArcOrbSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArcOrbSlots_ArcCircuits_CircuitId",
                        column: x => x.CircuitId,
                        principalTable: "ArcCircuits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArcOrbs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ManaCost = table.Column<int>(type: "integer", nullable: false),
                    CastTime = table.Column<int>(type: "integer", nullable: false),
                    Power = table.Column<int>(type: "integer", nullable: false),
                    Range = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SlotId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArcOrbs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArcOrbs_ArcOrbSlots_SlotId",
                        column: x => x.SlotId,
                        principalTable: "ArcOrbSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SlotConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    NextSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    CircuitId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SlotConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SlotConnections_ArcCircuits_CircuitId",
                        column: x => x.CircuitId,
                        principalTable: "ArcCircuits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SlotConnections_ArcOrbSlots_CurrentSlotId",
                        column: x => x.CurrentSlotId,
                        principalTable: "ArcOrbSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SlotConnections_ArcOrbSlots_NextSlotId",
                        column: x => x.NextSlotId,
                        principalTable: "ArcOrbSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArcCircuits_MachineId",
                table: "ArcCircuits",
                column: "MachineId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArcMachines_PlayerId",
                table: "ArcMachines",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_ArcOrbs_SlotId",
                table: "ArcOrbs",
                column: "SlotId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArcOrbSlots_CircuitId_IsStartPoint",
                table: "ArcOrbSlots",
                columns: new[] { "CircuitId", "IsStartPoint" },
                unique: true,
                filter: "\"IsStartPoint\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_ExplorationPathways_FromNodeId",
                table: "ExplorationPathways",
                column: "FromNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ExplorationPathways_ToNodeId",
                table: "ExplorationPathways",
                column: "ToNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_players_DeviceId",
                table: "players",
                column: "DeviceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SlotConnections_CircuitId",
                table: "SlotConnections",
                column: "CircuitId");

            migrationBuilder.CreateIndex(
                name: "IX_SlotConnections_CurrentSlotId_Order",
                table: "SlotConnections",
                columns: new[] { "CurrentSlotId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SlotConnections_NextSlotId",
                table: "SlotConnections",
                column: "NextSlotId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArcOrbs");

            migrationBuilder.DropTable(
                name: "ExplorationPathways");

            migrationBuilder.DropTable(
                name: "SlotConnections");

            migrationBuilder.DropTable(
                name: "ExplorationNodes");

            migrationBuilder.DropTable(
                name: "ArcOrbSlots");

            migrationBuilder.DropTable(
                name: "ArcCircuits");

            migrationBuilder.DropTable(
                name: "ArcMachines");

            migrationBuilder.DropTable(
                name: "players");
        }
    }
}
