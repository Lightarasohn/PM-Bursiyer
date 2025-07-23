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
        public async Task<TermsOfScholarsDocument> AddTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentDTO dto)
        {
            _logger.LogInformation("AddTermsOfScholarsDocumentAsync executing");

            var scholar = await _context.Scholars.FirstOrDefaultAsync(s => s.Id == dto.ScholarId && !s.Deleted)
                ?? throw new Exception($"Scholar with ID={dto.ScholarId} not found");

            var term = await _context.Terms.FirstOrDefaultAsync(t => t.Id == dto.TermId && !t.Deleted)
                ?? throw new Exception($"Term with ID={dto.TermId} not found");

            var documentType = await _context.DocumentTypes.FirstOrDefaultAsync(dt => dt.Id == dto.DocumentTypeId && !dt.Deleted)
                ?? throw new Exception($"DocumentType with ID={dto.DocumentTypeId} not found");

            var termsOfScholar = await _context.TermsOfScholars
                .FirstOrDefaultAsync(ts => ts.ScholarId == dto.ScholarId && ts.TermId == dto.TermId && !ts.Deleted)
                ?? throw new Exception($"No TermsOfScholar found for ScholarId={dto.ScholarId} and TermId={dto.TermId}");

            var existing = await _context.TermsOfScholarsDocuments.FirstOrDefaultAsync(tsd =>
                tsd.ScholarId == dto.ScholarId &&
                tsd.TermId == dto.TermId &&
                tsd.DocumentTypeId == dto.DocumentTypeId &&
                tsd.ListType == dto.ListType);

            if (existing != null)
            {
                throw new Exception($"Document already exists for ScholarId={dto.ScholarId}, TermId={dto.TermId}, DocumentTypeId={dto.DocumentTypeId}");
            }

            var entity = dto.ToModel();
            entity.Deleted = false;

            await _context.TermsOfScholarsDocuments.AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity;
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
                .Where(tsd => !tsd.Deleted)
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
                ts.ScholarId == scholarId && ts.TermId == termId && ts.DocumentTypeId == documentTypeId && !ts.Deleted)
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
                .Where(ts => ts.ScholarId == scholarId && ts.TermId == termId && !ts.Deleted)
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