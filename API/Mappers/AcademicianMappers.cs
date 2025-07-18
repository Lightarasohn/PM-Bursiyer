using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.Models;

namespace API.Mappers
{
    public static class AcademicianMappers
    {
        public static Academician ToModel(this AcademicianDTO dto)
        {
            return new Academician
            {
                NameSurname = dto.NameSurname,
                Email = dto.Email
            };
        }
    }
}