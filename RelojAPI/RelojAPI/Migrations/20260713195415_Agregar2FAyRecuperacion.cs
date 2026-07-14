using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelojAPI.Migrations
{
    /// <inheritdoc />
    public partial class Agregar2FAyRecuperacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CodigoExpira",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DobleFactor",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CodigoExpira",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DobleFactor",
                table: "Usuarios");
        }
    }
}
