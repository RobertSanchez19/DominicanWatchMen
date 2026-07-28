# Dominican Watch Men — Catálogo de Relojes (Razor Pages)

Proyecto de la asignatura **INF-387 Electiva II – Programación Web II** (UNPHU).
Tienda y administración de relojes: un **front-end en ASP.NET Core Razor Pages**
(`RelojRazor`) que consume un **Web API** REST (`RelojAPI`).

> **⚠️ IMPORTANTE — ESTE PROYECTO ES 100% RAZOR PAGES.**
>
> **AQUÍ NO HAY NADA DE REACT NI DE BLAZOR: ESTA ENTREGA SON SOLO EL FRENTE EN
> RAZOR (`RelojRazor`) Y SU API (`RelojAPI`). LA VERSIÓN ANTERIOR (REACT Y BLAZOR)
> QUEDÓ GUARDADA APARTE, EN LA RAMA `backup-proyecto-anterior` Y EL TAG
> `v1-antes-razor`, Y NO FORMA PARTE DE ESTA ENTREGA.**

## Estructura del repositorio

| Proyecto | Tecnología | Descripción |
|----------|------------|-------------|
| **RelojAPI** | ASP.NET Core + EF Core + SQL Server | Web API REST (backend). Expone endpoints de relojes, marcas, usuarios, pedidos, tickets, carga de imágenes, etc. Es la única capa que habla con la base de datos. |
| **RelojRazor** | ASP.NET Core **Razor Pages** | Front en Razor Pages. Landing page + catálogo, detalle/configurador, carrito, marcas, administración y contacto. Consume el `RelojAPI` mediante una clase de servicios inyectada. |

### Versionado y respaldo del proyecto anterior

Este `main` contiene **solo** el proyecto en Razor Pages (`RelojRazor`) y su API.
La versión anterior (que incluía frentes en **React** y **Blazor**) se conservó
congelada en el **mismo repositorio**, para no perder el historial:

| Referencia | Qué contiene |
|------------|--------------|
| Rama `main` | Entrega **actual**: solo Razor Pages (`RelojRazor`) + `RelojAPI`. |
| Rama `backup-proyecto-anterior` | Copia congelada del proyecto anterior (API + React + Blazor). |
| Etiqueta (tag) `v1-antes-razor` | Foto inmutable del mismo estado anterior (visible en *Tags/Releases*). |

La rama de respaldo y la etiqueta **no cambian**. Para revisar el proyecto anterior:
`git checkout v1-antes-razor` (o abrir la rama/tag en GitHub).

## Tecnologías

- .NET 9 / ASP.NET Core · **Razor Pages**
- Entity Framework Core (migraciones incluidas) · SQL Server

---

## Puesta en marcha

### 1) Base de datos + API (backend)

Desde `RelojAPI/RelojAPI`:

```bash
dotnet ef database update   # aplica migraciones (o corre RelojAPI/Scripts/CreateDatabase.sql)
dotnet run                  # levanta el API en http://localhost:5157
```

> La cadena de conexión va en `appsettings.json`. Los datos sensibles (p. ej.
> credenciales de correo para el 2FA) van en **user-secrets**, fuera del repo.

> **Página de Noticias.** `RelojRazor` incluye una página `Noticias` que trae titulares
> de relojería desde **NewsAPI**. La API key **no se versiona**: va en user-secrets del
> proyecto `RelojRazor`:
> ```bash
> cd RelojRazor
> dotnet user-secrets set "News:ApiKey" "TU_API_KEY_DE_NEWSAPI"
> ```
> Sin la key, la página muestra un aviso en vez de las noticias.

### 2) Front-end Razor Pages (RelojRazor)

Desde `RelojRazor` (requiere el `RelojAPI` corriendo en `http://localhost:5157`):

```bash
dotnet run      # http://localhost:5173
```

> También puedes usar los lanzadores `Iniciar DWM Razor.bat` y `Detener DWM Razor.bat`
> en la raíz del repositorio, que levantan/detienen el API y el front juntos.

Estructura y cumplimiento de requisitos (asignación Razor Pages):

- **Landing page** (`Pages/Index.cshtml`) + páginas adicionales: `Catalogo`, `Marcas`,
  `Detalle`, `Carrito`, `Noticias`, `Login`/`Registro`/`Recuperar`/`Restablecer`,
  `MiCuenta`, `Admin`, `Usuarios` y `Contacto`.
- **Sintaxis Razor** en todos los `.cshtml`; propiedades del `.cshtml.cs` → `.cshtml`
  (p. ej. `Model.Destacados`) y del `.cshtml` → `.cshtml.cs` (formularios con
  `[BindProperty]` en `Admin`, `Contacto` y `Detalle`, búsqueda en `Catalogo`).
- **Header, footer y barra de navegación** personalizados en `Pages/Shared/_Layout.cshtml`
  (incluye el enlace al carrito con contador de artículos).
- **Elementos estáticos** en `wwwroot/` (CSS `dwm.css`/`site.css`, JS `site.js`, imágenes).
- **JavaScript**: la página `Contacto` invoca funciones de `wwwroot/js/site.js`
  (contador de caracteres y validación); la página `Detalle` usa
  `dwmConfigurar()` para recalcular precio y disponibilidad **en vivo** al elegir
  máquina/pulsera.
- **`Program.cs` y `appsettings.json`** configurados; la URL del API se lee de
  `ApiSettings:BaseUrl`.
- **Conexión al Web API** mediante la **clase de servicios** `Services/RelojService.cs`
  (interfaz `IRelojService`), registrada por **inyección de dependencias**.
- **Visualización** de datos del API en `Catalogo`, `Marcas` y `Detalle`; **modificación**
  del modelo `Reloj` (crear/editar/eliminar) en `Admin`.

**Detalle del reloj + carrito (configurador ensamble-a-pedido).** Al hacer clic en un reloj
del catálogo se abre `Pages/Detalle.cshtml` (`/Detalle?id=X`), que consume del API los
componentes compatibles de ese reloj (`MovimientosCompatibles` y `PulserasCompatibles`) y
permite elegir **máquina** y **tipo de pulsera** (cada uno con su precio extra y stock),
la cantidad, y **añadir al carrito**.

- El **precio** (base + extra de máquina + extra de pulsera) y la **disponibilidad**
  (mínimo entre el stock de la base, la máquina y la pulsera) se **recalculan siempre en el
  servidor** en el POST; el navegador solo los muestra en vivo por comodidad (no se confía en
  el valor enviado por el cliente).
- El **carrito** vive en la **sesión** del usuario (`ICarritoService`/`Services/CarritoService.cs`,
  con `AddSession`/`UseSession` en `Program.cs`), por ser una selección temporal previa al
  pedido. `Pages/Carrito.cshtml` lista las líneas con **Subtotal + ITBIS (18%) + Total** y
  permite **quitar** o **vaciar**. El botón **Editar** de las tarjetas del catálogo sigue
  visible solo para el rol `Admin`.

---

## Integrantes

- Roberto R. Sánchez Gutiérrez · 24-0177
- Axel Santana · 23-1568

Facilitadora: Ing. Johanna Elisa Rodríguez Ricardo
