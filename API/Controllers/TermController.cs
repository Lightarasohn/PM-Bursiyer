using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/term")]
    public class TermController : ControllerBase
    {
        private readonly ITermRepository _termRepo;

        public TermController(ITermRepository termRepo)
        {
            _termRepo = termRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTerms()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var terms = await _termRepo.GetAllTermsAsync();
                return Ok(terms);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTermById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var term = await _termRepo.GetTermByIdAsync(id);
                return Ok(term);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddTerm([FromBody] TermDTO termDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var term = await _termRepo.AddTermAsync(termDto);
                return CreatedAtAction(nameof(GetTermById), new { id = term.Id }, term);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTerm([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var term = await _termRepo.DeleteTermAsync(id);
                return Ok(term);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTerm([FromBody] TermDTO termDto, int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var term = await _termRepo.UpdateTermAsync(termDto, id);
                return Ok(term);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }
    }
}
