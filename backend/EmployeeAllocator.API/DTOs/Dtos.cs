namespace EmployeeAllocator.API.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string Username, string Email);

public record CreateEmployeeDto(
    string Name, string Email, string Technology,
    int ExperienceYears, decimal Rating);

public record UpdateEmployeeDto(
    string Name, string Email, string Technology,
    int ExperienceYears, decimal Rating, bool IsAvailable);

public record EmployeeDto(
    int Id, string Name, string Email, string Technology,
    int ExperienceYears, decimal Rating, bool IsAvailable, DateTime CreatedAt);

public record CreateProjectDto(
    string Name, string Description, string RequiredTechnologies,
    DateTime StartDate, DateTime? EndDate);

public record UpdateProjectDto(
    string Name, string Description, string RequiredTechnologies,
    DateTime StartDate, DateTime? EndDate, string Status);

public record ProjectDto(
    int Id, string Name, string Description, string RequiredTechnologies,
    DateTime StartDate, DateTime? EndDate, string Status, DateTime CreatedAt,
    List<AllocationDetailDto> Allocations);

public record AllocateEmployeeDto(int EmployeeId, string Role);

public record AllocationDetailDto(
    int AllocationId, int EmployeeId, string EmployeeName,
    string Technology, decimal Rating, int ExperienceYears,
    string Role, DateTime AllocatedAt);
