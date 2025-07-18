using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.DocumentTypeDTOs
{
    public class DocumentTypeDTO
    {
        public string Name { get; set; } = null!;

        public bool Deleted { get; set; }
    }
}