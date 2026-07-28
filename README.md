# Dominican Watch Men — Catálogo de Relojes

Proyecto de la asignatura **INF-387 Electiva II – Programación Web II** (UNPHU).
Tienda y administración de relojes: un **Web API** en ASP.NET Core que alimenta
**varios frentes**.

> **⚠️ IMPORTANTE — ESTA ENTREGA ES EL FRENTE EN _RAZOR PAGES_ (`RelojRazor`).**
>
> **LO DE REACT (`dwm-react`, `Proyecto relojes`) Y BLAZOR (`RelojBlazor`) ES DEL
> PROYECTO ANTERIOR Y NO TIENE NADA QUE VER CON ESTA ENTREGA NUEVA DE RAZOR. SE
> CONSERVAN EN EL REPOSITORIO SOLO COMO REFERENCIA / HISTORIAL.**

## Estructura del repositorio

| Proyecto | Tecnología | Descripción |
|----------|------------|-------------|
| **RelojAPI** | ASP.NET Core + EF Core + SQL Server | Web API REST (backend). Expone endpoints de relojes, marcas, usuarios, pedidos, tickets, carga de imágenes, etc. Es la única capa que habla con la base de datos. |
| **dwm-react** | React 18 + Vite | Front-end en React **organizado por carpetas** (componentes, páginas, hooks, utils y capa de servicios). Consume el API. **Frente principal.** |
| **Proyecto relojes** | React 18 + Babel (CDN) | Versión anterior del mismo front en un **único `index.html`** (sin build). Se conserva como referencia. |
| **RelojBlazor** | Blazor Server (Razor) | Otro front que consume el mismo API. Catálogo, marcas, login y panel de administración. |
| **RelojRazor** | ASP.NET Core **Razor Pages** | Front en Razor Pages (sin React ni Blazor). Landing page + catálogo, marcas, administración y contacto. Consume el mismo API mediante una clase de servicios inyectada. |

> Todos los frentes consumen **el mismo `RelojAPI`** y muestran la misma
> información porque comparten backend y base de datos.

### Versionado y respaldo del proyecto anterior

Antes de incorporar el frente **Razor Pages** (`RelojRazor`) se dejó un respaldo
inmutable del estado anterior del proyecto, en el **mismo repositorio**:

| Referencia | Qué contiene |
|------------|--------------|
| Rama `main` | Versión **al día** del proyecto (incluye ya el frente `RelojRazor`). |
| Rama `backup-proyecto-anterior` | Copia congelada del proyecto **antes** de agregar Razor (solo API, React y Blazor). |
| Etiqueta (tag) `v1-antes-razor` | Foto inmutable del **mismo** estado anterior (visible en *Tags/Releases*). |

La rama de respaldo y la etiqueta apuntan al mismo commit y **no cambian**: `main`
avanza con el trabajo nuevo sin afectar el respaldo. Para revisar el proyecto
anterior basta con `git checkout v1-antes-razor` (o abrir la rama/tag en GitHub).

## Tecnologías

- .NET 9 / ASP.NET Core · Entity Framework Core (migraciones incluidas) · SQL Server
- React 18 (JSX) · Vite · Blazor Server

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

### 2) Front-end React (dwm-react) — recomendado

Desde `dwm-react`:

```bash
npm install     # instala dependencias (crea node_modules; no está en el repo)
npm run dev     # servidor de desarrollo en http://localhost:8080
npm run build   # compila a /dist para producción
```

### 3) Front-end React de un solo archivo (alternativa sin build)

```bash
python -m http.server 8080 --directory "Proyecto relojes"
# abrir http://localhost:8080
```

### 4) Front-end Blazor (alternativa)

Desde `RelojBlazor`:

```bash
dotnet run      # http://localhost:5126
```

### 5) Front-end Razor Pages (RelojRazor)

Desde `RelojRazor` (requiere el `RelojAPI` corriendo en `http://localhost:5157`):

```bash
dotnet run      # http://localhost:5173
```

Estructura y cumplimiento de requisitos (asignación Razor Pages):

- **Landing page** (`Pages/Index.cshtml`) + páginas adicionales: `Catalogo`, `Marcas`,
  `Detalle`, `Carrito`, `Admin` y `Contacto`.
- **Sintaxis Razor** en todos los `.cshtml`; propiedades del `.cshtml.cs` → `.cshtml`
  (p. ej. `Model.Destacados`) y del `.cshtml` → `.cshtml.cs` (formularios con
  `[BindProperty]` en `Admin`, `Contacto` y `Detalle`, búsqueda en `Catalogo`).
- **Header, footer y barra de navegación** personalizados en `Pages/Shared/_Layout.cshtml`
  (incluye el enlace al carrito con contador de artículos).
- **Elementos estáticos** en `wwwroot/` (CSS `dwm.css`/`site.css`, JS `site.js`, imágenes).
- **JavaScript**: la página `Contacto` invoca funciones de `wwwroot/js/site.js`
  (cotizador, contador de caracteres y validación); la página `Detalle` usa
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
  pedido. `Pages/Carrito.cshtml` lista las líneas con subtotal/total y permite **quitar** o
  **vaciar**. El botón **Editar** de las tarjetas del catálogo sigue visible solo para el rol
  `Admin`.

---

## Estructura del front-end React (`dwm-react`)

```
dwm-react/
├── index.html                 # shell mínimo (<div id="root">)
├── vite.config.js
├── package.json
├── .env.development           # VITE_API_URL para desarrollo (localhost:5157)
├── .env.production            # VITE_API_URL para producción
├── .env.example              # plantilla
└── src/
    ├── main.jsx               # punto de entrada
    ├── App.jsx                # arma la app + ruteo por hash
    ├── config/
    │   └── api.js             # lee la URL del API desde el .env
    ├── services/
    │   └── api.js             # TODAS las llamadas al backend (fetch)
    ├── hooks/
    │   └── useHashRoute.js
    ├── utils/                 # getImageUrl, tarjeta, validarPassword, estados
    ├── components/            # componentes reutilizables (Nav, Hero, Contador…)
    │   └── admin/             # modales del panel de administración
    ├── pages/                 # páginas (Checkout, Perfil, Admin, Taller, Soporte…)
    └── styles/
        └── index.css
```

### Configuración de la URL del API (buena práctica)

La URL del API **no está quemada** en el código: se lee de una variable de
entorno según el entorno de ejecución.

- `.env.development` → `VITE_API_URL=http://localhost:5157` (con `npm run dev`)
- `.env.production` → URL del servidor real (con `npm run build`)

`src/config/api.js` la lee con `import.meta.env.VITE_API_URL`. Solo van ahí
valores **no secretos** (una URL); los secretos reales viven en el backend.

> **Nota para evaluación:** normalmente el archivo `.env` **no se sube** al repo
> (está en `.gitignore`); se conservan versionados `.env.development`,
> `.env.production` y `.env.example`. Para esta entrega se subió también el
> `.env` local **únicamente con fines de evaluación**, para que se pueda revisar
> la configuración. Solo contiene la URL del API, sin secretos.

---

## Integrantes

- Roberto R. Sánchez Gutiérrez · 24-0177
- Axel Santana · 23-1568

Facilitadora: Ing. Johanna Elisa Rodríguez Ricardo
