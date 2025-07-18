using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DocumentTypeDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IDocumentTypeRepository
    {
        Task<IEnumerable<DocumentType>> GetAllDocumentTypesAsync();
        Task<DocumentType> GetDocumentTypeByIdAsync(int id);
        Task<DocumentType> AddDocumentTypeAsync(DocumentTypeDTO documentTypeDto);
        Task<DocumentType> UpdateDocumentTypeAsync(DocumentTypeDTO documentTypeDto, int id);
        Task<DocumentType> DeleteDocumentTypeAsync(int id);
    }
}