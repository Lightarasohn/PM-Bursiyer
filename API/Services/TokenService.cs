using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Interfaces;
using API.Models;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly SymmetricSecurityKey _key;
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SIGNINKEY"] ?? throw new Exception("Token oluşturulamadı")));
        }
        public string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.GivenName, user.Username!),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.NameId, user.Id.ToString())
            };

            var singinCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Expires = DateTime.Now.AddDays(7),
                Audience = _configuration["JWT:AUDIENCE"],
                Issuer = _configuration["JWT:ISSUER"],
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = singinCredentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            var encryptedToken = EncryptToken(jwtToken);

            return encryptedToken;
        }

       public string EncryptToken(string jwtToken)
{
    var key = Encoding.UTF8.GetBytes(_configuration["JWT:ENCRYPTIONKEY"] ?? throw new Exception("Encryption key not found"));
    using var aes = Aes.Create();
    aes.Key = key;
    aes.GenerateIV();

    using var encryptor = aes.CreateEncryptor();
    using var ms = new MemoryStream();

    // IV'yi başa yaz
    ms.Write(aes.IV, 0, aes.IV.Length);

    using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
    using (var writer = new StreamWriter(cs))
    {
        writer.Write(jwtToken);
    }  // Burada writer.Dispose() ve cs.Dispose() çağrılır, flush yapılır

    return Convert.ToBase64String(ms.ToArray());
}
    }
}