using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.DTOs.ScholarAddDTOs;
using API.DTOs.ScholarDTOs;
using API.DTOs.TermsOfScholarsDocumentDTOs;
using API.DTOs.TermDTOs;
using API.DTOs.TermsOfScholarDTOs;
using API.Interfaces;
using API.Models;
using API.DTOs.TermDocumentTypeDTOs;
using API.Data;

namespace API.Services
{
    public class ScholarAddService : IScholarAddService
    {
        private readonly PostgresContext _context;
        private readonly IScholarRepository _scholarRepo;
        private readonly ITermRepository _termRepo;
        private readonly ITermsOfScholarRepository _termsOfScholarRepo;
        private readonly ITermDocumentTypeRepository _termDocumentTypeRepo;
        private readonly ITermsOfScholarsDocumentRepository _TermsOfScholarsDocumentRepo;
        private readonly IDocumentTypeRepository _documentTypeRepo;
        public ScholarAddService(IScholarRepository scholarRepository, ITermRepository termRepository,
        ITermsOfScholarRepository termsOfScholarRepository,
        ITermDocumentTypeRepository termDocumentTypeRepository,
        ITermsOfScholarsDocumentRepository TermsOfScholarsDocumentRepository,
        IDocumentTypeRepository documentTypeRepository,
        PostgresContext context)
        {
            _scholarRepo = scholarRepository;
            _termRepo = termRepository;
            _termsOfScholarRepo = termsOfScholarRepository;
            _termDocumentTypeRepo = termDocumentTypeRepository;
            _TermsOfScholarsDocumentRepo = TermsOfScholarsDocumentRepository;
            _documentTypeRepo = documentTypeRepository;
            _context = context;
        }
        public async Task<bool> AddScholarFullAsync(ScholarAddDto scholarAddDto)
        {
            var addedScholar = await addScholarAsync(scholarAddDto.ScholarName, scholarAddDto.ScholarEmail);
            var addedTerm = await addTermAsync(scholarAddDto.TermName, scholarAddDto.TermStartDate, scholarAddDto.TermEndDate, scholarAddDto.TermResponsibleAcademician);
            var termsOfScholarDTO = await addTermOfScholarAsync(addedScholar.Id, addedTerm.Id, null, null);
            var TermsOfDocument = await addTermDocumentAsync(addedTerm.Id, scholarAddDto.EntryDocuments, scholarAddDto.OngoingDocuments, scholarAddDto.ExitDocuments);
            var termsofScholarDocuments = await addTermDocumentToScholarAsync(addedScholar.Id, addedTerm, scholarAddDto.EntryDocuments, scholarAddDto.OngoingDocuments, scholarAddDto.ExitDocuments);


            return true;
        }

