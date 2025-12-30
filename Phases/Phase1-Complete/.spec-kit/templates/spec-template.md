# Feature: [Feature Name]

---

## Context
[Explain the "why": problem, business value, how it fits in the project, which phase]

---

## User Stories

- As a [user type], I want [goal], so that [benefit]
- As a [user type], I want [goal], so that [benefit]
- As a [user type], I want [goal], so that [benefit]

---

## Data Schema

### [Model Name]
```
[ModelName] {
  field_name: type (constraints) - description
  field_name: type (constraints) - description
}
```

**Example for Task:**
```
Task {
  id: int (auto-generated, unique) - Unique identifier
  title: str (required, 1-200 chars) - Task title
  description: str | None (optional, max 1000 chars) - Detailed description
  status: TaskStatus (default: PENDING) - Current status
  created_at: datetime (auto-generated) - Creation timestamp
  updated_at: datetime (auto-generated) - Last update timestamp
}
```

---

## Acceptance Criteria

### Functional Requirements
- [ ] [Specific testable requirement]
- [ ] [Specific testable requirement]

### Validation Rules
- [ ] [Input validation rule]
- [ ] [Business rule validation]

### Error Handling
- [ ] [Error scenario and expected behavior]
- [ ] [Error scenario and expected behavior]

### User Experience
- [ ] [UX requirement - success message format]
- [ ] [UX requirement - terminal output formatting]

---

## Example Usage

### Happy Path
```
Input: [user input]
Output: [expected output]
```

### Error Example
```
Input: [invalid input]
Output: [error message]
```

---

## Test Cases

1. **Test: [Test name]**
   - Given: [precondition]
   - When: [action]
   - Then: [expected result]

2. **Test: [Test name]**
   - Given: [precondition]
   - When: [action]
   - Then: [expected result]

---

## Implementation Notes

### Architecture Layer Mapping
- **Model**: [Which Pydantic model(s)]
- **Repository**: [What storage operations]
- **Service**: [What business logic]
- **CLI**: [What UI elements]

### Dependencies
- [External library or module needed]
- [Related feature that must exist first]

### Future Compatibility
- [How this supports future phases]
- [What changes in Phase 2, 3, etc.]

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80%
- [ ] Architect skill validation passed

---

## Related Specifications

- [Related Feature](../features/related-feature.md)
- [Architecture](../architecture/phase1-architecture.md)
- [Constitution](../../constitution.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial specification |

---

## Architect Review

**Status**: [ ] Pending / [ ] Approved / [ ] Revision Requested

**Feedback**:
- [Architect feedback]

**Approval Signature**: [Architect Skill v1.0]
