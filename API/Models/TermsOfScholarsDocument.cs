using System;
using System.Collections.Generic;

namespace API.Models;

public partial class TermsOfScholarsDocument
{
    public int ScholarId { get; set; }

    public int TermId { get; set; }

    public int DocumentTypeId { get; set; }

    public DateOnly? RealUploadDate { get; set; }

    public bool Deleted { get; set; }

    public virtual DocumentType DocumentType { get; set; } = null!;

    public virtual Scholar Scholar { get; set; } = null!;

    public virtual Term Term { get; set; } = null!;
}
