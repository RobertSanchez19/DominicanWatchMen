using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelojAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRelojDestacado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Destacado",
                table: "Relojes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Destacado",
                table: "Relojes");
        }
    }
}
