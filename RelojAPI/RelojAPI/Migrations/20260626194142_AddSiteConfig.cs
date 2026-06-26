using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelojAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Configuracion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SitioNombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SitioSubtitulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroTitulo = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    HeroSubtitulo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FooterTagline = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    FooterCopyright = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Configuracion", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Configuracion");
        }
    }
}
