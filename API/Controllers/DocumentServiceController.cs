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
    [Route("api/documentService")]
    public class DocumentServiceController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IDocumentRepository _documentRepository;
        public DocumentServiceController(IDocumentService documentService)
        {
            _documentService = documentService;
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
    }
}