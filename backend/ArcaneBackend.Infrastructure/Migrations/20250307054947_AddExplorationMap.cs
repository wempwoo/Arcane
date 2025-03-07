using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ArcaneBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExplorationMap : Migration
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
                    ExplorationMapId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExplorationNodes", x => x.Id);
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

            migrationBuilder.CreateIndex(
                name: "IX_ExplorationPathways_FromNodeId",
                table: "ExplorationPathways",
                column: "FromNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ExplorationPathways_ToNodeId",
                table: "ExplorationPathways",
                column: "ToNodeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExplorationPathways");

            migrationBuilder.DropTable(
                name: "ExplorationNodes");
        }
    }
}
