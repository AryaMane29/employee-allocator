namespace EmployeeAllocator.API.Models;

public class ProjectAllocation
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime AllocatedAt { get; set; } = DateTime.UtcNow;
    public string Role { get; set; } = string.Empty;

    public Project Project { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
}
