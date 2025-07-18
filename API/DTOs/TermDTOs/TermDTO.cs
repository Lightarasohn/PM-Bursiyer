using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.TermDTOs
{
    public class TermDTO
    {
        public string Name { get; set; } = null!;

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public int? ResponsibleAcademician { get; set; }

        public bool Deleted { get; set; }
    }
}