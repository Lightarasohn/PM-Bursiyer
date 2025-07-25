using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.DTOs.ScholarAddDTOs;
using API.DTOs.ScholarDTOs;
using API.Interfaces;
using API.Models;

namespace API.Services
{
    public class ScholarAddService : IScholarAddService
    {
        private readonly IScholarRepository _scholarRepo;
        public ScholarAddService(IScholarRepository scholarRepository)
        {
            _scholarRepo = scholarRepository;
        }
        public async Task<bool> AddScholarFull(ScholarAddDto scholarAddDto)
        {
            var addedScholar = await addScholar(scholarAddDto.ScholarName, scholarAddDto.ScholarEmail);

            throw new NotImplementedException();
        }

        private async Task<Scholar> addScholar(string scholarName, string scholarEmail)
        {
            ScholarDTO scholarDto = new ScholarDTO()
            {
                NameSurname = scholarName,
                Email = scholarEmail
            };

            var addedScholar = await _scholarRepo.AddScholarAsync(scholarDto);
            return addedScholar;
        }
    }
}