using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DocumentTypeDTOs;
using API.Models;

namespace API.Mappers
{
    public static class ScholarshipDocumentMappers
    {
        public static ScholarDocument ToModel(this ScholarshipDocumentsDTO dto)
        {
            return new ScholarDocument
            {
                ScholarId = dto.ScholarId,
                DocumentId = dto.DocumentId,
            };
        }
    }
}