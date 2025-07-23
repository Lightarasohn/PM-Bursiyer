using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarsDocumentDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/term-scholar-document")]
    public class TermsOfScholarsDocumentController : ControllerBase
    {
        private readonly ITermsOfScholarsDocumentRepository _repository;

        public TermsOfScholarsDocumentController(ITermsOfScholarsDocumentRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var documents = await _repository.GetAllTermsOfScholarsDocumentsAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("{scholarId}/{termId}/{documentTypeId}")]
        public async Task<IActionResult> GetById(int scholarId, int termId, int documentTypeId)
        {
            try
            {
                var document = await _repository.GetTermsOfScholarsDocumentByIdAsync(scholarId, termId, documentTypeId);
                return Ok(document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Belge getirilemedi: {ex.Message}");
            }
        }

        [HttpGet("by-scholar-term/{scholarId}/{termId}")]
        public async Task<IActionResult> GetByScholarAndTerm(int scholarId, int termId)
        {
            try
            {
                var documents = await _repository.GetTermsOfScholarsDocumentsByScholarAndTermIdAsync(scholarId, termId);
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return BadRequest($"Belge listesi getirilemedi: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TermsOfScholarsDocumentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _repository.AddTermsOfScholarsDocumentAsync(dto);
                return CreatedAtAction(nameof(GetById), new { scholarId = created.ScholarId, termId = created.TermId, documentTypeId = created.DocumentTypeId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest($"Belge eklenemedi: {ex.Message}");
            }
        }

        [HttpPut("{scholarId}/{termId}/{documentTypeId}")]
        public async Task<IActionResult> Update([FromBody] TermsOfScholarsDocumentDTO dto, int scholarId, int termId, int documentTypeId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _repository.UpdateTermsOfScholarsDocumentAsync(dto, scholarId, termId, documentTypeId);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest($"Güncelleme başarısız: {ex.Message}");
            }
        }

        [HttpDelete("{scholarId}/{termId}/{documentTypeId}")]
        public async Task<IActionResult> Delete(int scholarId, int termId, int documentTypeId)
        {
            try
            {
                var deleted = await _repository.DeleteTermsOfScholarsDocumentAsync(scholarId, termId, documentTypeId);
                return Ok(deleted);
            }
            catch (Exception ex)
            {
                return BadRequest($"Silme başarısız: {ex.Message}");
            }
        }
    }
}
