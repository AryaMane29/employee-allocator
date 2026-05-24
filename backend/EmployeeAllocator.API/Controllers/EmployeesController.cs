using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeAllocator.API.Data;
using EmployeeAllocator.API.DTOs;
using EmployeeAllocator.API.Models;

namespace EmployeeAllocator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmployeesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? technology,
        [FromQuery] decimal? minRating,
        [FromQuery] int? minExperience,
        [FromQuery] bool? isAvailable)
    {
        var query = _db.Employees.AsQueryable();

        if (!string.IsNullOrWhiteSpace(technology))
            query = query.Where(e => e.Technology.ToLower().Contains(technology.ToLower()));

        if (minRating.HasValue)
            query = query.Where(e => e.Rating >= minRating.Value);

        if (minExperience.HasValue)
            query = query.Where(e => e.ExperienceYears >= minExperience.Value);

        if (isAvailable.HasValue)
            query = query.Where(e => e.IsAvailable == isAvailable.Value);

        var employees = await query
            .OrderByDescending(e => e.Rating)
            .Select(e => new EmployeeDto(
                e.Id, e.Name, e.Email, e.Technology,
                e.ExperienceYears, e.Rating, e.IsAvailable, e.CreatedAt))
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _db.Employees.FindAsync(id);
        if (e == null) return NotFound();
        return Ok(new EmployeeDto(
            e.Id, e.Name, e.Email, e.Technology,
            e.ExperienceYears, e.Rating, e.IsAvailable, e.CreatedAt));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        var employee = new Employee
        {
            Name = dto.Name,
            Email = dto.Email,
            Technology = dto.Technology,
            ExperienceYears = dto.ExperienceYears,
            Rating = dto.Rating
        };

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = employee.Id },
            new EmployeeDto(employee.Id, employee.Name, employee.Email,
                employee.Technology, employee.ExperienceYears,
                employee.Rating, employee.IsAvailable, employee.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        employee.Name = dto.Name;
        employee.Email = dto.Email;
        employee.Technology = dto.Technology;
        employee.ExperienceYears = dto.ExperienceYears;
        employee.Rating = dto.Rating;
        employee.IsAvailable = dto.IsAvailable;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
