using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.DTOs.DocumentDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/scholar-document")]
    public class ScholarshipDocumentController : ControllerBase
    {
        private readonly IScholarshipDocumentRepository _scholarshipDocumentRepo;
        public ScholarshipDocumentController(IScholarshipDocumentRepository scholarshipDocumentRepo)
        {
            _scholarshipDocumentRepo = scholarshipDocumentRepo;
        }


        [HttpGet("{requesterId}/{documentTypeId}")]
        public async Task<IActionResult> GetDocumentById([FromRoute] int requesterId, [FromRoute] int documentTypeId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var scholarDocuments = await _scholarshipDocumentRepo.GetDocumentsByRequesterIdAndDocumentTypeIdAsync(requesterId, documentTypeId);
                return Ok(scholarDocuments);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{scholarId}/{documentId}")]
        public async Task<IActionResult> DeleteDocument([FromRoute] int scholarId, [FromRoute] int documentId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var deletedDocument = await _scholarshipDocumentRepo.DeleteDocumentAsync(scholarId, documentId);
                if (deletedDocument == null)
                {
                    return NotFound("Doküman bulunamadı.");
                }
                return Ok(deletedDocument);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }
    }
}