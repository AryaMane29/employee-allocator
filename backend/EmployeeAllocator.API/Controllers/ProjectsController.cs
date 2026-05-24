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
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProjectsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.Projects
            .Include(p => p.Allocations)
                .ThenInclude(a => a.Employee)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _db.Projects
            .Include(p => p.Allocations)
                .ThenInclude(a => a.Employee)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();
        return Ok(MapToDto(project));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            RequiredTechnologies = dto.RequiredTechnologies,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, MapToDto(project));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.RequiredTechnologies = dto.RequiredTechnologies;
        project.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
        project.EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null;
        project.Status = dto.Status;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/allocate")]
    public async Task<IActionResult> Allocate(int id, [FromBody] AllocateEmployeeDto dto)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });

        var employee = await _db.Employees.FindAsync(dto.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var exists = await _db.ProjectAllocations
            .AnyAsync(a => a.ProjectId == id && a.EmployeeId == dto.EmployeeId);
        if (exists)
            return Conflict(new { message = "Employee already allocated to this project." });

        var allocation = new ProjectAllocation
        {
            ProjectId = id,
            EmployeeId = dto.EmployeeId,
            Role = dto.Role
        };

        employee.IsAvailable = false;
        _db.ProjectAllocations.Add(allocation);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Employee allocated successfully." });
    }

    [HttpDelete("{id}/allocate/{employeeId}")]
    public async Task<IActionResult> RemoveAllocation(int id, int employeeId)
    {
        var allocation = await _db.ProjectAllocations
            .FirstOrDefaultAsync(a => a.ProjectId == id && a.EmployeeId == employeeId);

        if (allocation == null) return NotFound();

        var employee = await _db.Employees.FindAsync(employeeId);
        if (employee != null) employee.IsAvailable = true;

        _db.ProjectAllocations.Remove(allocation);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ProjectDto MapToDto(Project p) => new(
        p.Id, p.Name, p.Description, p.RequiredTechnologies,
        p.StartDate, p.EndDate, p.Status, p.CreatedAt,
        p.Allocations.Select(a => new AllocationDetailDto(
            a.Id, a.EmployeeId, a.Employee.Name,
            a.Employee.Technology, a.Employee.Rating,
            a.Employee.ExperienceYears, a.Role, a.AllocatedAt
        )).ToList()
    );
}