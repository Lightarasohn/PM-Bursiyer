using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.UserDTOs;
using API.Exceptions;
using API.Interfaces;
using API.Mappers;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ITokenService _tokenService;
        private readonly PostgresContext _context;
        private readonly IPasswordService _passwordService;
        public UserRepository(ITokenService tokenService, PostgresContext context, IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }
        public async Task<LoggedInUser> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == loginDto.Email) ?? throw new LoginException("Wrong password or email");

            if (_passwordService.ComparePassword(user.Password!, user.PasswordSalt!, loginDto.Password!))
            {
                var username = DecryptUsername(user.Username!);
                user.Username = username;
                var userToken = _tokenService.CreateToken(user);
                var loggedinuser = user.ToLogin(userToken);
                return loggedinuser;
            }
            else
            {
                throw new LoginException("Wrong Password");
            }
        }

        public async Task<RegisteredUser> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(x => x.Email == registerDto.Email)) throw new Exception("User already exist");

            var passwordList = _passwordService.CreatePassword(registerDto.Password!);
            var password = passwordList[0];
            var passwordSalt = passwordList[1];
            var username = EncryptUsername(registerDto.Email!);
            var user = registerDto.ToModel(password: password,
            passwordSalt: passwordSalt, username: username);
            var addedUsername = await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            addedUsername.Entity.CreUser = addedUsername.Entity.Id;
            await _context.SaveChangesAsync();
            return addedUsername.Entity.ToRegistered();
        }

        private string DecryptUsername(string encryptedUsername)
        {
            if (string.IsNullOrEmpty(encryptedUsername))
            {
                return string.Empty;
            }
        
            try
            {
                var decodedBytes = Convert.FromBase64String(encryptedUsername);
                return Encoding.UTF8.GetString(decodedBytes);
            }
            catch (FormatException)
            {
                return encryptedUsername;
            }
        }

        private string EncryptUsername(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return string.Empty;
            }

            var usernameBytes = Encoding.UTF8.GetBytes(email);
            return Convert.ToBase64String(usernameBytes);
        }
    }
}