using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.UserDTOs
{
    public class RegisteredUser
    {
        public int Id { get; set; }

        public string? NameSurname { get; set; }

        public string? Username { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Language { get; set; }
    }
}