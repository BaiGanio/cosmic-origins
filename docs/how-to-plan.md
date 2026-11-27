# How to write a plan

> Moved out of `AGENTS.md` so it loads only when an agent writes a plan.

When asked to write or design a plan — architecture, feature design, data-import
strategy, refactor roadmap — write it in the body of its GitHub issue: one issue holds
the goal, the plan and the tests. No plan files. (Old plans in `docs/plans/` stay until done.)

## Plan structure
Every plan must include:

1. **Objective** — one sentence: the problem being solved and why it matters
2. **Diagram** — a [Mermaid](https://mermaid.js.org/) diagram of key components and
   relationships. For UI mockups, attach a PNG to the issue.
3. **Model recommendation** — which model to use for execution, with estimated
   tokens/cost and a one-sentence rationale (see Model selection below)
4. **Steps** — ordered, each with a concrete acceptance criterion ("works when…") and
   the test group in the issue's Tests section
5. **Risks** — what can go wrong, mitigation for each
6. **Doc updates** — which files need changes after implementation (see Documentation Sync)

## TDD — Tests First

Every plan MUST have a **Tests** section in the same issue, written with the plan. When the plan is executed, its verification criteria are validated
**before** the implementation is considered complete — verify-first, not verify-after.
In this repo a "test" is usually a provable browser behavior (exact steps + expected
result) plus `node --check` on touched files; automate it in `tests/ui/` (Playwright)
when it can be measured.

**Tests section structure:**

1. **Coverage map** — table mapping each plan step to a test group, so nothing falls
   through the cracks
2. **Test cases** — each with: name, input/setup, expected behavior (concrete and
   measurable), assertions, edge cases
3. **Test execution order** — dependencies between groups; tests within a group are
   independent
4. **Diagrams** (optional) — Mermaid, when a flow is easier to see than read
5. **Required setup** — fixtures, seed data, config

Execution loop: read the Tests section first → confirm the current state fails the
criteria (red) → implement until green → update the issue if discoveries change
expectations → confirm the coverage map still holds.

## Model selection

Right-size the model to the task. The developer is on a fixed monthly plan — batch
questions, prefer one-shot execution over iterative back-and-forth.

1. **Cheap capable model** — the routine wiring/cleanup tasks in `docs/follow-ups.md`
   are deliberately scoped as small, self-contained sessions for inexpensive models.
2. **Frontier model** — design one-shots, architecture, and anything touching the
   design system's look and feel, batched into a single session.
