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
    public interface IScholarshipDocumentRepository
    {
        Task<IEnumerable<ScholarDocument>> GetDocumentsByRequesterIdAndDocumentTypeIdAsync(int requesterId, int documentTypeId);
        Task<ScholarDocument> DeleteDocumentAsync(int scholarId, int documentId);
    }
}