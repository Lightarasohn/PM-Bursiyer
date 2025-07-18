using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.TermDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Repositories
{
    public class TermRepository : ITermRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<TermRepository> _logger;

        public TermRepository(PostgresContext context, ILogger<TermRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Term> AddTermAsync(TermDTO termDto)
        {
            _logger.LogInformation("AddTermAsync executing");

            Term termToAdd = termDto.ToModel();
            termToAdd.Deleted = false;
            var result = await _context.Terms.AddAsync(termToAdd);
            Term addedTerm = result.Entity;
            await _context.SaveChangesAsync();
            return addedTerm;
        }

        public async Task<Term> DeleteTermAsync(int id)
        {
            _logger.LogInformation("DeleteTermAsync executing");

            Term termToDelete = await GetTermByIdAsync(id);
            termToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return termToDelete;
        }

        public async Task<IEnumerable<Term>> GetAllTermsAsync()
        {
            _logger.LogInformation("GetAllTermsAsync executing");

            IEnumerable<Term> terms = await _context.Terms.Where(t => !t.Deleted).ToListAsync();
            return terms;
        }

        public async Task<Term> GetTermByIdAsync(int id)
        {
            _logger.LogInformation("GetTermByIdAsync executing");

            Term term = await _context.Terms.FirstOrDefaultAsync(t => t.Id == id && !t.Deleted)
                ?? throw new Exception($"Term with id: {id} not found");
            return term;
        }

        public async Task<Term> UpdateTermAsync(TermDTO termDto, int id)
        {
            _logger.LogInformation("UpdateTermAsync executing");

            Term termToUpdate = await GetTermByIdAsync(id);
            termToUpdate.Name = termDto.Name;
            termToUpdate.StartDate = termDto.StartDate;
            termToUpdate.EndDate = termDto.EndDate;
            termToUpdate.ResponsibleAcademician = termDto.ResponsibleAcademician;
            await _context.SaveChangesAsync();
            return termToUpdate;
        }
    }
}
