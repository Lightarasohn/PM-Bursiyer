using System;
using System.Collections.Generic;

namespace API.Models;

public partial class TermsOfScholar
{
    public int ScholarId { get; set; }

    public int TermId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool Deleted { get; set; }

    public virtual Scholar Scholar { get; set; } = null!;

    public virtual Term Term { get; set; } = null!;
}
