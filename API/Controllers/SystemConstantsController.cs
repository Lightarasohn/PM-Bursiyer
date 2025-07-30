using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/system-constant")]
    public class SystemConstantsController : ControllerBase
    {
        private readonly ISystemConstantsRepository _systemConstantsRepo;
        public SystemConstantsController(ISystemConstantsRepository systemConstantsRepo)
        {
            _systemConstantsRepo = systemConstantsRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var systemConstants = await _systemConstantsRepo.GetAllSystemContantsAsync();
                return Ok(systemConstants);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{q}")]
        public async Task<IActionResult> GetAllQuery([FromRoute] string q)
        {
            try
            {
                var systemConstants = await _systemConstantsRepo.GetSystemConstantsWithQueryStringAsync(q);
                return Ok(systemConstants);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}