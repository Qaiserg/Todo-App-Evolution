# Spec-Gen Skill
## Automated Specification Generation from Natural Language

---

## Purpose
Generate well-structured feature specifications from natural language requirements, ensuring consistency with Spec-Kit Plus template.

---

## Usage

```
"Use the Spec-Gen skill to create a specification for [feature name]

Requirements:
- [Requirement 1]
- [Requirement 2]

Output to: specs/features/[feature-name].md"
```

---

## Generation Rules

### 1. Context Section
- Explain business value
- Reference the phase
- Keep concise (2-4 sentences)

### 2. User Stories
- Format: "As a [user], I want [goal], so that [benefit]"
- Include 2-5 stories
- Cover happy path and errors

### 3. Data Schema
- Reference Task model from constitution.md
- Include field names, types, constraints
- Note auto-generated vs user-provided

### 4. Acceptance Criteria
- Make them testable
- Use checkbox format
- Group by: Functional, Validation, Errors, UX

### 5. Test Cases
- Given-When-Then format
- Happy path, errors, edge cases

---

## Quality Checklist

- [ ] All template sections filled
- [ ] User stories follow standard format
- [ ] Acceptance criteria are testable
- [ ] Data schema matches constitution
- [ ] Test cases cover all scenarios
- [ ] No implementation code included

---

## Integration

1. Spec-Gen: Generate initial spec
2. Human: Review and refine
3. Architect: Validate
4. Claude Code: Implement

---

**Last Updated**: December 30, 2024
