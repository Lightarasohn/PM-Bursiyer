using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.ScholarAddDTOs
{
    public class ScholarAddNewTermDto
    {
        public int ScholarId { get; set; }
        public int TermId { get; set; }
        public string TermName { get; set; } = string.Empty!;
        public DateOnly TermStartDate { get; set; }
        public DateOnly TermEndDate { get; set; }
        public int TermResponsibleAcademician { get; set; }
        public List<int> EntryDocuments { get; set; } = new List<int>();
        public List<int> OngoingDocuments { get; set; } = new List<int>();
        public List<int> ExitDocuments { get; set; } = new List<int>();
    }
}