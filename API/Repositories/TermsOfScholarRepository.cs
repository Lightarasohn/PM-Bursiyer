using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.TermsOfScholarDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class TermsOfScholarRepository : ITermsOfScholarRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<TermsOfScholarRepository> _logger;
        public TermsOfScholarRepository(PostgresContext context, ILogger<TermsOfScholarRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public TermsOfScholar AddTermsOfScholar(TermsOfScholarDTO termsOfScholarDto, bool SAVE_CHANGES)
        {
            _logger.LogInformation("AddTermsOfScholar executing");

            var scholarExists = _context.Scholars.Any(s => s.Id == termsOfScholarDto.ScholarId && !s.Deleted);
            if(!scholarExists) throw new Exception($"Scholar with id={termsOfScholarDto.ScholarId} not found");

            var termExists = _context.Terms.Any(t => t.Id == termsOfScholarDto.TermId && !t.Deleted);
            if(!termExists) throw new Exception($"Term with id={termsOfScholarDto.TermId} not found");

            var existing = _context.TermsOfScholars
                .FirstOrDefault(ts => ts.ScholarId == termsOfScholarDto.ScholarId && ts.TermId == termsOfScholarDto.TermId && !ts.Deleted);

            if (existing != null)
            {
                throw new Exception($"TermsOfScholar entry already exists for ScholarId={termsOfScholarDto.ScholarId} and TermId={termsOfScholarDto.TermId}");
            }

            if (termsOfScholarDto.StartDate.HasValue && termsOfScholarDto.EndDate.HasValue &&
                termsOfScholarDto.StartDate > termsOfScholarDto.EndDate)
            {
                throw new Exception("StartDate cannot be after EndDate.");
            }

            TermsOfScholar termsOfScholarToAdd = termsOfScholarDto.ToModel();
            termsOfScholarToAdd.Deleted = false;

            var result = _context.TermsOfScholars.Add(termsOfScholarToAdd);
            if (SAVE_CHANGES) _context.SaveChanges();
            return result.Entity;
        }

        public async Task<TermsOfScholar> AddTermsOfScholarAsync(TermsOfScholarDTO termsOfScholarDto)
        {
            _logger.LogInformation("AddTermsOfScholarAsync executing");

            var scholarExists = await _context.Scholars.AnyAsync(s => s.Id == termsOfScholarDto.ScholarId && !s.Deleted);
            if(!scholarExists) throw new Exception($"Scholar with id={termsOfScholarDto.ScholarId} not found");

            var termExists = await _context.Terms.AnyAsync(t => t.Id == termsOfScholarDto.TermId && !t.Deleted);
            if(!termExists) throw new Exception($"Term with id={termsOfScholarDto.TermId} not found");

            var existing = await _context.TermsOfScholars
                .FirstOrDefaultAsync(ts => ts.ScholarId == termsOfScholarDto.ScholarId && ts.TermId == termsOfScholarDto.TermId && !ts.Deleted);

            if (existing != null)
            {
                throw new Exception($"TermsOfScholar entry already exists for ScholarId={termsOfScholarDto.ScholarId} and TermId={termsOfScholarDto.TermId}");
            }

            if (termsOfScholarDto.StartDate.HasValue && termsOfScholarDto.EndDate.HasValue &&
                termsOfScholarDto.StartDate > termsOfScholarDto.EndDate)
            {
                throw new Exception("StartDate cannot be after EndDate.");
            }

            TermsOfScholar termsOfScholarToAdd = termsOfScholarDto.ToModel();
            termsOfScholarToAdd.Deleted = false;

            var result = await _context.TermsOfScholars.AddAsync(termsOfScholarToAdd);
            await _context.SaveChangesAsync();
            return result.Entity;
        }


        public async Task<TermsOfScholar> DeleteTermsOfScholarAsync(int scholarId, int termId)
        {
            _logger.LogInformation("DeleteTermsOfScholarAsync executing");

            TermsOfScholar termsOfScholarToDelete = await GetTermsOfScholarByIdAsync(scholarId, termId);

            termsOfScholarToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return termsOfScholarToDelete;
        }

        public async Task<IEnumerable<TermsOfScholar>> GetAllTermsOfScholarAsync()
        {
            _logger.LogInformation("GetAllTermsOfScholarAsync executing");

            IEnumerable<TermsOfScholar> termsOfScholars = await _context.TermsOfScholars
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .Where(ts => !ts.Deleted)
                .ToListAsync();
            return termsOfScholars;
        }

        public async Task<TermsOfScholar> GetTermsOfScholarByIdAsync(int scholarId, int termId)
        {
            _logger.LogInformation("GetTermsOfScholarByIdAsync executing");

            TermsOfScholar termsOfScholar = await _context.TermsOfScholars
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .FirstOrDefaultAsync(ts => ts.ScholarId == scholarId && ts.TermId == termId && !ts.Deleted)
                ?? throw new Exception($"TermsOfScholar with ScholarId={scholarId} and TermId={termId} not found");
            return termsOfScholar;
        }

        public async Task<IEnumerable<TermsOfScholar>> GetTermsOfScholarsByScholarIdAsync(int scholarId)
        {
            _logger.LogInformation("GetAllTermsOfScholarAsync executing");

            IEnumerable<TermsOfScholar> termsOfScholars = await _context.TermsOfScholars
                .Where(ts => ts.ScholarId == scholarId && !ts.Deleted)
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .ToListAsync();
            return termsOfScholars;
        }

        public async Task<IEnumerable<TermsOfScholar>> GetTermsOfScholarsByTermIdAsync(int termId)
        {
            _logger.LogInformation("GetTermsOfScholarsByTermIdAsync executing");

            IEnumerable<TermsOfScholar> termsOfScholars = await _context.TermsOfScholars
                .Where(ts => ts.TermId == termId && !ts.Deleted)
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .ToListAsync();
            return termsOfScholars;
        }

        public async Task<TermsOfScholar> UpdateTermsOfScholarAsync(TermsOfScholarDTO termsOfScholarDto, int scholarId, int termId)
        {
            _logger.LogInformation("UpdateTermsOfScholarAsync executing");

            TermsOfScholar termsOfScholarToUpdate = await GetTermsOfScholarByIdAsync(scholarId, termId);

            termsOfScholarToUpdate.StartDate = termsOfScholarDto.StartDate;
            termsOfScholarToUpdate.EndDate = termsOfScholarDto.EndDate;

            await _context.SaveChangesAsync();
            return termsOfScholarToUpdate;
        }
    }
}