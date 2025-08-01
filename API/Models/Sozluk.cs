using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Sozluk
{
    public int Id { get; set; }

    public string? SozlukAnahtar { get; set; }

    public string? SozlukDeger { get; set; }

    public string? KullanilanSayfa { get; set; }

    public string? Dil { get; set; }

    public bool? Deleted { get; set; }
}
