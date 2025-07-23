using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Academician
{
    public int Id { get; set; }

    public string NameSurname { get; set; } = null!;

    public string? Email { get; set; }

    public bool Deleted { get; set; }

    public virtual ICollection<Term> Terms { get; set; } = new List<Term>();
}
