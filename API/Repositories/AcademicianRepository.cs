using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.AcademicianDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class AcademicianRepository : IAcademicianRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<AcademicianRepository> _logger;
        public AcademicianRepository(PostgresContext context, ILogger<AcademicianRepository> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<Academician> AddAcademicianAsync(AcademicianDTO academicianDto)
        {
            _logger.LogInformation("AddAcademicianAsync executing");

            Academician academicianToAdd = academicianDto.ToModel();
            academicianToAdd.Deleted = false;
            var result = await _context.Academicians.AddAsync(academicianToAdd);
            Academician addedAcademician = result.Entity;
            await _context.SaveChangesAsync();
            return addedAcademician;
        }

        public async Task<Academician> DeleteAcademicianAsync(int id)
        {
            _logger.LogInformation("DeleteAcademicianAsync executing");

            Academician academicianToDelete = await GetAcademicianByIdAsync(id);
            academicianToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return academicianToDelete;
        }

        public async Task<Academician> GetAcademicianByIdAsync(int id)
        {
            _logger.LogInformation("GetAcademicianByIdAsync executing");

            Academician academician = await _context.Academicians.FirstOrDefaultAsync(a => a.Id == id && !a.Deleted)
                ?? throw new Exception($"Academician with id: {id} not found");
            return academician;
        }

        public async Task<IEnumerable<Academician>> GetAllAcademiciansAsync()
        {
            _logger.LogInformation("GetAllAcademiciansAsync executing");

            IEnumerable<Academician> academicians = await _context.Academicians.Where(a => !a.Deleted).ToListAsync();
            return academicians;
        }

        public async Task<Academician> UpdateAcademicianAsync(AcademicianDTO academicianDto, int id)
        {
            _logger.LogInformation("UpdateAcademicianAsync executing");

            Academician academicianToUpdate = await GetAcademicianByIdAsync(id);
            academicianToUpdate.NameSurname = academicianDto.NameSurname;
            academicianToUpdate.Email = academicianDto.Email;
            await _context.SaveChangesAsync();
            return academicianToUpdate;
        }
    }
}