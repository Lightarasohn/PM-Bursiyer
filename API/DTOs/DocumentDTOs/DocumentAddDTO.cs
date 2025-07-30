using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.DocumentDTOs
{
    public class DocumentAddDTO
    {
        public int CreUserId { get; set; }

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
    }
}