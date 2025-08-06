using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/term-scholar")]
    public class TermsOfScholarController : ControllerBase
    {
        private readonly ITermsOfScholarRepository _termsOfScholarRepo;

        public TermsOfScholarController(ITermsOfScholarRepository termsOfScholarRepo)
        {
            _termsOfScholarRepo = termsOfScholarRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termsOfScholarRepo.GetAllTermsOfScholarAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("{scholarId}/{termId}")]
        public async Task<IActionResult> GetById(int scholarId, int termId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termsOfScholarRepo.GetTermsOfScholarByIdAsync(scholarId, termId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("by-scholar/{scholarId}")]
        public async Task<IActionResult> GetByScholarId(int scholarId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termsOfScholarRepo.GetTermsOfScholarsByScholarIdAsync(scholarId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("by-term/{termId}")]
        public async Task<IActionResult> GetByTermId(int termId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termsOfScholarRepo.GetTermsOfScholarsByTermIdAsync(termId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TermsOfScholarDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _termsOfScholarRepo.AddTermsOfScholarAsync(dto);
                return CreatedAtAction(nameof(GetById), new { scholarId = created.ScholarId, termId = created.TermId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckInScholar([FromQuery] int scholarId, [FromQuery] int termId)
        {
            var result = await _termsOfScholarRepo.CheckInScholarAsync(scholarId, termId);
            return Ok(result);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOutScholar([FromQuery] int scholarId, [FromQuery] int termId, [FromQuery] DateTime endDate)
        {
            var result = await _termsOfScholarRepo.CheckOutScholarAsync(scholarId, termId, endDate);
            return Ok(result);
        }

        [HttpPut("{scholarId}/{termId}")]
        public async Task<IActionResult> Update([FromBody] TermsOfScholarDTO dto, int scholarId, int termId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _termsOfScholarRepo.UpdateTermsOfScholarAsync(dto, scholarId, termId);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{scholarId}/{termId}")]
        public async Task<IActionResult> Delete(int scholarId, int termId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var deleted = await _termsOfScholarRepo.DeleteTermsOfScholarAsync(scholarId, termId);
                return Ok(deleted);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }
    }
}
