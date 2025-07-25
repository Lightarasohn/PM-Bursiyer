using System;
using System.Collections.Generic;

namespace API.Models;

public partial class TermDocumentType
{
    public int TermId { get; set; }

    public int DocumentTypeId { get; set; }

    public string ListType { get; set; } = null!;

    public virtual DocumentType DocumentType { get; set; } = null!;

    public virtual Term Term { get; set; } = null!;
}
