using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarsDocumentDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface ITermsOfScholarsDocumentsRepository
    {
        Task<IEnumerable<TermsOfScholarsDocument>> GetAllTermsOfScholarsDocumentsAsync();
        Task<IEnumerable<TermsOfScholarsDocument>> GetTermsOfScholarsDocumentsByScholarAndTermIdAsync(int scholarId, int termId);
        Task<TermsOfScholarsDocument> GetTermsOfScholarsDocumentByIdAsync(int scholarId, int termId, int documentTypeId);
        Task<TermsOfScholarsDocument> AddTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentsDTO termsOfScholarsDocumentsDto);
        Task<TermsOfScholarsDocument> UpdateTermsOfScholarsDocumentAsync(TermsOfScholarsDocumentsDTO termsOfScholarsDocumentsDto, int scholarId, int termId, int documentTypeId);
        Task<TermsOfScholarsDocument> DeleteTermsOfScholarsDocumentAsync(int scholarId, int termId, int documentTypeId);
    }
}