using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.DocumentDTO;
using API.DTOs.DocumentDTOs;
using API.Interfaces;
using API.Models;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class ScholarshipDocumentDeleteService : IScholarshipDocumentDeleteRepository
    {
       
        private readonly PostgresContext _context;
        private readonly IConfiguration _config;
      
        public ScholarshipDocumentDeleteService(ITermsOfScholarsDocumentRepository termsOfScholarsDocumentRepositorys,IDocumentRepository documentRepository,IScholarshipDocumentRepository scholarshipDocumentRepo, PostgresContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }
        public async Task<ScholarDocument> DeleteDocumentAsync(int scholarId, int documentId)
        {
            var scholarDocument = await _context.ScholarDocuments
                .FirstOrDefaultAsync(d => d.ScholarId == scholarId && d.DocumentId == documentId)
                ?? throw new Exception("Doküman bulunamadı");

            scholarDocument.Deleted = true;

            var document = await _context.Documents
                .FirstOrDefaultAsync(x => x.Id == documentId)
                ?? throw new Exception("Document kaydı bulunamadı");

            var docSourceTableId = document.DocSourceTableId;

            var documentsWithSameSource = await _context.Documents
                .Where(x => x.DocSourceTableId == docSourceTableId && x.Id != documentId && x.Deleted != true)
                .ToListAsync();

            var documentCount = documentsWithSameSource.Count;

            var periodDocument = await _context.TermsOfScholarsDocuments
                .FirstOrDefaultAsync(t => t.Id == docSourceTableId);

            if (periodDocument != null)
            {
                if (documentCount == 0) 
                {
                    periodDocument.RealUploadDate = null;
                }
                else 
                {
                    var otherDoc = documentsWithSameSource
                        .OrderByDescending(d => d.CreDate) 
                        .FirstOrDefault();

                    if (otherDoc != null && otherDoc.CreDate.HasValue)
                    {
                        periodDocument.RealUploadDate = otherDoc.CreDate;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return scholarDocument;
        }


    }
}