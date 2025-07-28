using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.SozlukDTOs;
using API.Interfaces;
using API.Mappers;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class SozlukRepository : ISozlukRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<SozlukRepository> _logger;

        public SozlukRepository(PostgresContext context, ILogger<SozlukRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Sozluk> AddValueAsync(SozlukDTO sozlukDTO)
        {
            _logger.LogInformation("AddValueAsync executing");
            var sozluk = sozlukDTO.ToModel();
            var addedSozlukResponse = await _context.Sozluks.AddAsync(sozluk);
            await _context.SaveChangesAsync();
            var addedSozluk = addedSozlukResponse.Entity;
            return addedSozluk;
        }

        public async Task<Sozluk> DeleteValueAsync(int id)
        {
            _logger.LogInformation("DeleteValueAsync executing");
            var sozluk = await GetValueByIdAsync(id);
            _context.Remove(sozluk);
            await _context.SaveChangesAsync();
            return sozluk;
        }

        public async Task<IEnumerable<Sozluk>> GetAllDictionaryValues()
        {
            _logger.LogInformation("GetAllDictionaryValues executing");
            return await _context.Sozluks.ToListAsync();
        }

        public Task<List<Sozluk>> GetAllDictionaryValuesByLanguage(string language)
        {
            _logger.LogInformation("GetAllDictionaryValuesByLanguage executing");
            return _context.Sozluks
                .Where(s => s.Dil != null && s.Dil.Equals(language, StringComparison.OrdinalIgnoreCase))
                .ToListAsync();
        }

        public Task<List<Sozluk>> GetAllDictionaryValuesByQuery(SozlukQueryDTO sozlukQueryDTO)
        {
            _logger.LogInformation("GetAllDictionaryValuesByQuery executing");
            var query = _context.Sozluks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(sozlukQueryDTO.SozlukAnahtar))
            {
                query = query.Where(s => s.SozlukAnahtar != null && s.SozlukAnahtar.Contains(sozlukQueryDTO.SozlukAnahtar));
            }

            if (!string.IsNullOrWhiteSpace(sozlukQueryDTO.SozlukDeger))
            {
                query = query.Where(s => s.SozlukDeger != null && s.SozlukDeger.Contains(sozlukQueryDTO.SozlukDeger));
            }

            if (!string.IsNullOrWhiteSpace(sozlukQueryDTO.KullanilanSayfa))
            {
                query = query.Where(s => s.KullanilanSayfa != null && s.KullanilanSayfa.Contains(sozlukQueryDTO.KullanilanSayfa));
            }

            if (!string.IsNullOrWhiteSpace(sozlukQueryDTO.Dil))
            {
                query = query.Where(s => s.Dil != null && s.Dil.Contains(sozlukQueryDTO.Dil));
            }

            return query.ToListAsync();
        }

        public async Task<Sozluk> GetValueByIdAsync(int id)
        {
            _logger.LogInformation("GetValueByIdAsync executing");
            return await _context.Sozluks.FindAsync(id) ?? throw new KeyNotFoundException($"Sozluk with id {id} not found.");
        }

        public async Task<Sozluk> UpdateValueAsync(SozlukDTO sozlukDTO, int id)
        {
            _logger.LogInformation("UpdateValueAsync executing");
            var sozluk = await GetValueByIdAsync(id);
            sozluk.SozlukAnahtar = sozlukDTO.SozlukAnahtar;
            sozluk.SozlukDeger = sozlukDTO.SozlukDeger;
            sozluk.KullanilanSayfa = sozlukDTO.KullanilanSayfa;
            sozluk.Dil = sozlukDTO.Dil;
            await _context.SaveChangesAsync();
            return sozluk;
        }
    }
}