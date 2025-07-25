using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ScholarAddDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/scholar-add-full")]
    public class ScholarServiceController : ControllerBase
    {
        private readonly IScholarAddService _scholarAddService;
        public ScholarServiceController(IScholarAddService scholarAddService)
        {
            _scholarAddService = scholarAddService;
        }

        [HttpPost]
        public async Task<IActionResult> AddScholarFull([FromBody] ScholarAddDto scholarAddDto)
        {
            try
            {
                var scholarResponse = await _scholarAddService.AddScholarFull(scholarAddDto);
                return Ok(scholarResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}