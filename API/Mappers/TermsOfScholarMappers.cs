using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarDTOs;
using API.Models;

namespace API.Mappers
{
    public static class TermsOfScholarMappers
    {
        public static TermsOfScholar ToModel(this TermsOfScholarDTO dto)
        {
            return new TermsOfScholar
            {
                ScholarId = dto.ScholarId,
                TermId = dto.TermId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
        }
    }
}