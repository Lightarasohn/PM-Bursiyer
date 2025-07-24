using System.Threading.Tasks;
using API.DTOs.UserDTOs;
using API.Exceptions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/account")] // controller adını açıkça veriyoruz
    public class AccountController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        public AccountController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var user = await _userRepo.Login(loginDto);
                return Ok(user);
            }
            catch (LoginException loginEx)
            {
                return BadRequest($"Login Error: {loginEx.Message}");
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var user = await _userRepo.Register(registerDto);
                return Ok(user);
            }
            catch (LoginException loginEx)
            {
                return BadRequest($"Login Error: {loginEx.Message}");
            }
        }
    }
}
