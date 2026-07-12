using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelojAPI.Migrations
{
    /// <inheritdoc />
    public partial class ComponenteInventarioBOM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Variantes");

            migrationBuilder.AddColumn<int>(
                name: "Stock",
                table: "TiposPulsera",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Stock",
                table: "Movimientos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "RelojMovimiento",
                columns: table => new
                {
                    MovimientosCompatiblesId = table.Column<int>(type: "int", nullable: false),
                    RelojesCompatiblesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelojMovimiento", x => new { x.MovimientosCompatiblesId, x.RelojesCompatiblesId });
                    table.ForeignKey(
                        name: "FK_RelojMovimiento_Movimientos_MovimientosCompatiblesId",
                        column: x => x.MovimientosCompatiblesId,
                        principalTable: "Movimientos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelojMovimiento_Relojes_RelojesCompatiblesId",
                        column: x => x.RelojesCompatiblesId,
                        principalTable: "Relojes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RelojTipoPulsera",
                columns: table => new
                {
                    PulserasCompatiblesId = table.Column<int>(type: "int", nullable: false),
                    RelojesCompatiblesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelojTipoPulsera", x => new { x.PulserasCompatiblesId, x.RelojesCompatiblesId });
                    table.ForeignKey(
                        name: "FK_RelojTipoPulsera_Relojes_RelojesCompatiblesId",
                        column: x => x.RelojesCompatiblesId,
                        principalTable: "Relojes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelojTipoPulsera_TiposPulsera_PulserasCompatiblesId",
                        column: x => x.PulserasCompatiblesId,
                        principalTable: "TiposPulsera",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RelojMovimiento_RelojesCompatiblesId",
                table: "RelojMovimiento",
                column: "RelojesCompatiblesId");

            migrationBuilder.CreateIndex(
                name: "IX_RelojTipoPulsera_RelojesCompatiblesId",
                table: "RelojTipoPulsera",
                column: "RelojesCompatiblesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RelojMovimiento");

            migrationBuilder.DropTable(
                name: "RelojTipoPulsera");

            migrationBuilder.DropColumn(
                name: "Stock",
                table: "TiposPulsera");

            migrationBuilder.DropColumn(
                name: "Stock",
                table: "Movimientos");

            migrationBuilder.CreateTable(
                name: "Variantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MovimientoId = table.Column<int>(type: "int", nullable: false),
                    RelojId = table.Column<int>(type: "int", nullable: false),
                    TipoPulseraId = table.Column<int>(type: "int", nullable: false),
                    Precio = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Variantes_Movimientos_MovimientoId",
                        column: x => x.MovimientoId,
                        principalTable: "Movimientos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Variantes_Relojes_RelojId",
                        column: x => x.RelojId,
                        principalTable: "Relojes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Variantes_TiposPulsera_TipoPulseraId",
                        column: x => x.TipoPulseraId,
                        principalTable: "TiposPulsera",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_MovimientoId",
                table: "Variantes",
                column: "MovimientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_RelojId",
                table: "Variantes",
                column: "RelojId");

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_TipoPulseraId",
                table: "Variantes",
                column: "TipoPulseraId");
        }
    }
}
