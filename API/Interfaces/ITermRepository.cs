using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface ITermRepository
    {
        Task<IEnumerable<Term>> GetAllTermsAsync();
        Task<Term> GetTermByIdAsync(int id);
        Task<Term> AddTermAsync(TermDTO termDto);
        Term AddTerm(TermDTO termDTO, bool SAVE_CHANGES);
        Task<Term> UpdateTermAsync(TermDTO termDto, int id);
        Task<Term> DeleteTermAsync(int id);
    }
}