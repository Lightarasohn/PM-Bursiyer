using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.UserDTOs;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        public Task<LoggedInUser> Login(LoginDto loginDto);
        public Task<RegisteredUser> Register(RegisterDto registerDto);
    }
}