        public async Task<bool> AddScholarFull(ScholarAddDto scholarAddDto)
        {
            var addedScholar = AddScholar(scholarAddDto.ScholarName,
                                          scholarAddDto.ScholarEmail,
                                          SAVE_CHANGES: true);
            var addedTerm = AddTerm(scholarAddDto.TermName,
                                    scholarAddDto.TermStartDate,
                                    scholarAddDto.TermEndDate,
                                    scholarAddDto.TermResponsibleAcademician,
                                    SAVE_CHANGES: true);
            var termsOfScholar = AddTermsOfScholar(addedScholar.Id,
                                                   addedTerm.Id,
                                                   scholarStartDate: null,
                                                   scholarEndDate: null,
                                                   SAVE_CHANGES: true);
            var termDocuments = AddTermDocument(addedTerm.Id,
                                                scholarAddDto.EntryDocuments,
                                                scholarAddDto.OngoingDocuments,
                                                scholarAddDto.ExitDocuments,
                                                SAVE_CHANGES: false);
            var termsOfScholarDocuments = AddTermDocumentToScholar(addedScholar.Id,
                                                                   addedTerm,
                                                                   scholarAddDto.EntryDocuments,
                                                                   scholarAddDto.OngoingDocuments,
                                                                   scholarAddDto.ExitDocuments,
                                                                   SAVE_CHANGES: false);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddTermToScholar(ScholarAddNewTermDto scholarAddNewTermDto)
        {
            var scholar = await _scholarRepo.GetScholarByIdAsync(scholarAddNewTermDto.ScholarId);
            if (scholarAddNewTermDto.TermId == 0)
            {
                var addedTerm = AddTerm(scholarAddNewTermDto.TermName,
                                    scholarAddNewTermDto.TermStartDate,
                                    scholarAddNewTermDto.TermEndDate,
                                    scholarAddNewTermDto.TermResponsibleAcademician,
                                    SAVE_CHANGES: true);
                var termsOfScholar = AddTermsOfScholar(scholarAddNewTermDto.ScholarId,
                                                       addedTerm.Id,
                                                       scholarStartDate: null,
                                                       scholarEndDate: null,
                                                       SAVE_CHANGES: true);
                var termDocuments = AddTermDocument(addedTerm.Id,
                                                    scholarAddNewTermDto.EntryDocuments,
                                                    scholarAddNewTermDto.OngoingDocuments,
                                                    scholarAddNewTermDto.ExitDocuments,
                                                    SAVE_CHANGES: false);
                var termsOfScholarDocuments = AddTermDocumentToScholar(scholarAddNewTermDto.ScholarId,
                                                                       addedTerm,
                                                                       scholarAddNewTermDto.EntryDocuments,
                                                                       scholarAddNewTermDto.OngoingDocuments,
                                                                       scholarAddNewTermDto.ExitDocuments,
                                                                       SAVE_CHANGES: false);
                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                var existingTerm = await _termRepo.GetTermByIdAsync(scholarAddNewTermDto.TermId);
                var termsOfScholar = await _termsOfScholarRepo.GetTermsOfScholarByIdAsync(scholarAddNewTermDto.ScholarId, existingTerm.Id);
                if (termsOfScholar != null)
                {
                    throw new Exception($"Scholar ID {scholarAddNewTermDto.ScholarId} için zaten bir dönem kaydı bulunmaktadır.");
                }
                var addedTermsOfScholar = AddTermsOfScholar(scholarAddNewTermDto.ScholarId,
                                                            existingTerm.Id,
                                                            scholarStartDate: null,
                                                            scholarEndDate: null,
                                                            SAVE_CHANGES: true);
                var termDocuments = AddTermDocument(existingTerm.Id,
                                                    scholarAddNewTermDto.EntryDocuments,
                                                    scholarAddNewTermDto.OngoingDocuments,
                                                    scholarAddNewTermDto.ExitDocuments,
                                                    SAVE_CHANGES: false);
                var termsOfScholarDocuments = AddTermDocumentToScholar(scholarAddNewTermDto.ScholarId,
                                                                       existingTerm,
                                                                       scholarAddNewTermDto.EntryDocuments,
                                                                       scholarAddNewTermDto.OngoingDocuments,
                                                                       scholarAddNewTermDto.ExitDocuments,
                                                                       SAVE_CHANGES: false);
                await _context.SaveChangesAsync();
                return true;
            }
        }

        private Scholar AddScholar(string scholarName, string scholarEmail, bool SAVE_CHANGES = true)
        {
            ScholarDTO scholarDto = new ScholarDTO()
            {
                NameSurname = scholarName,
                Email = scholarEmail
            };

            var addedScholar = _scholarRepo.AddScholar(scholarDto, SAVE_CHANGES);
            return addedScholar;
        }

        private Term AddTerm(string termName, DateOnly termStartDate, DateOnly termEndDate, int termResponsibleAcademician, bool SAVE_CHANGES = true)
        {
            TermDTO termDTO = new TermDTO()
            {
                Name = termName,
                StartDate = termStartDate,
                EndDate = termEndDate,
                ResponsibleAcademician = termResponsibleAcademician
            };

            var addedTerm = _termRepo.AddTerm(termDTO, SAVE_CHANGES);
            return addedTerm;
        }

        private TermsOfScholar AddTermsOfScholar(int scholarId, int termId, DateOnly? scholarStartDate, DateOnly? scholarEndDate, bool SAVE_CHANGES = true)
        {
            TermsOfScholarDTO termsOfScholarDTO = new TermsOfScholarDTO()
            {
                ScholarId = scholarId,
                TermId = termId,
                StartDate = scholarStartDate,
                EndDate = scholarEndDate,
            };

            var addedTermsOfScholar = _termsOfScholarRepo.AddTermsOfScholar(termsOfScholarDTO, SAVE_CHANGES);
            return addedTermsOfScholar;
        }

        private List<TermDocumentType> AddTermDocument(int termId, List<int> entryDocuments, List<int> ongoingDocuments, List<int> exitDocuments, bool SAVE_CHANGES = true)
        {
            List<TermDocumentTypeDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ENTRY",
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

            var entryDocumentsAdded = _termDocumentTypeRepo.AddRangeTermDocumentType(entryDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);
            var ongoingDocumentsAdded = _termDocumentTypeRepo.AddRangeTermDocumentType(ongoingDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);
            var exitDocumentsAdded = _termDocumentTypeRepo.AddRangeTermDocumentType(exitDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);

            var allDocuments = entryDocumentsAdded.Concat(ongoingDocumentsAdded).Concat(exitDocumentsAdded).ToList();

            return allDocuments;
        }

        private List<TermsOfScholarsDocument> AddTermDocumentToScholar(int scholarId, Term term, List<int> entryDocuments,List<int> ongoingDocuments,List<int> exitDocuments, bool SAVE_CHANGES = true)
        {
            List<TermsOfScholarsDocumentDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermsOfScholarsDocumentDTO
                {
                    ScholarId = scholarId,
                    TermId = term.Id,
                    DocumentTypeId = item,
                    ListType = "ENTRY",
                    ExpectedUploadDate = term.StartDate
                }
            ).ToList();

            List<TermsOfScholarsDocumentDTO> ongoingDocumentTypeDtos = new List<TermsOfScholarsDocumentDTO>();
            foreach (var item in ongoingDocuments)
            {
                var expectedUploadDate = term.StartDate;
                var documentType = _documentTypeRepo.GetDocumentTypeByIdAsync(item).Result;
                int frequency = documentType.UploadFrequency ?? 1;

                while (expectedUploadDate <= term.EndDate)
                {
                    ongoingDocumentTypeDtos.Add(new TermsOfScholarsDocumentDTO
                    {
                        ScholarId = scholarId,
                        TermId = term.Id,
                        DocumentTypeId = item,
                        ListType = "ONGOING",
                        ExpectedUploadDate = expectedUploadDate
                    });
                    expectedUploadDate = expectedUploadDate.AddMonths(frequency);
                }
            }

             List<TermsOfScholarsDocumentDTO> exitDocumentTypeDtos = exitDocuments.Select(item =>
                new TermsOfScholarsDocumentDTO
                {
                    ScholarId = scholarId,
                    TermId = term.Id,
                    DocumentTypeId = item,
                    ListType = "EXIT",
                    ExpectedUploadDate = term.EndDate
                }
            ).ToList();

            var entryDocumentsAdded = _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocument(entryDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);
            var ongoingDocumentsAdded = _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocument(ongoingDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);
            var exitDocumentsAdded = _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocument(exitDocumentTypeDtos, SAVE_CHANGES: SAVE_CHANGES);

            var allDocuments = entryDocumentsAdded.Concat(ongoingDocumentsAdded).Concat(exitDocumentsAdded).ToList();

            return allDocuments;
        }

