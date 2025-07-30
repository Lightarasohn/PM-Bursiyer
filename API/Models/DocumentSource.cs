using System;
using System.Collections.Generic;

namespace API.Models;

public partial class DocumentSource
{
    public int Id { get; set; }

    public string? SourceName { get; set; }

    public int? CreUser { get; set; }

    public DateOnly? CreDate { get; set; }

    public int? UpdUser { get; set; }

    public DateOnly? UpdDate { get; set; }

    public int? DelUser { get; set; }

    public DateOnly? DelDate { get; set; }

    public bool? Deleted { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
}
