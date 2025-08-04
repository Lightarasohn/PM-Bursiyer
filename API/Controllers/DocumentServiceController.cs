using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using API.DTOs.AcademicianDTOs;
using API.DTOs.DocumentDTO;
using API.DTOs.DocumentDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/documentService")]
    public class DocumentServiceController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IScholarshipDocumentDeleteRepository _scholarshipDocumentDeleteRepo;

        public DocumentServiceController(IDocumentService documentService, IScholarshipDocumentDeleteRepository scholarshipDocumentDeleteRepo)
        {
            _documentService = documentService;
            _scholarshipDocumentDeleteRepo = scholarshipDocumentDeleteRepo;
        }
        [HttpPost]
        public async Task<IActionResult> AddDocumentPhsically([FromForm] DocumentAddDTO documentAddDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var document = await _documentService.AddDocumentPhsically(documentAddDTO);
                return Ok(document);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bir Hata Oluştu: {ex.Message}");
            }
        }
        [HttpGet("download")]
        public IActionResult DownloadFile([FromQuery] string filename)
        {
            string decodedFilename = HttpUtility.UrlDecode(filename);
            var fileResult = _documentService.GetFile(decodedFilename);

            if (fileResult == null)
                return NotFound("Dosya bulunamadı veya geçersiz.");

            return File(fileResult.Value.FileContents, fileResult.Value.ContentType, fileResult.Value.FileName);
        }
        [HttpDelete("scholar/{scholarId}/{documentId}")]
        public async Task<IActionResult> DeleteDocument([FromRoute] int scholarId, [FromRoute] int documentId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var deletedDocument = await _scholarshipDocumentDeleteRepo.DeleteDocumentAsync(scholarId, documentId);
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