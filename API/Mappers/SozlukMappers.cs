using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.SozlukDTOs;
using API.Models;

namespace API.Mappers
{
    public static class SozlukMappers
    {
        public static Sozluk ToModel(this SozlukDTO sozlukDTO)
        {
            return new Sozluk
            {
                SozlukAnahtar = sozlukDTO.SozlukAnahtar,
                SozlukDeger = sozlukDTO.SozlukDeger,
                KullanilanSayfa = sozlukDTO.KullanilanSayfa,
                Dil = sozlukDTO.Dil
            };
        }
    }
}