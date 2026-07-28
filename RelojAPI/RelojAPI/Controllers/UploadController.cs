using Microsoft.AspNetCore.Mvc;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        // POST: api/upload
        [HttpPost]
        public async Task<ActionResult> SubirImagen(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest(new { mensaje = "No se recibió ningún archivo" });

            // Limite de tamaño: evita subidas enormes que llenen el disco (DoS).
            const long maxBytes = 5 * 1024 * 1024; // 5 MB
            if (archivo.Length > maxBytes)
                return BadRequest(new { mensaje = "La imagen no puede superar los 5 MB" });

            var extensionesPermitidas = new[] { ".png", ".jpg", ".jpeg", ".webp" };
            var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
            if (!extensionesPermitidas.Contains(extension))
                return BadRequest(new { mensaje = "Solo se permiten imágenes PNG, JPG o WEBP" });

            // Verifica que el tipo declarado sea imagen (defensa extra contra archivos disfrazados).
            if (string.IsNullOrEmpty(archivo.ContentType) ||
                !archivo.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { mensaje = "El archivo no es una imagen válida" });

            var carpeta = Path.Combine(_env.WebRootPath ?? "wwwroot", "images");
            Directory.CreateDirectory(carpeta);

            var nombreArchivo = Guid.NewGuid().ToString() + extension;
            var rutaCompleta = Path.Combine(carpeta, nombreArchivo);

            using var stream = new FileStream(rutaCompleta, FileMode.Create);
            await archivo.CopyToAsync(stream);

            var url = $"{Request.Scheme}://{Request.Host}/images/{nombreArchivo}";
            _logger.LogInformation("Imagen subida: {Url}", url);

            return Ok(new { url });
        }
    }
}
