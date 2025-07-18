using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.ScholarDTOs
{
    public class ScholarDTO
    {
        public string NameSurname { get; set; } = null!;

        public bool Deleted { get; set; }

        public string? Email { get; set; }
    }
}