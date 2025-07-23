using System;
using System.Collections.Generic;

namespace API.Models;

public partial class SystemConstant
{
    public int Id { get; set; }

    public string ConstantName { get; set; } = null!;

    public string? ValueText { get; set; }
}
