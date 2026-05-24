using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeAllocator.API.Data;
using EmployeeAllocator.API.DTOs;
using EmployeeAllocator.API.Services;

namespace EmployeeAllocator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var admin = await _db.Admins
            .FirstOrDefaultAsync(a => a.Username == req.Username);

        if (admin == null || !BCrypt.Net.BCrypt.Verify(req.Password, admin.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var token = _tokenService.GenerateToken(admin);
        return Ok(new LoginResponse(token, admin.Username, admin.Email));
    }
}
