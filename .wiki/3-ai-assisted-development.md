# 3. AI-Assisted Development: Vibe Coding, Context Coding, and Code Ownership

## Introduction

The @CKIR.IO/VISIONS project was constructed using generative AI tools as primary coding assistants. This section documents the methodological framework, risks, and remediation strategies associated with two distinct AI-assisted paradigms—**vibe coding** and **context coding**—and explains why production-grade software mandates a transition from generation to ownership. The analysis draws on empirical studies from arXiv, InfoWorld, and Autonoma, contextualized within the specific constraints of this codebase.

## 1. Defining the Paradigms

### 1.1 Vibe Coding

**Vibe coding** refers to the practice of rapidly generating software through conversational prompts without deep architectural planning, code review, or testing discipline. The developer describes intent in natural language and accepts the AI's output with minimal scrutiny, iterating on visible failures rather than structural correctness. The term emerged from developer communities to describe a state of flow where velocity supersedes comprehension.

### 1.2 Context Coding

**Context coding** extends vibe coding by providing the AI with explicit codebase context—file trees, existing abstractions, and style conventions—through retrieval-augmented generation (RAG) or direct context injection. Tools such as Cursor, GitHub Copilot Workspace, and custom MCP implementations enable the model to reference existing functions and types, reducing the drift between generated code and established patterns.

### 1.3 Code Ownership

**Code ownership** is the state in which a developer can articulate, modify, and maintain every architectural decision, interface contract, and failure mode within the codebase. Owned code is characterized by:
- Comprehensive behavioral test coverage
- Consistent abstraction levels across modules
- Dependency minimization with justified inclusion
- Documented rationale for non-obvious logic

## 2. The Vibe Coding Trap: Empirical Evidence

### 2.1 arXiv:2603.28592 — "Debt Behind the AI Boom"

A large-scale empirical study by Liu et al. (2026) analyzed **304,362 verified AI-authored commits** across 6,275 GitHub repositories, covering five major AI coding assistants. The findings demonstrate systematic quality degradation:

| Metric | Finding |
|--------|---------|
| **Code smells** | 89.1% of all AI-introduced issues |
| **Issue persistence** | 24.2% of AI-introduced issues survive to the latest repository revision |
| **Commit defect rate** | >15% of commits from every AI assistant introduce at least one issue |
| **Tool variance** | Defect rates vary significantly across assistants but remain above 15% minimum |

**Key insight:** AI-generated issues are not transient. They accumulate as technical debt because the original author lacks the contextual understanding to recognize subtle architectural inconsistencies introduced by the model.

### 2.2 Autonoma — "Vibe Coding Technical Debt: The 90-Day Reckoning"

Autonoma's analysis of AI-assisted development lifecycles maps a predictable degradation curve:

| Timeline | Phenomenon |
|----------|------------|
| **Day 1–7** | Velocity peak. Basic infrastructure appears rapidly. All stakeholders perceive accelerated progress. |
| **Day 30** | First debugging sessions extend unexpectedly. Functions exceed 300 lines, combine unrelated concerns, and lack contextual documentation. Duplicate logic fragments emerge. |
| **Day 60** | Feature requests that should require hours consume days. Code changes induce regressions in distant modules. State management becomes unpredictable. |
| **Day 90** | 20–30% of sprint capacity consumed by bug remediation. "Works but nobody knows why" functions dominate critical paths. Organizational pressure for rewrite begins. |

**Critical pattern:** The "local correctness" fallacy. Each AI-generated function is internally coherent, but global invariants—error handling consistency, state flow predictability, abstraction orthogonality—deteriorate monotonically.

### 2.3 InfoWorld — Matthew Tyson

Tyson's analysis emphasizes the irreplaceability of the human developer as the unifying agent between creative intent and engineering rigor:

> "Leave out the developer, and you just get mountains of technical debt. A good software developer brings together engineering and craft in one mind. Modern AI helps with both the creative and mechanical aspects, but a human is still needed to unite them with understanding."

