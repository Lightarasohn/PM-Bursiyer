using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Document
{
    public int Id { get; set; }

    public int DocSource { get; set; }

    public int? DocSourceTableId { get; set; }

    public int? DocTypeId { get; set; }

    public string? DocInfo { get; set; }

    public string? Title { get; set; }

    public string? DocName { get; set; }

    public string? Extension { get; set; }

    public string? Path { get; set; }

    public string? FullPath { get; set; }

    public string? GrantedRoles { get; set; }

    public int? CreUser { get; set; }

    public DateOnly? CreDate { get; set; }

    public int? UpdUser { get; set; }

    public DateOnly? UpdDate { get; set; }

    public int? DelUser { get; set; }

    public DateOnly? DelDate { get; set; }

    public bool? Deleted { get; set; }

    public virtual DocumentSource DocSourceNavigation { get; set; } = null!;

    public virtual ICollection<ScholarDocument> ScholarDocuments { get; set; } = new List<ScholarDocument>();
}
