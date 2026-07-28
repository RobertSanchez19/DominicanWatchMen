using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace RelojRazor.Pages;

// Pagina de contacto. Demuestra:
//  - Llamado a funciones JavaScript desde la vista.
//  - Envio de propiedades del .cshtml hacia el .cshtml.cs (formulario -> [BindProperty]).
public class ContactoModel : PageModel
{
    private readonly ILogger<ContactoModel> _logger;

    public ContactoModel(ILogger<ContactoModel> logger)
    {
        _logger = logger;
    }

    // El objeto Contacto recibe los valores escritos en el formulario de la vista.
    [BindProperty]
    public ContactoInput Contacto { get; set; } = new();

    // Propiedad que el .cshtml.cs devuelve al .cshtml tras enviar.
    public bool Enviado { get; private set; }

    public void OnGet() { }

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid)
            return Page();

        // En un caso real aqui se enviaria un correo o se guardaria en la BD.
        _logger.LogInformation("Contacto recibido de {Nombre} <{Email}>", Contacto.Nombre, Contacto.Email);
        Enviado = true;
        Contacto = new ContactoInput(); // limpia el formulario
        return Page();
    }

    public class ContactoInput
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "Correo no válido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El mensaje es obligatorio")]
        [MinLength(10, ErrorMessage = "El mensaje debe tener al menos 10 caracteres")]
        public string Mensaje { get; set; } = string.Empty;
    }
}
