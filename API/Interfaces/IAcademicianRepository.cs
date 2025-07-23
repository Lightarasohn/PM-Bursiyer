using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IAcademicianRepository
    {
        Task<IEnumerable<Academician>> GetAllAcademiciansAsync();
        Task<Academician> GetAcademicianByIdAsync(int id);
        Task<Academician> AddAcademicianAsync(AcademicianDTO academicianDto);
        Task<Academician> UpdateAcademicianAsync(AcademicianDTO academicianDto, int id);
        Task<Academician> DeleteAcademicianAsync(int id);
    }
}