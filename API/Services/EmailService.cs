using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using API.Interfaces;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;
        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }
        public async Task SendEmailToAdmin(string errorMessage)
        {
            using var client = new SmtpClient(_smtpSettings.SmtpHost, _smtpSettings.SmtpPort);
            client.Credentials = new NetworkCredential(_smtpSettings.SmtpUserName, _smtpSettings.SmtpPassword);
            client.EnableSsl = _smtpSettings.EnableSSL;

            var mail = new MailMessage
            {
                From = new MailAddress(_smtpSettings.SmtpUserName),
                Subject = "Sistemde Hata Oluştu",
                Body = errorMessage
            };

            var recipients = _smtpSettings.AdminEmail.Split(new[] { ";", "," }, StringSplitOptions.RemoveEmptyEntries);
           
            foreach (var item in recipients)
            {
                mail.To.Add(item.Trim());
            }
            await client.SendMailAsync(mail);
        }
    }
}