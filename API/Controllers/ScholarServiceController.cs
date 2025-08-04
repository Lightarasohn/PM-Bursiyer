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
    [Route("api/scholar-service")]
    public class ScholarServiceController : ControllerBase
    {
        private readonly IScholarAddService _scholarAddService;
        public ScholarServiceController(IScholarAddService scholarAddService)
        {
            _scholarAddService = scholarAddService;
        }

        [HttpPost("add-scholar-async")]
        public async Task<IActionResult> AddScholarFullAsync([FromBody] ScholarAddDto scholarAddDto)
        {
            try
            {
                var scholarResponse = await _scholarAddService.AddScholarFullAsync(scholarAddDto);
                return Ok(scholarResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("add-scholar")]
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

        [HttpPost("add-term-to-scholar")]
        public async Task<IActionResult> AddTermToScholar([FromBody] ScholarAddNewTermDto scholarAddNewTermDto)
        {
            try
            {
                var scholarResponse = await _scholarAddService.AddTermToScholar(scholarAddNewTermDto);
                return Ok(scholarResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}