using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermDocumentTypeDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/term-document")]
    public class TermDocumentTypeController : ControllerBase
    {
        private readonly ITermDocumentTypeRepository _termDocumentTypeRepo;

        public TermDocumentTypeController(ITermDocumentTypeRepository termDocumentTypeRepo)
        {
            _termDocumentTypeRepo = termDocumentTypeRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.GetAllTermDocumentTypesAsync();
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
                var result = await _termDocumentTypeRepo.GetTermDocumentTypesByTermIdAsync(termId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("by-document/{documentTypeId}")]
        public async Task<IActionResult> GetByDocumentTypeId(int documentTypeId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.GetTermDocumentTypesByDocumentTypeIdAsync(documentTypeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("{termId}/{documentTypeId}")]
        public async Task<IActionResult> GetByIds(int termId, int documentTypeId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.GetTermDocumentTypeByIdAsync(termId, documentTypeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TermDocumentTypeDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.AddTermDocumentTypeAsync(dto);
                return CreatedAtAction(nameof(GetByIds), new { termId = result.TermId, documentTypeId = result.DocumentTypeId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPut("{termId}/{documentTypeId}")]
        public async Task<IActionResult> Update([FromBody] TermDocumentTypeDTO dto, int termId, int documentTypeId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.UpdateTermDocumentTypeAsync(dto, termId, documentTypeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{termId}/{documentTypeId}")]
        public async Task<IActionResult> Delete(int termId, int documentTypeId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _termDocumentTypeRepo.DeleteTermDocumentTypeAsync(termId, documentTypeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }
    }
}
