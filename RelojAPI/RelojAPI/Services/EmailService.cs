using System.Net;
using System.Net.Mail;

namespace RelojAPI.Services
{
    public interface IEmailService
    {
        bool Habilitado { get; }
        Task<bool> EnviarAsync(string destino, string asunto, string cuerpo);
    }

    // Envia correos por SMTP si esta configurado (ej. Gmail); si no, corre en modo DEMO (registra el mensaje).
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _cfg;
        private readonly ILogger<EmailService> _log;

        public EmailService(IConfiguration cfg, ILogger<EmailService> log)
        {
            _cfg = cfg;
            _log = log;
        }

        // Habilitado solo si hay usuario y contraseña SMTP configurados (por env/user-secrets, no en el repo)
        public bool Habilitado =>
            !string.IsNullOrWhiteSpace(_cfg["Email:User"]) && !string.IsNullOrWhiteSpace(_cfg["Email:Password"]);

        public async Task<bool> EnviarAsync(string destino, string asunto, string cuerpo)
        {
            if (!Habilitado)
            {
                _log.LogInformation("[EMAIL DEMO] Para: {Destino} | {Asunto} | {Cuerpo}", destino, asunto, cuerpo);
                return false; // no se envio correo real (modo demo)
            }

            try
            {
                var host = _cfg["Email:Host"] ?? "smtp.gmail.com";
                var port = int.TryParse(_cfg["Email:Port"], out var p) ? p : 587;
                var user = _cfg["Email:User"]!;
                var from = string.IsNullOrWhiteSpace(_cfg["Email:From"]) ? user : _cfg["Email:From"]!;

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(user, _cfg["Email:Password"])
                };
                using var msg = new MailMessage(from, destino, asunto, cuerpo) { IsBodyHtml = false };
                await client.SendMailAsync(msg);
                _log.LogInformation("Correo enviado a {Destino}", destino);
                return true;
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Error enviando correo a {Destino}", destino);
                return false;
            }
        }
    }
}
