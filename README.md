# Dominican Watch Men — Catálogo de Relojes

Proyecto de la asignatura **INF-387 Electiva II – Programación Web II** (UNPHU).
Tienda y administración de relojes: un **Web API** en ASP.NET Core que alimenta
**varios frentes** (React y Blazor).

## Estructura del repositorio

| Proyecto | Tecnología | Descripción |
|----------|------------|-------------|
| **RelojAPI** | ASP.NET Core + EF Core + SQL Server | Web API REST (backend). Expone endpoints de relojes, marcas, usuarios, pedidos, tickets, carga de imágenes, etc. Es la única capa que habla con la base de datos. |
| **dwm-react** | React 18 + Vite | Front-end en React **organizado por carpetas** (componentes, páginas, hooks, utils y capa de servicios). Consume el API. **Frente principal.** |
| **Proyecto relojes** | React 18 + Babel (CDN) | Versión anterior del mismo front en un **único `index.html`** (sin build). Se conserva como referencia. |
| **RelojBlazor** | Blazor Server (Razor) | Otro front que consume el mismo API. Catálogo, marcas, login y panel de administración. |

> Todos los frentes consumen **el mismo `RelojAPI`** y muestran la misma
> información porque comparten backend y base de datos.

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
