using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.DTOs.DocumentDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IDocumentRepository
    {
        Task<IEnumerable<Document>> GetAllDocumentsAsync();
        Task<Document> GetDocumentById(int id);
        Task<Document> AddDocumentAsync(DocumentAddDTO documentAddDTO);
        Task<Document> UpdateDocumentAsync(int id,DocumentUpdateDTO documentUpdateDTO);
        Task<Document> DeleteDocumentAsync(int id);
    }
}