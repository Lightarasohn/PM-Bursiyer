using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DocumentDTOs;
using API.Models;

namespace API.Mappers
{
    public static class DocumentMappers
    {
        public static Document ToModel(this DocumentAddDTO dto)
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
                CreUser = dto.CreUserId,
                CreDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Deleted = false,
                DelDate = null,
                DelUser = null,
                UpdDate = null,
                UpdUser = null,
            };
        }
    }
}