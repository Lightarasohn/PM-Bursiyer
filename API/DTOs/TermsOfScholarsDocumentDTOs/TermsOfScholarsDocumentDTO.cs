using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.TermsOfScholarsDocumentDTOs
{
    public class TermsOfScholarsDocumentDTO
    {
        public int ScholarId { get; set; }

        public int TermId { get; set; }

        public int DocumentTypeId { get; set; }

        public DateOnly? RealUploadDate { get; set; }
        
        public DateOnly? ExpectedUploadDate { get; set; }

        public string? ListType { get; set; }
    }
}