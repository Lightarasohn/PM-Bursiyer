using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.TermsOfScholarDTOs
{
    public class TermsOfScholarDTO
    {
        public int ScholarId { get; set; }

        public int TermId { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }
    }
}