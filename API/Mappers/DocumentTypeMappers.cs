using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DocumentTypeDTOs;
using API.Models;

namespace API.Mappers
{
    public static class DocumentTypeMappers
    {
        public static DocumentType ToModel(this DocumentTypeDTO dto)
        {
            return new DocumentType
            {
                Name = dto.Name,
                Deleted = dto.Deleted
            };
        }
    }
}