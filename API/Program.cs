using System.Text;
using System.Text.Unicode;
using API.Data;
using API.Interfaces;
using API.Models;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Configure(context.Configuration.GetSection("Kestrel"));
});


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

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "PM Bursiyer API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
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

builder.Services.AddAuthentication(options =>
    options.DefaultScheme =
    options.DefaultSignInScheme =
    options.DefaultForbidScheme =
    options.DefaultSignOutScheme =
    options.DefaultChallengeScheme =
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme
).
AddJwtBearer(options =>
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidIssuer = builder.Configuration["JWT:ISSUER"],
    ValidateAudience = true,
    ValidAudience = builder.Configuration["JWT:AUDIENCE"],
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:SIGNINKEY"]!))
});


builder.Services.AddAuthorization();

//smtpSettings
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));

// Dependency Injection
builder.Services.AddScoped<IAcademicianRepository, AcademicianRepository>();
builder.Services.AddScoped<IDocumentTypeRepository, DocumentTypeRepository>();
builder.Services.AddScoped<IScholarRepository, ScholarRepository>();
builder.Services.AddScoped<ITermRepository, TermRepository>();
builder.Services.AddScoped<ITermDocumentTypeRepository, TermDocumentTypeRepository>();
builder.Services.AddScoped<ITermsOfScholarRepository, TermsOfScholarRepository>();
builder.Services.AddScoped<ITermsOfScholarsDocumentRepository, TermsOfScholarsDocumentRepository>();
builder.Services.AddScoped<ISystemConstantsRepository, SystemConstantsRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IScholarAddService, ScholarAddService>();
builder.Services.AddScoped<ISozlukRepository, SozlukRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IScholarshipDocumentRepository, ScholarshipDocumentRepository>();
builder.Services.AddScoped<IScholarshipDocumentDeleteRepository, ScholarshipDocumentDeleteService>();



var app = builder.Build();

//app.Use(async (context, next) =>
//{
    
//    var originalBodyStream = context.Response.Body;
//    await using var responseBody = new MemoryStream();
//    context.Response.Body = responseBody;

//    try
//    {
//        await next(); 

//        if (context.Response.StatusCode >= 400 && context.Response.StatusCode < 500)
//        {
//            if (context.Response.StatusCode != 404)
//            {
//                context.Response.Body.Seek(0, SeekOrigin.Begin);
//                string responseText = await new StreamReader(context.Response.Body).ReadToEndAsync();
//                context.Response.Body.Seek(0, SeekOrigin.Begin);

//                var emailService = context.RequestServices.GetRequiredService<IEmailService>();
//                await emailService.SendEmailToAdmin($@"
//                                                    Status: {context.Response.StatusCode}
//                                                    Path: {context.Request.Path}
//                                                    Response Body: {responseText}");
//            }
//        }
//    }
//    catch (Exception ex)
//    {
//        var emailService = context.RequestServices.GetRequiredService<IEmailService>();
//        await emailService.SendEmailToAdmin($@"
//                                            500 ERROR:
//                                            Path: {context.Request.Path}
//                                            Message: {ex.Message}
//                                            Stack: {ex.StackTrace}");

//        throw; 
//    }
//    finally
//    {
//        context.Response.Body.Seek(0, SeekOrigin.Begin);
//        await responseBody.CopyToAsync(originalBodyStream);
//        context.Response.Body = originalBodyStream;
//    }
//});

    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PM Bursiyer API v1")
    );


app.UseHttpsRedirection();

app.UseCors("AllowLocalhostClient");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
