using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Interfaces;
using API.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class SystemConstantsRepository : ISystemConstantsRepository
    {
        private readonly PostgresContext _context;
        private readonly ILogger<SystemConstantsRepository> _logger;
        public SystemConstantsRepository(PostgresContext context, ILogger<SystemConstantsRepository> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<IEnumerable<SystemConstant>> GetAllSystemContantsAsync()
        {
            var systemConstants = await _context.SystemConstants.ToListAsync();
            return systemConstants;
        }

        public async Task<IEnumerable<SystemConstant>> GetSystemConstantsWithQueryStringAsync(string query)
        {
            return String.IsNullOrWhiteSpace(query) ? await _context.SystemConstants.ToListAsync()
                                                    : await _context.SystemConstants
                                                            .Where(s =>
                                                            s.ConstantName.ToLower().Contains(query.ToLower())
                                                            || s.ValueText != null && s.ValueText.ToLower().Contains(query.ToLower())).ToListAsync();
        }
    }
}