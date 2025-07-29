using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ScholarAddDTOs;

namespace API.Interfaces
{
    public interface IScholarAddService
    {
        public Task<bool> AddScholarFullAsync(ScholarAddDto scholarAddDto);
        public Task<bool> AddScholarFull(ScholarAddDto scholarAddDto);
    }
}