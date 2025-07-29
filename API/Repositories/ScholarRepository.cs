using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.ScholarDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Repositories
{
    public class ScholarRepository : IScholarRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<ScholarRepository> _logger;

        public ScholarRepository(PostgresContext context, ILogger<ScholarRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public Scholar AddScholar(ScholarDTO scholarDTO, bool SAVE_CHANGES)
        {
            _logger.LogInformation("AddScholar executing");

            Scholar scholarToAdd = scholarDTO.ToModel();
            scholarToAdd.Deleted = false;
            var result = _context.Scholars.Add(scholarToAdd);
            Scholar addedScholar = result.Entity;
            if (SAVE_CHANGES) _context.SaveChanges();
            return addedScholar;
        }

        public async Task<Scholar> AddScholarAsync(ScholarDTO scholarDto)
        {
            _logger.LogInformation("AddScholarAsync executing");

            Scholar scholarToAdd = scholarDto.ToModel();
            scholarToAdd.Deleted = false;
            var result = await _context.Scholars.AddAsync(scholarToAdd);
            Scholar addedScholar = result.Entity;
            await _context.SaveChangesAsync();
            return addedScholar;
        }

        public async Task<Scholar> DeleteScholarAsync(int id)
        {
            _logger.LogInformation("DeleteScholarAsync executing");

            Scholar scholarToDelete = await GetScholarByIdAsync(id);
            scholarToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return scholarToDelete;
        }

        public async Task<IEnumerable<Scholar>> GetAllScholarsAsync()
        {
            _logger.LogInformation("GetAllScholarsAsync executing");

            IEnumerable<Scholar> scholars = await _context.Scholars.Where(s => !s.Deleted).ToListAsync();
            return scholars;
        }

        public async Task<Scholar> GetScholarByIdAsync(int id)
        {
            _logger.LogInformation("GetScholarByIdAsync executing");

            Scholar scholar = await _context.Scholars.FirstOrDefaultAsync(s => s.Id == id && !s.Deleted)
                ?? throw new Exception($"Scholar with id: {id} not found");
            return scholar;
        }

        public async Task<Scholar> UpdateScholarAsync(ScholarDTO scholarDto, int id)
        {
            _logger.LogInformation("UpdateScholarAsync executing");

            Scholar scholarToUpdate = await GetScholarByIdAsync(id);
            scholarToUpdate.NameSurname = scholarDto.NameSurname;
            await _context.SaveChangesAsync();
            return scholarToUpdate;
        }
    }
}
