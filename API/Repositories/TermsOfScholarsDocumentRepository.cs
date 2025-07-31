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

        public List<TermsOfScholarsDocument> AddRangeTermsOfScholarsDocument(List<TermsOfScholarsDocumentDTO> termsOfScholarsDocumentDtoList, bool SAVE_CHANGES)
        {
            _logger.LogInformation($"AddRangeTermsOfScholarsDocumentAsync executing with {termsOfScholarsDocumentDtoList.Count} items");
            
            if (!termsOfScholarsDocumentDtoList.Any())
                return new List<TermsOfScholarsDocument>();

            // İlk öğeden scholarId ve termId'yi al (hepsi aynı olacak)
            var scholarId = termsOfScholarsDocumentDtoList.First().ScholarId;
            var termId = termsOfScholarsDocumentDtoList.First().TermId;
            var documentTypeIds = termsOfScholarsDocumentDtoList.Select(dto => dto.DocumentTypeId).Distinct().ToList();

            // Tek sorguda gerekli verileri çek
            var scholar = _context.Scholars.Any(s => s.Id == scholarId && !s.Deleted);
            if (!scholar)
                throw new Exception($"Scholar with ID={scholarId} not found");

            var term = _context.Terms.Any(t => t.Id == termId && !t.Deleted);
            if (!term)
                throw new Exception($"Term with ID={termId} not found");

            var documentTypes = _context.DocumentTypes
                .Where(dt => documentTypeIds.Contains(dt.Id) && !dt.Deleted)
                .ToDictionary(dt => dt.Id, dt => dt);

            // Mevcut dökümanları kontrol et
            var existingDocuments = _context.TermsOfScholarsDocuments
                .Where(tsd => tsd.ScholarId == scholarId &&
                            tsd.TermId == termId &&
                            documentTypeIds.Contains(tsd.DocumentTypeId))
                .Select(tsd => new { tsd.DocumentTypeId, tsd.ListType })
                .ToHashSet();

            var entitiesToAdd = new List<TermsOfScholarsDocument>();
            var errors = new List<string>();

            foreach (var dto in termsOfScholarsDocumentDtoList)
            {
                // DocumentType validasyonu
                if (!documentTypes.ContainsKey(dto.DocumentTypeId))
                {
                    errors.Add($"DocumentType with ID={dto.DocumentTypeId} not found");
                    continue;
                }

                // Mevcut döküman kontrolü
                var documentKey = new { dto.DocumentTypeId, dto.ListType };
                if (existingDocuments.Contains(documentKey!))
                {
                    errors.Add($"Document already exists for ScholarId={scholarId}, TermId={termId}, DocumentTypeId={dto.DocumentTypeId}, ListType={dto.ListType}");
                    continue;
                }

                // Entity oluştur ve listeye ekle
                var entity = dto.ToModel();
                entitiesToAdd.Add(entity);
            }

            // Eğer hata varsa exception fırlat
            if (errors.Any())
            {
                throw new Exception($"Validation errors: {string.Join("; ", errors)}");
            }

            // Toplu ekleme yap
            if (entitiesToAdd.Any())
            {
                _context.TermsOfScholarsDocuments.AddRange(entitiesToAdd);
                if (SAVE_CHANGES) _context.SaveChanges();
            }

            _logger.LogInformation($"Successfully added {entitiesToAdd.Count} TermsOfScholarsDocuments");
            return entitiesToAdd;
        }

        public async Task<List<TermsOfScholarsDocument>> AddRangeTermsOfScholarsDocumentAsync(List<TermsOfScholarsDocumentDTO> list)
        {
            _logger.LogInformation($"AddRangeTermsOfScholarsDocumentAsync executing with {list.Count} items");
            
            if (!list.Any())
                return new List<TermsOfScholarsDocument>();

            // İlk öğeden scholarId ve termId'yi al (hepsi aynı olacak)
            var scholarId = list.First().ScholarId;
            var termId = list.First().TermId;
            var documentTypeIds = list.Select(dto => dto.DocumentTypeId).Distinct().ToList();

            // Tek sorguda gerekli verileri çek
            var scholar = await _context.Scholars.FirstOrDefaultAsync(s => s.Id == scholarId && !s.Deleted);
            if (scholar == null)
                throw new Exception($"Scholar with ID={scholarId} not found");

            var term = await _context.Terms.FirstOrDefaultAsync(t => t.Id == termId && !t.Deleted);
            if (term == null)
                throw new Exception($"Term with ID={termId} not found");

            var documentTypes = await _context.DocumentTypes
                .Where(dt => documentTypeIds.Contains(dt.Id) && !dt.Deleted)
                .ToDictionaryAsync(dt => dt.Id, dt => dt);

            // Mevcut dökümanları kontrol et
            var existingDocuments = await _context.TermsOfScholarsDocuments
                .Where(tsd => tsd.ScholarId == scholarId &&
                            tsd.TermId == termId &&
                            documentTypeIds.Contains(tsd.DocumentTypeId))
                .Select(tsd => new { tsd.DocumentTypeId, tsd.ListType })
                .ToHashSetAsync();

            var entitiesToAdd = new List<TermsOfScholarsDocument>();
            var errors = new List<string>();

            foreach (var dto in list)
            {
                // DocumentType validasyonu
                if (!documentTypes.ContainsKey(dto.DocumentTypeId))
                {
                    errors.Add($"DocumentType with ID={dto.DocumentTypeId} not found");
                    continue;
                }

                // Mevcut döküman kontrolü
                var documentKey = new { dto.DocumentTypeId, dto.ListType };
                if (existingDocuments.Contains(documentKey!))
                {
                    errors.Add($"Document already exists for ScholarId={scholarId}, TermId={termId}, DocumentTypeId={dto.DocumentTypeId}, ListType={dto.ListType}");
                    continue;
                }

                // Entity oluştur ve listeye ekle
                var entity = dto.ToModel();
                entitiesToAdd.Add(entity);
            }

            // Eğer hata varsa exception fırlat
            if (errors.Any())
            {
                throw new Exception($"Validation errors: {string.Join("; ", errors)}");
            }

            // Toplu ekleme yap
            if (entitiesToAdd.Any())
            {
                await _context.TermsOfScholarsDocuments.AddRangeAsync(entitiesToAdd);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation($"Successfully added {entitiesToAdd.Count} TermsOfScholarsDocuments");
            return entitiesToAdd;
        }

        public TermsOfScholarsDocument AddTermsOfScholarsDocument(TermsOfScholarsDocumentDTO termsOfScholarsDocumentDTO, bool SAVE_CHANGES)
        {
            throw new NotImplementedException();
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
                .Where(ts => ts.ScholarId == scholarId && ts.TermId == termId && !ts.Deleted)
                .Include(ts => ts.DocumentType)
                .ToListAsync();

            return termsOfScholarsDocuments;
        }

        public async Task<TermsOfScholarsDocument> UpdateTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentDTO termsOfScholarsDocumentsDto, int scholarId, int termId, int documentTypeId)
        {
            _logger.LogInformation("UpdateTermsOfScholarsDocumentAsync executing");

            TermsOfScholarsDocument termsOfScholarsDocumentToUpdate = await GetTermsOfScholarsDocumentByIdAsync(scholarId, termId, documentTypeId);
            termsOfScholarsDocumentToUpdate.DocumentTypeId = termsOfScholarsDocumentsDto.DocumentTypeId;
            termsOfScholarsDocumentToUpdate.ListType = termsOfScholarsDocumentsDto.ListType!;
            termsOfScholarsDocumentToUpdate.RealUploadDate = termsOfScholarsDocumentsDto.RealUploadDate;
            termsOfScholarsDocumentToUpdate.ScholarId = termsOfScholarsDocumentsDto.ScholarId;
            termsOfScholarsDocumentToUpdate.TermId = termsOfScholarsDocumentsDto.TermId;

            await _context.SaveChangesAsync();
            return termsOfScholarsDocumentToUpdate;
        }
    }
}