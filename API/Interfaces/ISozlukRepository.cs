using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.SozlukDTOs;
using API.Models;

namespace API.Interfaces
{
    public interface ISozlukRepository
    {
        Task<IEnumerable<Sozluk>> GetAllDictionaryValues();
        Task<Sozluk> GetValueByIdAsync(int id);
        Task<Sozluk> AddValueAsync(SozlukDTO sozlukDTO);
        Task<Sozluk> UpdateValueAsync(SozlukDTO sozlukDTO, int id);
        Task<Sozluk> DeleteValueAsync(int id);
    }
}