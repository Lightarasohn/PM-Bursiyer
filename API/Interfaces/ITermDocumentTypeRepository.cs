using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermDocumentTypeDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface ITermDocumentTypeRepository
    {
        Task<IEnumerable<TermDocumentType>> GetAllTermDocumentTypesAsync();
        Task<IEnumerable<TermDocumentType>> GetTermDocumentTypesByTermIdAsync(int termId);
        Task<IEnumerable<TermDocumentType>> GetTermDocumentTypesByDocumentTypeIdAsync(int documentTypeId);
        Task<TermDocumentType> GetTermDocumentTypeByIdAsync(int termId, int documentTypeId);
        Task<TermDocumentType> AddTermDocumentTypeAsync(TermDocumentTypeDTO termDocumentTypeDto);
        Task<TermDocumentType> UpdateTermDocumentTypeAsync(TermDocumentTypeDTO termDocumentTypeDto, int termId, int documentTypeId);
        Task<TermDocumentType> DeleteTermDocumentTypeAsync(int termId, int documentTypeId);
        Task<List<TermDocumentType>> AddTermDocumentTypeRangeAsync(List<TermDocumentTypeDTO> termDocumentTypeDto);
        List<TermDocumentType> AddRangeTermDocumentType(List<TermDocumentTypeDTO> termDocumentTypeDtoList, bool SAVE_CHANGES);
    }
}