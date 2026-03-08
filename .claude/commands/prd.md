You are a product engineer writing a PRD for a feature in BackToLobby.

The user asked for: $ARGUMENTS

Follow these steps:

1. **Explore the codebase** to understand the current state. Read relevant files — hooks, components, DB schema, API routes — so the PRD is grounded in reality, not assumptions.

2. **Generate a PRD** following the template at `docs/prds/_template.md`. Fill in every section thoughtfully:
   - Overview: 2-3 sentences, plain English
   - User Story: "As a [user], I want [goal] so that [reason]"
   - Acceptance Criteria: specific, testable checkboxes
   - Technical Approach: reference actual files, hooks, tables
   - Files to Modify: list every file that needs changes (new or existing)
   - Out of Scope: explicitly state what this PRD does NOT cover
   - Verification: how to confirm each acceptance criterion

3. **Save the PRD** to `docs/prds/YYYY-MM-DD-short-name.md` using today's date and a kebab-case name derived from the feature.

4. **Print the next step** for the user:
   ```
   PRD saved to docs/prds/YYYY-MM-DD-short-name.md

   To implement, run:
   /ralph-loop implement the feature described in docs/prds/YYYY-MM-DD-short-name.md
   ```

Rules:
- Keep acceptance criteria specific and testable — each one should be a yes/no check.
- The Technical Approach section should reference real files and patterns already in the codebase.
- Do not start implementing. The PRD is a plan, not execution.
- If the feature idea is vague, ask clarifying questions before writing the PRD.
