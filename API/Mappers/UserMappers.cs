using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.UserDTOs;
using API.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace API.Mappers
{
    public static class UserMappers
    {
        public static LoggedInUser ToLogin(this User user, string token)
        {
            return new LoggedInUser
            {
                Id = user.Id,
                NameSurname = user.NameSurname,
                Username = user.Username,
                UserType = user.UserType,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                BillingNumber = user.BillingNumber,
                FirmName = user.FirmName,
                TaxOfficeName = user.TaxOfficeName,
                Token = token
            };
        }

        public static User ToModel(this RegisterDto dto,
        byte[] password, byte[] passwordSalt, string username)
        {
            return new User
            {
                Password = password,
                PasswordSalt = passwordSalt,
                Username = username,
                FirmId = 1,
                NameSurname = dto.NameSurname,
                UserType = "Member",
                Email = dto.Email,
                Phone = dto.Phone,
                Address = "",
                BillingNumber = "",
                FirmName = "",
                TaxOfficeName = "",
                Language = dto.Language,
                CreDate = DateOnly.FromDateTime(DateTime.Now),
                Deleted = false
            };
        }

        public static RegisteredUser ToRegistered(this User user)
        {
            return new RegisteredUser
            {
                Id = user.Id,
                NameSurname = user.NameSurname,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Language = user.Language
            };
        }
    }
}