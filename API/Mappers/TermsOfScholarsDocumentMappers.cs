using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.TermsOfScholarsDocumentDTOs;
using API.Models;

namespace API.Mappers
{
    public static class TermsOfScholarsDocumentMappers
    {
        public static TermsOfScholarsDocument ToModel(this TermsOfScholarsDocumentDTO dto)
        {
            return new TermsOfScholarsDocument
            {
                ScholarId = dto.ScholarId,
                TermId = dto.TermId,
                DocumentTypeId = dto.DocumentTypeId,
                RealUploadDate = dto.RealUploadDate,
                ExpectedUploadDate = dto.ExpectedUploadDate,
                ListType = dto.ListType!,
                Deleted = false
            };
        }

        public static List<TermsOfScholarsDocument> ToModelList(this List<TermsOfScholarsDocumentDTO> dtoList)
        {
            return dtoList.Select(item => item.ToModel()).ToList();
        }
    }
}