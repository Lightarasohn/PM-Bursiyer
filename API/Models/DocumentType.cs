using System;
using System.Collections.Generic;

namespace API.Models;

public partial class DocumentType
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool Deleted { get; set; }

    public virtual ICollection<TermDocumentType> TermDocumentTypes { get; set; } = new List<TermDocumentType>();

    public virtual ICollection<TermsOfScholarsDocument> TermsOfScholarsDocuments { get; set; } = new List<TermsOfScholarsDocument>();
}
