using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/document")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentRepository _documentRepository;
        public DocumentController(IDocumentRepository documentRepository)
        {
            _documentRepository = documentRepository;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllDocuments()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documents = await _documentRepository.GetAllDocumentsAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var document = await _documentRepository.GetDocumentById(id);
                return Ok(document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var document = await _documentRepository.DeleteDocumentAsync(id);
                return Ok(document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpPost("{creUserId}")]
        public async Task<IActionResult> AddDocument([FromBody] DocumentDTO documentDTO , [FromRoute]int creUserId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var document = await _documentRepository.AddDocumentAsync(documentDTO, creUserId);
                return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument([FromRoute] int id,[FromBody] DocumentUpdateDTO documentUpdateDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var document = await _documentRepository.UpdateDocumentAsync( id, documentUpdateDTO);
                return Ok(document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }
    }
}