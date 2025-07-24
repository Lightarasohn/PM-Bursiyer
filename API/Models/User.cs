using System;
using System.Collections.Generic;

namespace API.Models;

public partial class User
{
    public int Id { get; set; }

    public int? FirmId { get; set; }

    public string? NameSurname { get; set; }

    public string? Username { get; set; }

    public string? UserType { get; set; }

    public byte[]? Password { get; set; }

    public byte[]? PasswordSalt { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? BillingNumber { get; set; }

    public string? FirmName { get; set; }

    public string? TaxOfficeName { get; set; }

    public string? Language { get; set; }

    public int? CreUser { get; set; }

    public DateOnly? CreDate { get; set; }

    public int? UpdUser { get; set; }

    public DateOnly? UpdDate { get; set; }

    public int? DelUser { get; set; }

    public DateOnly? DelDate { get; set; }

    public bool? Deleted { get; set; }
}
