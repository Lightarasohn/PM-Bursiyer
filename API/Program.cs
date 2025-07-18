using API.Data;
using API.Interfaces;
using API.Models;
using API.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddNewtonsoftJson(option =>
    option.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
);
builder.Services.AddOpenApi();
builder.Services.AddDbContext<PostgresContext>(options => options.UseNpgsql(
    builder.Configuration.GetConnectionString("SupabaseConnection")
));
builder.Services.AddLogging();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "PM Bursiyer API", Version = "v1" });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhostClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Buraya izin vermek istediğin adresi yaz
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



// Dependency Injection
builder.Services.AddScoped<IAcademicianRepository, AcademicianRepository>();
builder.Services.AddScoped<IDocumentTypeRepository, DocumentTypeRepository>();
builder.Services.AddScoped<IScholarRepository, ScholarRepository>();
builder.Services.AddScoped<ITermRepository, TermRepository>();
builder.Services.AddScoped<ITermDocumentTypeRepository, TermDocumentTypeRepository>();
builder.Services.AddScoped<ITermsOfScholarRepository, TermsOfScholarRepository>();
builder.Services.AddScoped<ITermsOfScholarsDocumentRepository, TermsOfScholarsDocumentRepository>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PM Bursiyer API v1")
    );

}

app.UseHttpsRedirection();

app.UseCors("AllowLocalhostClient");

app.UseAuthorization();

app.UseRouting();

app.MapControllers();

app.Run();
