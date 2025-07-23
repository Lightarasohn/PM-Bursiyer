using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Term
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public int? ResponsibleAcademician { get; set; }

    public bool Deleted { get; set; }

    public virtual Academician? ResponsibleAcademicianNavigation { get; set; }

    public virtual ICollection<TermDocumentType> TermDocumentTypes { get; set; } = new List<TermDocumentType>();

    public virtual ICollection<TermsOfScholar> TermsOfScholars { get; set; } = new List<TermsOfScholar>();

    public virtual ICollection<TermsOfScholarsDocument> TermsOfScholarsDocuments { get; set; } = new List<TermsOfScholarsDocument>();
}
