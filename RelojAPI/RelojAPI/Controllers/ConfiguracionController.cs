using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ConfiguracionController> _logger;

        public ConfiguracionController(AppDbContext context, ILogger<ConfiguracionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/configuracion - devuelve la configuración del sitio (la crea con valores por defecto si no existe)
        [HttpGet]
        public async Task<ActionResult<SiteConfig>> Get()
        {
            var config = await _context.Configuracion.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new SiteConfig();
                _context.Configuracion.Add(config);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Configuración del sitio creada con valores por defecto");
            }
            return Ok(config);
        }

        // PUT: api/configuracion - actualiza la configuración del sitio
        [HttpPut]
        public async Task<ActionResult<SiteConfig>> Update([FromBody] SiteConfig config)
        {
            _logger.LogInformation("PUT /api/configuracion - Actualizando configuración del sitio");

            var existing = await _context.Configuracion.FirstOrDefaultAsync();
            if (existing == null)
            {
                existing = new SiteConfig();
                _context.Configuracion.Add(existing);
            }

            existing.SitioNombre = config.SitioNombre;
            existing.SitioSubtitulo = config.SitioSubtitulo;
            existing.LogoUrl = config.LogoUrl;
            existing.HeroTitulo = config.HeroTitulo;
            existing.HeroSubtitulo = config.HeroSubtitulo;
            existing.FooterTagline = config.FooterTagline;
            existing.FooterCopyright = config.FooterCopyright;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Configuración del sitio actualizada");
            return Ok(existing);
        }
    }
}
