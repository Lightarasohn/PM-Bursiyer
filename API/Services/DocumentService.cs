using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.DocumentDTOs;
using API.Interfaces;
using API.Models;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly PostgresContext _context;
         private readonly IConfiguration _config;
         private string _serverUrl;
        public DocumentService(IDocumentRepository documentRepository, PostgresContext context,IConfiguration config)
        {
            _documentRepository = documentRepository;
            _context = context;
            _config = config;
            _serverUrl = _config["Kestrel:Endpoints:Https:Url"];
        }

        public async Task<Document> AddDocumentPhsically(DocumentAddDTO dto)
        {
            
            if (dto.FileContent == null || dto.DocName == null)
                throw new Exception("Dosya içeriği veya ismi eksik");

            string[] folders = new string[]
            {
            "", "ProjectDocuments/", "", "InventoryDocuments/", "AnalysisDocuments/", "", "ScholarshipDocuments/"
            };

            string folderName = folders.ElementAtOrDefault(dto.DocSource) ?? "Others/";
            string uploadFolder = Path.Combine("UploadedDocuments", folderName);

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            string nameWithoutExt = Path.GetFileNameWithoutExtension(dto.DocName).Replace(" ", "-");
            string extension = Path.GetExtension(dto.DocName);
            string randomSuffix = Path.GetRandomFileName().Replace(".", "");
            string finalFileName = $"{nameWithoutExt}-{randomSuffix}{extension}";
            string path = Path.Combine(uploadFolder, finalFileName);
            string fullPath = Path.Combine(_serverUrl,path);

            dto.Path = Path.Combine(uploadFolder, finalFileName).Replace("\\", "/");
            dto.FullPath = fullPath;
            var addedDoc = await _documentRepository.AddDocumentAsync(dto); 
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dto.FileContent.CopyToAsync(stream);
            }
            
            if (dto.DocSourceTableId != null)
            {
                await LinkDocumentToTarget(dto.DocSource, dto.DocSourceTableId.Value, dto.DocTypeId ?? 0, addedDoc.Id);
            }

            return addedDoc;
        }
        public async Task LinkDocumentToTarget(int docSource, int sourceTableId, int docTypeId, int documentId)
        {
            switch (docSource)
            {
                case 6: // Scholar
                    var scholarDocument = new ScholarDocument
                    {
                        ScholarId = sourceTableId,
                        DocumentId = documentId,
                    };
                    _context.ScholarDocuments.Add(scholarDocument);
                    break;


                default:
                    throw new Exception("Geçersiz DocSource");
            }

            await _context.SaveChangesAsync();
        }

    }
}