using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface IPasswordService
    {
        public bool ComparePassword(byte[] hashedPassword, byte[] salt, string password);
        public List<byte[]> CreatePassword(string password);
    }
}