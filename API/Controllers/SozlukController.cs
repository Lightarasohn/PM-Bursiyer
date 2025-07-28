using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.SozlukDTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/sozluk")]
    public class SozlukController : ControllerBase
    {
        private readonly ISozlukRepository _sozlukRepository;

        public SozlukController(ISozlukRepository sozlukRepository)
        {
            _sozlukRepository = sozlukRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var sozlukler = await _sozlukRepository.GetAllDictionaryValues();
                return Ok(sozlukler);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var sozluk = await _sozlukRepository.GetValueByIdAsync(id);
                return Ok(sozluk);
            }
            catch (KeyNotFoundException knfEx)
            {
                return NotFound(knfEx.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] SozlukDTO sozlukDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var sozluk = await _sozlukRepository.AddValueAsync(sozlukDTO);
                return CreatedAtAction(nameof(GetById), new { id = sozluk.Id }, sozluk);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SozlukDTO sozlukDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var updatedSozluk = await _sozlukRepository.UpdateValueAsync(sozlukDTO, id);
                return Ok(updatedSozluk);
            }
            catch (KeyNotFoundException knfEx)
            {
                return NotFound(knfEx.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var deletedSozluk = await _sozlukRepository.DeleteValueAsync(id);
                return Ok(deletedSozluk);
            }
            catch (KeyNotFoundException knfEx)
            {
                return NotFound(knfEx.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("query")]
        public async Task<IActionResult> GetByQuery([FromBody] SozlukQueryDTO sozlukQueryDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var sozlukler = await _sozlukRepository.GetAllDictionaryValuesByQuery(sozlukQueryDTO);
                return Ok(sozlukler);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}