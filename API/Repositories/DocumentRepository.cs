using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.DTOs.DocumentDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
         private readonly PostgresContext _context;
        private readonly ILogger<DocumentRepository> _logger;
        public DocumentRepository(PostgresContext context, ILogger<DocumentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Document> AddDocumentAsync(DocumentAddDTO documentDTO)
        {
            _logger.LogInformation("AddDocumentAsync executing");
     
            Document documentToAdd = documentDTO.ToModel();
            var result = await _context.Documents.AddAsync(documentToAdd);
            Document addedDocument = result.Entity;
            await _context.SaveChangesAsync();
            return addedDocument;
        }

        public async Task<Document> DeleteDocumentAsync(int id)
        {
            _logger.LogInformation("DeleteAcademicianAsync executing");

            Document DocumentToDelete = await GetDocumentById(id);
            DocumentToDelete.Deleted = true;
            await _context.SaveChangesAsync();
            return DocumentToDelete;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync()
        {
            _logger.LogInformation("GetAllDocuments executing");

            IEnumerable<Document> documents = await _context.Documents.Where(a => a.Deleted == false).ToListAsync();
            return documents;
        }

        public async Task<Document> GetDocumentById(int id)
        {
             _logger.LogInformation("GetDocmentById executing");

            Document document = await _context.Documents.FirstOrDefaultAsync(a => a.Id == id && a.Deleted == false)
                ?? throw new Exception($"Document with id: {id} not found");
            return document;
        }

        public async Task<Document> UpdateDocumentAsync(int id,DocumentUpdateDTO documentUpdateDTO )
        {
           _logger.LogInformation("UpdateDocuments executing");

            Document documentToUpdate = await GetDocumentById(id);
            documentToUpdate.Title = documentUpdateDTO.Title;
            documentToUpdate.DocTypeId = documentUpdateDTO.DocTypeId;
            documentToUpdate.UpdUser = documentUpdateDTO.DocTypeId;
            documentToUpdate.UpdDate = DateOnly.FromDateTime(DateTime.Now);
            await _context.SaveChangesAsync();
            return documentToUpdate;
        }
    }
}