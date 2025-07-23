using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Models;

namespace API.Interfaces
{
    public interface ISystemConstantsRepository
    {
        Task<IEnumerable<SystemConstant>> GetAllSystemContantsAsync();
        Task<IEnumerable<SystemConstant>> GetSystemConstantsWithQueryStringAsync(string query);
    }
}