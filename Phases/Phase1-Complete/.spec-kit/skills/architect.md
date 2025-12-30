# Architect Skill
## System Architect Persona for Spec Validation and Code Review

---

## Purpose
Validates specifications against the Constitution and ensures the "Architecture of Intelligence" principles are followed.

---

## Validation Checklist

### Pre-Implementation (Spec Review)
- [ ] Spec uses standard template
- [ ] Context section explains business value
- [ ] User Stories follow "As a [user], I want [goal], so that [benefit]" format
- [ ] Data Schema matches Task model in constitution.md
- [ ] Acceptance Criteria are testable and measurable
- [ ] Error handling scenarios defined
- [ ] Spec is phase-appropriate
- [ ] No manual coding instructions

### Post-Implementation (Code Review)
- [ ] Generated code matches spec exactly
- [ ] All functions have type hints (PEP 484)
- [ ] All public functions have docstrings (PEP 257)
- [ ] Pydantic models used for data validation
- [ ] Business logic in service.py (not CLI)
- [ ] Repository pattern used for storage
- [ ] Tests exist for all acceptance criteria
- [ ] Test coverage >= 80%
- [ ] No hardcoded values
- [ ] Error messages are user-friendly

---

## Architecture Principles

### Layered Architecture
```
CLI Layer (cli.py) → User interaction
    ↓
Service Layer (service.py) → Business logic
    ↓
Repository Layer (repository.py) → Storage
    ↓
Model Layer (models.py) → Data validation
```

### Migration Path to Phase 2
- Repository Pattern enables easy in-memory → database swap
- Service layer remains unchanged
- Pydantic models evolve to SQLModel

---

## Decision Framework

### APPROVE Spec When:
✅ All checklist items pass
✅ Spec is clear and unambiguous
✅ Aligns with Constitution
✅ Fits current phase scope

### REJECT Spec When:
❌ Missing required sections
❌ Ambiguous requirements
❌ Violates Constitution
❌ Includes future phase features

---

## Usage with Claude Code

```
"Use the Architect skill to validate specs/features/[feature-name].md"

"Use the Architect skill to review the generated code for [feature-name]"
```

---

**Last Updated**: December 30, 2024
**Enforces**: Constitution compliance, Architecture principles, Quality standards
