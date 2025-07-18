using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DocumentTypeDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/document")]
    public class DocumentTypeController : ControllerBase
    {
        private readonly IDocumentTypeRepository _documentTypeRepo;
        public DocumentTypeController(IDocumentTypeRepository documentTypeRepos)
        {
            _documentTypeRepo = documentTypeRepos;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDocumentTypes()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documentTypes = await _documentTypeRepo.GetAllDocumentTypesAsync();
                return Ok(documentTypes);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştur: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentTypeById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documentType = await _documentTypeRepo.GetDocumentTypeByIdAsync(id);
                return Ok(documentType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştur: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddDocumentType([FromBody] DocumentTypeDTO documentTypeDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documentType = await _documentTypeRepo.AddDocumentTypeAsync(documentTypeDTO);
                return CreatedAtAction(nameof(GetDocumentTypeById), new { id = documentType.Id }, documentType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştur: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocumentTypeAsync([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documentType = await _documentTypeRepo.DeleteDocumentTypeAsync(id);
                return Ok(documentType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştur: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocumentTypeAsync([FromBody] DocumentTypeDTO documentTypeDTO, int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var documentType = await _documentTypeRepo.UpdateDocumentTypeAsync(documentTypeDTO, id);
                return Ok(documentType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştur: {ex.Message}");
            }
        }
    }
}