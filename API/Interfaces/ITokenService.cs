using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Models;

namespace API.Interfaces
{
    public interface ITokenService
    {
        public string CreateToken(User user);
        public string EncryptToken(string jwtToken);
    }
}