        private async Task<Scholar> addScholarAsync(string scholarName, string scholarEmail)
        {
            ScholarDTO scholarDto = new ScholarDTO()
            {
                NameSurname = scholarName,
                Email = scholarEmail
            };

            var addedScholar = await _scholarRepo.AddScholarAsync(scholarDto);
            return addedScholar;
        }
        private async Task<Term> addTermAsync(string termName, DateOnly termStartDate, DateOnly termEndDate, int termResponsibleAcademician)
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
        private async Task<TermsOfScholar> addTermOfScholarAsync(int scholarId, int termId, DateOnly? scholarStartDate, DateOnly? scholarEndDate)
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
        private async Task<List<TermDocumentType>> addTermDocumentAsync(int termId, List<int> entryDocuments, List<int> ongoingDocuments, List<int> exitDocuments)
        {
            List<TermDocumentTypeDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermDocumentTypeDTO
                {
                    TermId = termId,
                    DocumentTypeId = item,
                    ListType = "ENTRY",
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
        
        private async Task<List<TermsOfScholarsDocument>> addTermDocumentToScholarAsync(int scholarId, Term term, List<int> entryDocuments,List<int> ongoingDocuments,List<int> exitDocuments)
        {
            List<TermsOfScholarsDocumentDTO> entryDocumentTypeDtos = entryDocuments.Select(item =>
                new TermsOfScholarsDocumentDTO
                {
                    ScholarId = scholarId,
                    TermId = term.Id,
                    DocumentTypeId = item,
                    ListType = "ENTRY",
                    ExpectedUploadDate = term.StartDate
                }
            ).ToList();

            List<TermsOfScholarsDocumentDTO> ongoingDocumentTypeDtos = new List<TermsOfScholarsDocumentDTO>();
            foreach (var item in ongoingDocuments)
            {
                var expectedUploadDate = term.StartDate;
                var documentType = await _documentTypeRepo.GetDocumentTypeByIdAsync(item);
                int frequency = documentType.UploadFrequency ?? 1;

                while (expectedUploadDate <= term.EndDate)
                {
                    ongoingDocumentTypeDtos.Add(new TermsOfScholarsDocumentDTO
                    {
                        ScholarId = scholarId,
                        TermId = term.Id,
                        DocumentTypeId = item,
                        ListType = "ONGOING",
                        ExpectedUploadDate = expectedUploadDate
                    });
                    expectedUploadDate = expectedUploadDate.AddMonths(frequency);
                }
            }

             List<TermsOfScholarsDocumentDTO> exitDocumentTypeDtos = exitDocuments.Select(item =>
                new TermsOfScholarsDocumentDTO
                {
                    ScholarId = scholarId,
                    TermId = term.Id,
                    DocumentTypeId = item,
                    ListType = "EXIT",
                    ExpectedUploadDate = term.EndDate
                }
            ).ToList();

            var entryDocumentsAdded = await _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocumentAsync(entryDocumentTypeDtos);
            var ongoingDocumentsAdded = await _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocumentAsync(ongoingDocumentTypeDtos);
            var exitDocumentsAdded = await _TermsOfScholarsDocumentRepo.AddRangeTermsOfScholarsDocumentAsync(exitDocumentTypeDtos);

            var allDocuments = entryDocumentsAdded.Concat(ongoingDocumentsAdded).Concat(exitDocumentsAdded).ToList();

            return new();
        }
    }
}