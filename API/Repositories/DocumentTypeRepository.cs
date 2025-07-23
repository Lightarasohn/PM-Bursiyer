using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.DocumentTypeDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Repositories
{
    public class DocumentTypeRepository : IDocumentTypeRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<DocumentTypeRepository> _logger;

        public DocumentTypeRepository(PostgresContext context, ILogger<DocumentTypeRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DocumentType> AddDocumentTypeAsync(DocumentTypeDTO documentTypeDto)
        {
            _logger.LogInformation("AddDocumentTypeAsync executing");

            DocumentType documentTypeToAdd = documentTypeDto.ToModel();
            documentTypeToAdd.Deleted = false;
            var result = await _context.DocumentTypes.AddAsync(documentTypeToAdd);
            DocumentType addedDocumentType = result.Entity;
            await _context.SaveChangesAsync();
            return addedDocumentType;
        }

        public async Task<DocumentType> DeleteDocumentTypeAsync(int id)
        {
            _logger.LogInformation("DeleteDocumentTypeAsync executing");

            DocumentType documentTypeToDelete = await GetDocumentTypeByIdAsync(id);
            documentTypeToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return documentTypeToDelete;
        }

        public async Task<IEnumerable<DocumentType>> GetAllDocumentTypesAsync()
        {
            _logger.LogInformation("GetAllDocumentTypesAsync executing");

            IEnumerable<DocumentType> documentTypes = await _context.DocumentTypes.Where(dt => !dt.Deleted).ToListAsync();
            return documentTypes;
        }

        public async Task<DocumentType> GetDocumentTypeByIdAsync(int id)
        {
            _logger.LogInformation("GetDocumentTypeByIdAsync executing");

            DocumentType documentType = await _context.DocumentTypes.FirstOrDefaultAsync(dt => dt.Id == id && !dt.Deleted)
                ?? throw new Exception($"DocumentType with id: {id} not found");
            return documentType;
        }

        public async Task<DocumentType> UpdateDocumentTypeAsync(DocumentTypeDTO documentTypeDto, int id)
        {
            _logger.LogInformation("UpdateDocumentTypeAsync executing");

            DocumentType documentTypeToUpdate = await GetDocumentTypeByIdAsync(id);
            documentTypeToUpdate.Name = documentTypeDto.Name;
            await _context.SaveChangesAsync();
            return documentTypeToUpdate;
        }
    }
}
