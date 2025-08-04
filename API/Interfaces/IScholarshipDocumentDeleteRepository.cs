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
    public interface IScholarshipDocumentDeleteRepository
    {
        Task<ScholarDocument> DeleteDocumentAsync(int scholarId, int documentId);
    }
}