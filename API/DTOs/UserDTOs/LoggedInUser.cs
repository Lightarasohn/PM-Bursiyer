using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.UserDTOs
{
    public class LoggedInUser
    {
        public string? Token { get; set; }

        public int Id { get; set; }

        public string? NameSurname { get; set; }

        public string? Username { get; set; }

        public string? UserType { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? BillingNumber { get; set; }

        public string? FirmName { get; set; }

        public string? TaxOfficeName { get; set; }
        public string? Language { get; set; }
    }
}