using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.DTOs.ScholarAddDTOs;
using API.DTOs.ScholarDTOs;
using API.DTOs.TermDocumentTypeDTOs;
using API.DTOs.TermDTOs;
using API.DTOs.TermsOfScholarDTOs;
using API.Interfaces;
using API.Models;

namespace API.Services
{
    public class ScholarAddService : IScholarAddService
    {
        private readonly IScholarRepository _scholarRepo;
        private readonly ITermRepository _termRepo;
        private readonly ITermsOfScholarRepository _termsOfScholarRepo;
        private readonly ITermDocumentTypeRepository _termDocumentTypeRepo;
        private readonly ITermsOfScholarsDocumentRepository _termsOfScholarsDocumentRepo;
        public ScholarAddService(IScholarRepository scholarRepository, ITermRepository termRepository,
        ITermsOfScholarRepository termsOfScholarRepository,
        ITermDocumentTypeRepository termDocumentTypeRepository,
        ITermsOfScholarsDocumentRepository termsOfScholarsDocumentRepository)
        {
            _scholarRepo = scholarRepository;
            _termRepo = termRepository;
            _termsOfScholarRepo = termsOfScholarRepository;
            _termDocumentTypeRepo = termDocumentTypeRepository;
            _termsOfScholarsDocumentRepo = termsOfScholarsDocumentRepository;
        }
        public async Task<bool> AddScholarFull(ScholarAddDto scholarAddDto)
        {
            var addedScholar = await addScholar(scholarAddDto.ScholarName, scholarAddDto.ScholarEmail);
            var addedTerm = await addTerm(scholarAddDto.TermName, scholarAddDto.TermStartDate, scholarAddDto.TermEndDate, scholarAddDto.TermResponsibleAcademician);
            var termsOfScholarDTO = await addTermOfScholar(addedScholar.Id, addedTerm.Id, null, null);
            var termDocumentTypeDto = await addTermDocument(addedTerm.Id, scholarAddDto.EntryDocuments, scholarAddDto.OngoingDocuments, scholarAddDto.ExitDocuments);

            throw new NotImplementedException();
        }
        private async Task<Scholar> addScholar(string scholarName, string scholarEmail)
        {
            ScholarDTO scholarDto = new ScholarDTO()
            {
                NameSurname = scholarName,
                Email = scholarEmail
            };

            var addedScholar = await _scholarRepo.AddScholarAsync(scholarDto);
            return addedScholar;
        }
        private async Task<Term> addTerm(string termName, DateOnly termStartDate, DateOnly termEndDate, int termResponsibleAcademician)
        {
            TermDTO termDTO = new TermDTO()
            {
                Name = termName,
                StartDate = termStartDate,
                EndDate = termEndDate,
                ResponsibleAcademician = termResponsibleAcademician
            };

            var addedTerm = await _termRepo.AddTermAsync(termDTO);
            return addedTerm;
        }
        private async Task<TermsOfScholar> addTermOfScholar(int scholarId, int termId, DateOnly? scholarStartDate, DateOnly? scholarEndDate)
        {
            TermsOfScholarDTO termsOfScholarDTO = new TermsOfScholarDTO()
            {
                ScholarId = scholarId,
                TermId = termId,
                StartDate = scholarStartDate,
                EndDate = scholarEndDate,
            };

            var addedTermsOfScholar = await _termsOfScholarRepo.AddTermsOfScholarAsync(termsOfScholarDTO);
            return addedTermsOfScholar;
        }
        private async Task<List<TermDocumentType>> addTermDocument(int termId, List<int> entryDocuments, List<int> ongoingDocuments, List<int> exitDocuments)
        {
            List<TermDocumentTypeDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ENTRY"
                }
            ).ToList();

            List<TermDocumentTypeDTO> ongoingDocumentTypeDtos = ongoingDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ONGOING"
                }
            ).ToList();

            List<TermDocumentTypeDTO> exitDocumentTypeDtos = exitDocuments.Select(item =>
               new TermDocumentTypeDTO
               {
                   TermId = termId,
                   DocumentTypeId = item,
                   ListType = "EXIT"
               }
           ).ToList();

            var entryDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(entryDocumentTypeDtos);
            var ongoingDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(ongoingDocumentTypeDtos);
            var exitDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(exitDocumentTypeDtos);

            var allDocuments = entryDocumentsAdded.Concat(ongoingDocumentsAdded).Concat(exitDocumentsAdded).ToList();

            return allDocuments;
        }
        
        private async Task<List<TermsOfScholarsDocument>> addTermDocumentToScholar(int scholarId,int termId, int termDocumentType,List<int> entryDocuments,List<int> ongoingDocuments,List<int> exitDocuments)
        {
            List<TermDocumentTypeDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ENTRY"
                }
            ).ToList();

            List<TermDocumentTypeDTO> ongoingDocumentTypeDtos = ongoingDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ONGOING"
                }
            ).ToList();

             List<TermDocumentTypeDTO> exitDocumentTypeDtos = exitDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "EXIT"
                }
            ).ToList();

            var entryDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(entryDocumentTypeDtos);
            var ongoingDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(ongoingDocumentTypeDtos);
            var exitDocumentsAdded = await _termDocumentTypeRepo.AddTermDocumentTypeRangeAsync(exitDocumentTypeDtos);

            var allDocuments = entryDocumentsAdded.Concat(ongoingDocumentsAdded).Concat(exitDocumentsAdded).ToList();

            return new();
        }

    }
}