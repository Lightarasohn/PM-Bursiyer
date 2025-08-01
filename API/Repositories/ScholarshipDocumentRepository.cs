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
    public class ScholarshipDocumentRepository : IScholarshipDocumentRepository
    {
         private readonly PostgresContext _context;
        private readonly ILogger<ScholarshipDocumentRepository> _logger;
        public ScholarshipDocumentRepository(PostgresContext context, ILogger<ScholarshipDocumentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ScholarDocument>> GetDocumentsByRequesterIdAndDocumentTypeIdAsync(int requesterId, int documentTypeId)
        {
            _logger.LogInformation("GetDocumentsByRequesterIdAndDocumentTypeIdAsync executing");

            var scholarDocuments = await _context.ScholarDocuments
            .Include(d => d.Document)
            .Where(a=> a.DocumentId == a.Document.Id && a.Document.DocSourceTableId == requesterId && a.Document.DocTypeId == documentTypeId)
            .ToListAsync();

            return scholarDocuments;
        }
    }
}