The article highlights the **wack-a-mole fix-and-break cycle**: the AI resolves one issue while introducing dependencies on undocumented behaviors that fail under adjacent modifications. This occurs because the model optimizes for the immediate prompt context rather than the global system architecture.

### 2.4 GitClear / Copilot Impact Study

GitClear's longitudinal analysis of 211 million lines of code found that code duplication increased from 8.3% (2021) to 12.3% (2024)—precisely the period of AI coding tool mainstream adoption. This indicates that models generate **self-contained solutions** without checking for existing implementations, fragmenting business logic across independent copies.

## 3. Why Enterprises Discourage Vibe/Context Coding Without Ownership

### 3.1 The Dependency Sprawl Problem

AI coding assistants introduce libraries opportunistically. A single prompt may generate imports for date formatting, UUID generation, or HTTP clients that duplicate existing functionality. After thirty days of active development:

- Package manifests grow by 15–20 unmaintained dependencies
- None were consciously evaluated for security posture or community health
- Duplicated functionality complicates future migrations (e.g., Node.js version upgrades)

**Enterprise consequence:** Supply chain security audits fail. Legal review identifies incompatible licenses in transitive dependencies. The cost of remediation exceeds the initial velocity gain.

### 3.2 The "Works but Nobody Knows Why" Anti-Pattern

Functions that cannot be explained by any team member are **latent failure vectors**. When Ollama inference fails on a specific image type, debugging requires understanding the preprocessing pipeline, the buffer serialization contract, and the Ollama `keep_alive` mapping. If these were generated without review:

- Error reproduction requires reverse-engineering the implementation
- Refactoring risks breaking implicit assumptions the AI embedded
- Knowledge transfer to new team members is impossible

### 3.3 The Rewrite Temptation

When technical debt accumulates beyond tolerance, organizations face the **rewrite decision**. Historical software engineering literature (Spolsky, 2000) documents rewrite failure modes:

| Risk | Manifestation |
|------|--------------|
| **Schedule slip** | Rewrites typically require 2–3× initial estimates |
| **Feature parity gaps** | Edge cases documented only in legacy code are lost |
| **Business logic bugs** | Original bugs were de facto specifications; rewrites replicate them with new side effects |
| **Maintenance vacuum** | Existing product stagnates during rewrite, alienating users |

**Discouragement rationale:** Enterprises prefer incremental remediation with behavioral test coverage over dramatic rewrites because the former preserves business continuity while addressing debt.

### 3.4 The Context Coding Mirage

Context coding reduces but does not eliminate the debt trajectory. Even with full repository context, models:
- Prioritize the current prompt over long-term maintainability
- Favor verbose implementations that satisfy immediate test cases
- Lack institutional knowledge about business constraints and risk tolerance

Context coding without ownership produces **better-organized technical debt**—but debt nonetheless.

## 4. Why Context Coding is Preferable to Vibe Coding

Despite the caveats above, context coding represents a meaningful improvement over raw vibe coding for two structural reasons:

### 4.1 Local Coherence Improvement

When the model receives file trees, function signatures, and style guides, it generates code that respects existing naming conventions, import patterns, and type hierarchies. This reduces the **cognitive friction** of reading generated code and lowers the barrier to subsequent refactoring.

### 4.2 Reduced Duplication

With codebase visibility, models can reference existing utilities rather than regenerating equivalents. In this project, the `@ehildt/ckir-helpers` package provides `hashPayload`, `isBufferOrSerialized`, and bootstrap utilities—functions that a vibe-coding session might have reimplemented inline.

### 4.3 The Limits of Context Coding

| Limitation | Description |
|------------|-------------|
| **Temporal blindness** | Models lack awareness of project roadmap; generated code may conflict with upcoming architectural changes |
| **Test gap** | Context coding accelerates implementation but not test coverage. The test-to-code ratio degrades over time |
| **Reviewer fatigue** | Rapid generation outpaces human review capacity, leading to rubber-stamp approvals without genuine comprehension |

## 5. The Ownership Imperative: A Remediation Framework

### 5.1 Phase 1: Triage the Surface Area (Week 1–2)

Before modification, map the codebase:

