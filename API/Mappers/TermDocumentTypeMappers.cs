using API.DTOs.TermDocumentTypeDTOs;
using API.Models;

namespace API.Mappers
{
    public static class TermDocumentTypeMapper
    {
        public static TermDocumentType ToModel(this TermDocumentTypeDTO dto)
        {
            return new TermDocumentType
            {
                TermId = dto.TermId,
                DocumentTypeId = dto.DocumentTypeId,
                ExpectedUploadDate = dto.ExpectedUploadDate,
                ListType = dto.ListType
            };
        }
    }
}
