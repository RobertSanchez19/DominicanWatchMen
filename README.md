# Dominican Watch Men — Catálogo de Relojes

Proyecto de la asignatura **INF-387 Electiva II – Programación Web II** (UNPHU).
Aplicación de catálogo y administración de relojes construida con ASP.NET Core.

## Estructura

| Proyecto | Descripción |
|----------|-------------|
| **RelojAPI** | Web API REST (ASP.NET Core + Entity Framework Core). Expone endpoints de relojes, marcas, usuarios y carga de imágenes. |
| **RelojBlazor** | Front-end en Blazor (Server) que consume la API. Incluye catálogo, marcas, login y panel de administración. |

## Tecnologías

- .NET 9 / ASP.NET Core
- Blazor Server
- Entity Framework Core (migraciones incluidas)
- SQL Server

## Puesta en marcha

1. **Base de datos** — aplicar las migraciones desde `RelojAPI/RelojAPI`:
   ```bash
   dotnet ef database update
   ```
   (o ejecutar `RelojAPI/Scripts/CreateDatabase.sql`)

2. **API** — desde `RelojAPI/RelojAPI`:
   ```bash
   dotnet run
   ```

3. **Front-end** — desde `RelojBlazor`:
   ```bash
   dotnet run
   ```

> La cadena de conexión y la URL de la API se configuran en los respectivos `appsettings.json`.

## Integrantes

- Roberto R. Sánchez Gutiérrez · 24-0177
- Axel Santana · 23-1568

Facilitadora: Ing. Johanna Elisa Rodríguez Ricardo
