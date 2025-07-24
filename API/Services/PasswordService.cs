using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Interfaces;

namespace API.Services
{
    public class PasswordService : IPasswordService
    {
        public bool ComparePassword(byte[]? storedHash, byte[]? storedSalt, string password)
        {
            if (storedHash == null || storedSalt == null || string.IsNullOrEmpty(password))
                return false;

            using (var hmac = new HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                return computedHash.SequenceEqual(storedHash);
            }
        }

        public List<byte[]> CreatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));

            using (var hmac = new HMACSHA512())
            {
                var salt = hmac.Key;
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                return [hash, salt];
            }
        }

    }
}