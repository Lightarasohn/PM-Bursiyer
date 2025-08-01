using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.TermDocumentTypeDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Repositories
{
    public class TermDocumentTypeRepository : ITermDocumentTypeRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<TermDocumentTypeRepository> _logger;

        public TermDocumentTypeRepository(PostgresContext context, ILogger<TermDocumentTypeRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TermDocumentType> AddTermDocumentTypeAsync(TermDocumentTypeDTO dto)
        {
            _logger.LogInformation("AddTermDocumentTypeAsync executing");

            if (dto.TermId <= 0 || dto.DocumentTypeId <= 0)
                throw new ArgumentException("TermId ve DocumentTypeId geçerli olmalıdır.");

            var termExists = await _context.Terms.AnyAsync(t => t.Id == dto.TermId && !t.Deleted);
            if (!termExists)
                throw new Exception($"Term ID {dto.TermId} bulunamadı.");

            var docTypeExists = await _context.DocumentTypes.AnyAsync(dt => dt.Id == dto.DocumentTypeId && !dt.Deleted);
            if (!docTypeExists)
                throw new Exception($"DocumentType ID {dto.DocumentTypeId} bulunamadı.");

            var alreadyExists = await _context.TermDocumentTypes
                .AnyAsync(tdt => tdt.TermId == dto.TermId && tdt.DocumentTypeId == dto.DocumentTypeId);
            if (alreadyExists)
                throw new Exception("Bu Term ve DocumentType ilişkisi zaten mevcut.");

            var termDocumentType = dto.ToModel();
            await _context.TermDocumentTypes.AddAsync(termDocumentType);
            await _context.SaveChangesAsync();

            return termDocumentType;
        }


        public async Task<TermDocumentType> DeleteTermDocumentTypeAsync(int termId, int documentTypeId)
        {
            _logger.LogInformation("DeleteTermDocumentTypeAsync executing");

            var entity = await GetTermDocumentTypeByIdAsync(termId, documentTypeId);
            _context.TermDocumentTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<IEnumerable<TermDocumentType>> GetAllTermDocumentTypesAsync()
        {
            _logger.LogInformation("GetAllTermDocumentTypesAsync executing");

            return await _context.TermDocumentTypes
                .Include(td => td.Term)
                .Include(td => td.DocumentType)
                .ToListAsync();
        }

        public async Task<TermDocumentType> GetTermDocumentTypeByIdAsync(int termId, int documentTypeId)
        {
            _logger.LogInformation("GetTermDocumentTypeByIdAsync executing");

            var entity = await _context.TermDocumentTypes
                .Include(td => td.Term)
                .Include(td => td.DocumentType)
                .FirstOrDefaultAsync(td => td.TermId == termId && td.DocumentTypeId == documentTypeId)
                ?? throw new Exception($"TermDocumentType with TermId={termId} and DocumentTypeId={documentTypeId} not found");

            return entity;
        }

        public async Task<IEnumerable<TermDocumentType>> GetTermDocumentTypesByTermIdAsync(int termId)
        {
            _logger.LogInformation("GetTermDocumentTypesByTermIdAsync executing");

            return await _context.TermDocumentTypes
                .Where(td => td.TermId == termId)
                .Include(td => td.DocumentType)
                .ToListAsync();
        }

        public async Task<IEnumerable<TermDocumentType>> GetTermDocumentTypesByDocumentTypeIdAsync(int documentTypeId)
        {
            _logger.LogInformation("GetTermDocumentTypesByDocumentTypeIdAsync executing");

            return await _context.TermDocumentTypes
                .Where(td => td.DocumentTypeId == documentTypeId)
                .Include(td => td.Term)
                .ToListAsync();
        }

        public async Task<TermDocumentType> UpdateTermDocumentTypeAsync(TermDocumentTypeDTO dto, int termId, int documentTypeId)
        {
            _logger.LogInformation("UpdateTermDocumentTypeAsync executing");

            var entity = await GetTermDocumentTypeByIdAsync(termId, documentTypeId);

            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<List<TermDocumentType>> AddTermDocumentTypeRangeAsync(List<TermDocumentTypeDTO> termDocumentTypeDtos)
        {
            _logger.LogInformation("AddTermDocumentTypeRangeAsync executing");

            if (termDocumentTypeDtos == null || !termDocumentTypeDtos.Any())
                throw new ArgumentException("TermDocumentType listesi boş olamaz.");

            var termDocumentTypes = new List<TermDocumentType>();

            foreach (var dto in termDocumentTypeDtos)
            {
                if (dto.TermId <= 0 || dto.DocumentTypeId <= 0)
                    throw new ArgumentException($"TermId ve DocumentTypeId geçerli olmalıdır. TermId: {dto.TermId}, DocumentTypeId: {dto.DocumentTypeId}");

                var termExists = await _context.Terms.AnyAsync(t => t.Id == dto.TermId && !t.Deleted);
                if (!termExists)
                    throw new Exception($"Term ID {dto.TermId} bulunamadı.");

                var docTypeExists = await _context.DocumentTypes.AnyAsync(dt => dt.Id == dto.DocumentTypeId && !dt.Deleted);
                if (!docTypeExists)
                    throw new Exception($"DocumentType ID {dto.DocumentTypeId} bulunamadı.");

                var alreadyExists = await _context.TermDocumentTypes
                    .AnyAsync(tdt => tdt.TermId == dto.TermId && tdt.DocumentTypeId == dto.DocumentTypeId && tdt.ListType == dto.ListType);
                if (alreadyExists)
                    throw new Exception($"Term ID {dto.TermId} ve DocumentType ID {dto.DocumentTypeId} ilişkisi zaten mevcut.");

                termDocumentTypes.Add(dto.ToModel());
            }

            await _context.TermDocumentTypes.AddRangeAsync(termDocumentTypes);
            await _context.SaveChangesAsync();

            return termDocumentTypes;
        }

        public List<TermDocumentType> AddRangeTermDocumentType(List<TermDocumentTypeDTO> termDocumentTypeDtoList, bool SAVE_CHANGES)
        {
            _logger.LogInformation("AddTermDocumentTypeRangeAsync executing");

            if (termDocumentTypeDtoList == null || !termDocumentTypeDtoList.Any())
                throw new ArgumentException("TermDocumentType listesi boş olamaz.");

            var termDocumentTypes = new List<TermDocumentType>();

            foreach (var dto in termDocumentTypeDtoList)
            {
                if (dto.TermId <= 0 || dto.DocumentTypeId <= 0)
                    throw new ArgumentException($"TermId ve DocumentTypeId geçerli olmalıdır. TermId: {dto.TermId}, DocumentTypeId: {dto.DocumentTypeId}");

                var termExists = _context.Terms.Any(t => t.Id == dto.TermId && !t.Deleted);
                if (!termExists)
                    throw new Exception($"Term ID {dto.TermId} bulunamadı.");

                var docTypeExists = _context.DocumentTypes.Any(dt => dt.Id == dto.DocumentTypeId && !dt.Deleted);
                if (!docTypeExists)
                    throw new Exception($"DocumentType ID {dto.DocumentTypeId} bulunamadı.");

                var alreadyExists = _context.TermDocumentTypes
                    .Any(tdt => tdt.TermId == dto.TermId && tdt.DocumentTypeId == dto.DocumentTypeId && tdt.ListType == dto.ListType);
                if (alreadyExists)
                    throw new Exception($"Term ID {dto.TermId} ve DocumentType ID {dto.DocumentTypeId} ilişkisi zaten mevcut.");

                termDocumentTypes.Add(dto.ToModel());
            }

            _context.TermDocumentTypes.AddRange(termDocumentTypes);
            if (SAVE_CHANGES) _context.SaveChanges();

            return termDocumentTypes;
        }
    }
}
