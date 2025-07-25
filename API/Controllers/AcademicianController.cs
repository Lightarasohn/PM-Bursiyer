using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/academician")]
    public class AcademicianController : ControllerBase
    {
        private readonly IAcademicianRepository _academicianRepo;
        public AcademicianController(IAcademicianRepository academicianRepo)
        {
            _academicianRepo = academicianRepo;
        }




        [HttpGet]
        public async Task<IActionResult> GetAllAcademicians()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var academicians = await _academicianRepo.GetAllAcademiciansAsync();
                return Ok(academicians);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAcademicianById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var academician = await _academicianRepo.GetAcademicianByIdAsync(id);
                return Ok(academician);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAcademicianById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var academician = await _academicianRepo.DeleteAcademicianAsync(id);
                return Ok(academician);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddAcademicianAsync([FromBody] AcademicianDTO academicianDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var academician = await _academicianRepo.AddAcademicianAsync(academicianDto);
                return CreatedAtAction(nameof(GetAcademicianById), new { id = academician.Id }, academician);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAcademicianAsync([FromBody] AcademicianDTO academicianDto, [FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var academician = await _academicianRepo.UpdateAcademicianAsync(academicianDto, id);
                return Ok(academician);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }
    }
}