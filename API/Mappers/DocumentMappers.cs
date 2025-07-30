using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.Models;

namespace API.Mappers
{
    public static class DocumentMappers
    {
        public static Document ToModel(this DocumentDTO dto, int creUserId)
        {
            return new Document
            {
                DocSource = dto.DocSource,
                DocSourceTableId = dto.DocSourceTableId,
                DocTypeId = dto.DocTypeId,
                Title = dto.Title,
                DocName = dto.DocName,
                Path = dto.Path,
                FullPath = dto.FullPath,
                CreUser = creUserId,
                Deleted = false,
                DelDate = null,
                DelUser = null,
                UpdDate = null,
                UpdUser = null,
            };
        }
    }
}