using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.TermsOfScholarsDocumentDTOs
{
    public class TermsOfScholarsDocumentsDTO
    {
        public int ScholarId { get; set; }

        public int TermId { get; set; }

        public int DocumentTypeId { get; set; }

        public DateOnly? RealUploadDate { get; set; }

        public bool Deleted { get; set; }
    }
}