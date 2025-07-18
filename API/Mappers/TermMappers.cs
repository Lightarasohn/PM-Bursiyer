using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermDTOs;
using API.Models;

namespace API.Mappers
{
    public static class TermMappers
    {
        public static Term ToModel(this TermDTO dto)
        {
            return new Term
            {
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ResponsibleAcademician = dto.ResponsibleAcademician,
                Deleted = dto.Deleted
            };
        }
    }
}