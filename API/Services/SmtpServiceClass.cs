public class SmtpSettings
{
    public string SmtpHost { get; set; }= string.Empty!;
    public int SmtpPort { get; set; }
    public bool EnableSSL { get; set; }
    public string AdminEmail { get; set; }= string.Empty!;
    public string SmtpUserName { get; set; }= string.Empty!;
    public string SmtpPassword { get; set; }= string.Empty!;
    public string FromUserName { get; set; }= string.Empty!;
    public string FromName { get; set; } = string.Empty!;
    public int TrialPeriod { get; set; }
}