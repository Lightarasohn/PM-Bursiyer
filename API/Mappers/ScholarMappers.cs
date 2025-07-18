using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ScholarDTOs;
using API.Models;

namespace API.Mappers
{
    public static class ScholarMappers
    {
        public static Scholar ToModel(this ScholarDTO dto)
        {
            return new Scholar
            {
                NameSurname = dto.NameSurname,
                Email = dto.Email
            };
        }
    }
}