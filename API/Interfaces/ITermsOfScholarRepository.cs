using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface ITermsOfScholarRepository
    {
        Task<IEnumerable<TermsOfScholar>> GetAllTermsOfScholarAsync();
        Task<IEnumerable<TermsOfScholar>> GetTermsOfScholarsByScholarIdAsync(int scholarId);
        Task<IEnumerable<TermsOfScholar>> GetTermsOfScholarsByTermIdAsync(int termId);
        Task<TermsOfScholar> GetTermsOfScholarByIdAsync(int scholarId, int termId);
        Task<TermsOfScholar> AddTermsOfScholarAsync(TermsOfScholarDTO termsOfScholarDto);
        TermsOfScholar AddTermsOfScholar(TermsOfScholarDTO termsOfScholarDTO, bool SAVE_CHANGES);
        Task<TermsOfScholar> UpdateTermsOfScholarAsync(TermsOfScholarDTO termsOfScholarDto, int scholarId, int termId);
        Task<TermsOfScholar> DeleteTermsOfScholarAsync(int scholarId, int termId);
    }
}