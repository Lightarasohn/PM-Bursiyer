using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Scholar
{
    public int Id { get; set; }

    public string NameSurname { get; set; } = null!;

    public bool Deleted { get; set; }

    public string? Email { get; set; }

    public virtual ICollection<ScholarDocument> ScholarDocuments { get; set; } = new List<ScholarDocument>();

    public virtual ICollection<TermsOfScholar> TermsOfScholars { get; set; } = new List<TermsOfScholar>();

    public virtual ICollection<TermsOfScholarsDocument> TermsOfScholarsDocuments { get; set; } = new List<TermsOfScholarsDocument>();
}
