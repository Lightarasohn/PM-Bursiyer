using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.TermsOfScholarsDocumentDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class TermsOfScholarsDocumentRepository : ITermsOfScholarsDocumentRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<TermsOfScholarsDocumentRepository> _logger;
        public TermsOfScholarsDocumentRepository(PostgresContext context, ILogger<TermsOfScholarsDocumentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<TermsOfScholarsDocument> AddTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentDTO termsOfScholarsDocumentsDto)
        {
            _logger.LogInformation("AddTermsOfScholarsDocumentAsync executing");

            TermsOfScholarsDocument termsOfScholarsDocumentToAdd = termsOfScholarsDocumentsDto.ToModel();
            termsOfScholarsDocumentToAdd.Deleted = false;
            var result = await _context.TermsOfScholarsDocuments.AddAsync(termsOfScholarsDocumentToAdd);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<TermsOfScholarsDocument> DeleteTermsOfScholarsDocumentAsync(int scholarId, int termId, int documentTypeId)
        {
            _logger.LogInformation("DeleteTermsOfScholarsDocumentAsync executing");

            TermsOfScholarsDocument termsOfScholarsDocumentToDelete = await GetTermsOfScholarsDocumentByIdAsync(scholarId, termId, documentTypeId);
            termsOfScholarsDocumentToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return termsOfScholarsDocumentToDelete;
        }

        public async Task<IEnumerable<TermsOfScholarsDocument>> GetAllTermsOfScholarsDocumentsAsync()
        {
            _logger.LogInformation("GetAllTermsOfScholarsDocumentsAsync executing");

            IEnumerable<TermsOfScholarsDocument> termsOfScholarsDocuments = await _context.TermsOfScholarsDocuments
                .Include(tsd => tsd.Scholar)
                .Include(tsd => tsd.Term)
                .Include(tsd => tsd.DocumentType)
                .ToListAsync();
            return termsOfScholarsDocuments;
        }

        public async Task<TermsOfScholarsDocument> GetTermsOfScholarsDocumentByIdAsync(int scholarId, int termId, int documentTypeId)
        {
            _logger.LogInformation("GetTermsOfScholarsDocumentByIdAsync executing");

            TermsOfScholarsDocument termsOfScholarsDocument = await _context.TermsOfScholarsDocuments
                .Include(ts => ts.DocumentType)
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .FirstOrDefaultAsync(ts =>
                ts.ScholarId == scholarId && ts.TermId == termId && ts.DocumentTypeId == documentTypeId)
                ?? throw new Exception($"TermsOfScholar's which has termId of {termId} and scholarId of {scholarId}, has no document like documentTypeId of {documentTypeId}");
            return termsOfScholarsDocument;
        }

        public async Task<IEnumerable<TermsOfScholarsDocument>> GetTermsOfScholarsDocumentsByScholarAndTermIdAsync(int scholarId, int termId)
        {
            _logger.LogInformation("GetTermsOfScholarsDocumentsByScholarAndTermIdAsync executing");

            IEnumerable<TermsOfScholarsDocument> termsOfScholarsDocuments = await _context.TermsOfScholarsDocuments
                .Include(ts => ts.DocumentType)
                .Include(ts => ts.Scholar)
                .Include(ts => ts.Term)
                .Where(ts => ts.ScholarId == scholarId && ts.TermId == termId)
                .ToListAsync();

            return termsOfScholarsDocuments;
        }

        public async Task<TermsOfScholarsDocument> UpdateTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentDTO termsOfScholarsDocumentsDto, int scholarId, int termId, int documentTypeId)
        {
            _logger.LogInformation("UpdateTermsOfScholarsDocumentAsync executing");

            TermsOfScholarsDocument termsOfScholarsDocumentToUpdate = await GetTermsOfScholarsDocumentByIdAsync(scholarId, termId, documentTypeId);
            termsOfScholarsDocumentToUpdate.DocumentTypeId = termsOfScholarsDocumentsDto.DocumentTypeId;
            termsOfScholarsDocumentToUpdate.ListType = termsOfScholarsDocumentsDto.ListType;
            termsOfScholarsDocumentToUpdate.RealUploadDate = termsOfScholarsDocumentsDto.RealUploadDate;
            termsOfScholarsDocumentToUpdate.ScholarId = termsOfScholarsDocumentsDto.ScholarId;
            termsOfScholarsDocumentToUpdate.TermId = termsOfScholarsDocumentsDto.TermId;

            await _context.SaveChangesAsync();
            return termsOfScholarsDocumentToUpdate;
        }
    }
}