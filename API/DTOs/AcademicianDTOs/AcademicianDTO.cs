using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.AcademicianDTOs
{
    public class AcademicianDTO
    {
        public string NameSurname { get; set; } = null!;

        public string? Email { get; set; }

        public bool Deleted { get; set; }
    }
}