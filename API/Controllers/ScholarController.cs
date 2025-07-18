using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ScholarDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/scholar")]
    public class ScholarController : ControllerBase
    {
        private readonly IScholarRepository _scholarRepo;

        public ScholarController(IScholarRepository scholarRepo)
        {
            _scholarRepo = scholarRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllScholars()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scholars = await _scholarRepo.GetAllScholarsAsync();
                return Ok(scholars);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetScholarById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scholar = await _scholarRepo.GetScholarByIdAsync(id);
                return Ok(scholar);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddScholar([FromBody] ScholarDTO scholarDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scholar = await _scholarRepo.AddScholarAsync(scholarDto);
                return CreatedAtAction(nameof(GetScholarById), new { id = scholar.Id }, scholar);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScholar([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scholar = await _scholarRepo.DeleteScholarAsync(id);
                return Ok(scholar);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateScholar([FromBody] ScholarDTO scholarDto, int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scholar = await _scholarRepo.UpdateScholarAsync(scholarDto, id);
                return Ok(scholar);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }
    }
}
