using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ScholarDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IScholarRepository
    {
        Task<IEnumerable<Scholar>> GetAllScholarsAsync();
        Task<Scholar> GetScholarByIdAsync(int id);
        Task<Scholar> AddScholarAsync(ScholarDTO scholarDto);
        Task<Scholar> UpdateScholarAsync(ScholarDTO scholarDto, int id);
        Task<Scholar> DeleteScholarAsync(int id);
    }
}