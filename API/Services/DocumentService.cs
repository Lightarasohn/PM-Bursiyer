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
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly PostgresContext _context;
        private readonly IConfiguration _config;
        private string? _serverUrl;
        private readonly string _fileDirectory;
        public DocumentService(IDocumentRepository documentRepository, PostgresContext context, IConfiguration config)
        {
            _documentRepository = documentRepository;
            _context = context;
            _config = config;
            _serverUrl = _config["Kestrel:Endpoints:Https:Url"];
            _fileDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocuments");
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
            string finalFileName = $"{nameWithoutExt}{extension}";
            string path = Path.Combine(uploadFolder, finalFileName);
            string normalizedPath = path.Replace("\\", "/");
            string fullPath = Path.Combine(_serverUrl,path);

            dto.Path = Path.Combine(folderName, finalFileName).Replace("\\", "/");
            dto.FullPath = fullPath.Replace("\\", "/");
            var addedDoc = await _documentRepository.AddDocumentAsync(dto); 
            using (var stream = new FileStream(normalizedPath, FileMode.Create))
            {
                await dto.FileContent.CopyToAsync(stream);
            }
            
            if (dto.DocSourceTableId != null)
            {
                await LinkDocumentToTarget(dto.DocSource, dto.ScholarId, dto.DocTypeId ?? 0, addedDoc.Id);
            }

            return addedDoc;
        }

        public (byte[] FileContents, string ContentType, string FileName)? GetFile(string filename)
        {
            if (string.IsNullOrWhiteSpace(filename) || filename.Contains("..") || Path.IsPathRooted(filename))
                return null;

            var filePath = Path.Combine(_fileDirectory, filename);
            if (!File.Exists(filePath))
                return null;

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var contentType))
                contentType = "application/octet-stream";

            var fileBytes = File.ReadAllBytes(filePath);

            return (fileBytes, contentType, filename);
        }

        public async Task LinkDocumentToTarget(int docSource, int scholarId, int docTypeId, int documentId)
        {
            switch (docSource)
            {
                case 6: // Scholar
                    var scholarDocument = new ScholarDocument
                    {
                        ScholarId = scholarId,
                        DocumentId = documentId,
                        CreDate = DateOnly.FromDateTime(DateTime.UtcNow),
                        CreUser = 1,
                        Deleted = false
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