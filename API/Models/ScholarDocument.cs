using System;
using System.Collections.Generic;

namespace API.Models;

public partial class ScholarDocument
{
    public int Id { get; set; }

    public int? ScholarId { get; set; }

    public int DocumentId { get; set; }

    public int? CreUser { get; set; }

    public DateOnly? CreDate { get; set; }

    public int? UpdUser { get; set; }

    public DateOnly? UpdDate { get; set; }

    public int? DelUser { get; set; }

    public DateOnly? DelDate { get; set; }

    public bool? Deleted { get; set; }

    public virtual Document Document { get; set; } = null!;

    public virtual Scholar? Scholar { get; set; }
}