1. **Dependency audit:** Enumerate all packages, identify duplicates, and flag unmaintained or security-risk libraries
2. **Critical path analysis:** Identify which files participate in successful user journeys (upload → inference → result display)
3. **Defect clustering:** Correlate the last 30 days of issues with source files to identify high-liability modules

### 5.2 Phase 2: Build a Behavioral Test Suite (Week 2–4)

Write tests that document **current behavior**, not intended behavior. For AI-generated code, the implementation is the only specification:

| Test Type | Target | Tooling |
|-----------|--------|---------|
| Unit (services) | `AnalyzeImageService`, `JsonRpcService`, `ImagePreprocessingService` | Vitest |
| Unit (processors) | `VisionsProcessor` derivatives | Vitest with mocked Ollama |
| Component | `FileUpload.vue`, `EventLog.vue` | Vue Test Utils + jsdom |
| End-to-end | Full upload → inference → result flow | Playwright or Autonoma agents |

### 5.3 Phase 3: Incremental Refactoring (Week 4–8)

With test coverage established, refactor in this priority order:

1. **Consolidate duplicated logic:** Merge scattered implementations into shared utilities
2. **Standardize error handling:** Adopt consistent failure modes (exceptions vs. null returns vs. result types)
3. **Address "works but nobody knows why" functions:** These require the most careful analysis; budget extra time

### 5.4 Phase 4: Prevent Recurrence

| Guardrail | Implementation |
|-----------|---------------|
| Coverage gate | Block merge if critical path coverage falls below threshold |
| Dependency review | Require explicit approval for new package additions |
| Architectural RFC | Require written justification for new module boundaries |
| Model policy | Define which tasks are AI-appropriate (boilerplate) vs. human-only (architecture) |

## 6. Application to This Project

### 6.1 Where AI Was Used

| Area | Technique | Outcome |
|------|-----------|---------|
| Dashboard UI | Vibe coding | Rapid exploration of 9-theme system, component prototyping |
| Server boilerplate | Context coding | Controller patterns, DTO scaffolding, module wiring |
| Processor logic | Context coding | Base streaming loop, cancellation handling |
| Test coverage | Human-authored | All `.spec.ts` files written with explicit behavioral assertions |
| Documentation | AI-assisted drafting, human review | This wiki |

### 6.2 Where Ownership Was Emphasized

- **Buffer serialization:** `ensureBuffer()` rehydration logic was explicitly designed to handle BullMQ's JSON serialization idiosyncrasy
- **Error resilience:** Preprocessing fallback to original buffer on Sharp failure prevents cascaded failures
- **Cancel semantics:** `UnrecoverableError` prevents wasteful retries on deterministic cancellations
- **Theme architecture:** CSS custom property mapping was intentionally designed for instantaneous switching without FOUC

### 6.3 Remaining Experiments

This codebase intentionally retains some AI-generated structures in their original form as longitudinal experiments in code longevity. These files are documented and isolated; they serve as observational data for the 30/60/90-day debt curve rather than production patterns.

## 7. Conclusion

AI-assisted coding is a force multiplier, not a replacement for engineering discipline. The empirical evidence from arXiv, Autonoma, and GitClear converges on a single conclusion: **velocity without ownership accelerates directly into technical insolvency**. Context coding mitigates but does not eliminate this risk. The disciplined path—generation, review, refactoring, testing, and ownership—is the only sustainable model for software that must survive beyond the demo.

---

## References

1. Liu, Y., Widyasari, R., Zhao, Y., Irsan, I. C., & Lo, D. (2026). *Debt Behind the AI Boom: A Large-Scale Empirical Study of AI-Generated Code in the Wild*. arXiv:2603.28592.
2. Tyson, M. (2025). *Is vibe coding the new gateway to technical debt?* InfoWorld.
3. Autonoma. (2026). *Vibe Coding Technical Debt: The 90-Day Reckoning*. Retrieved from getautonoma.com.
4. GitClear. (2024). *Coding on Copilot: Data Shows AI's Impact on Software Activity in 2023*.
5. Spolsky, J. (2000). *Things You Should Never Do, Part I*. Joel on Software.
