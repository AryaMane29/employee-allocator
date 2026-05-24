namespace EmployeeAllocator.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Technology { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public decimal Rating { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectAllocation> Allocations { get; set; } = new List<ProjectAllocation>();
}
