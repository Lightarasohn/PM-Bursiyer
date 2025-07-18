using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.TermDocumentTypeDTOs
{
    public class TermDocumentTypeDTO
    {
        public int TermId { get; set; }

        public int DocumentTypeId { get; set; }

        public DateOnly? ExpectedUploadDate { get; set; }
    }
}