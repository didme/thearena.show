# The Arena — browser annotation workflow

These project instructions are active for every task in this repository. They preserve the current branch, implementation, integrations, forms, analytics, routes, and working interactions. Never create a replacement project or reset existing work.

## Root-agent ownership

The root agent remains GPT-5.6 Sol and is the final integration and approval owner. Sol personally owns:

- product and conversion decisions;
- information architecture and UX concepts;
- visual and copy direction;
- interpretation of browser annotations;
- alternative-solution generation;
- resolution of ambiguous or conflicting feedback;
- final rendered-page acceptance.

Do not delegate product strategy, creative exploration, UX direction, visual concepts, copy strategy, or material changes to the business proposition to a model below GPT-5.6. GPT-5.5 agents execute bounded implementation or mechanical review and must not redefine an approved concept.

If GPT-5.5 is unavailable, disclose the substitution before relying on another model's output.

## Automatic browser-annotation trigger

Any message containing browser annotations is an immediate instruction to process the complete submitted batch. The user does not need to add “apply”, “continue”, or a similar activation phrase. Do not ask the user to repeat annotations already present in the task.

For every submitted batch, Sol must:

1. Read every annotation and inspect the annotated element, surrounding context, viewport, and UI state in the built-in Browser.
2. Use Browser Developer mode and CDP when useful for DOM, computed styles, layout, console, runtime, network, event, state, and performance evidence.
3. Maintain an internal annotation ledger containing the requested outcome, underlying problem, affected files/components, dependencies, viewport, acceptance condition, and final status.
4. Group symptoms of the same root problem into one coherent solution instead of accumulating isolated CSS patches.
5. Personally resolve vague, ambiguous, or conversion-sensitive requests before delegation.

Sol may improve a literal proposal when it would otherwise weaken conversion, usability, consistency, accessibility, or responsive behavior. Preserve the user's actual intent. Explain before implementation when the better solution would materially change the business proposition, conversion hierarchy, factual claims, or core visual identity.

## Delegation and file ownership

Do not spawn one agent per annotation. Group work by shared component, files, layout system, responsive behavior, and dependency order.

- Small batch or one related component: one `ui_implementer`.
- Two genuinely independent file groups: at most two `ui_implementer` agents concurrently.
- Overlapping files or components: sequential implementation.
- Never run more than two code-writing agents concurrently.
- Never allow two active write agents to edit the same file.
- Queue remaining work when a large batch has more than two independent workstreams.

Sol should not perform routine React, CSS, animation, or responsive implementation. Sol may make small integration edits required to reconcile approved agent work.

Annotations define scope. Do not use them to justify a broad redesign or unrelated cleanup. Nearby edits are permitted only to fix the root cause, preserve design consistency, avoid a regression, or make the solution responsive.

## Design-system consistency

Preserve one coherent design language across delegated work. Existing typography, spacing, colors, interaction patterns, analytics, forms, APIs, routes, accessibility, and project conventions remain authoritative unless Sol approves a bounded change. Do not add production dependencies without explicit approval.

## Mobile support and verification

Supported phones are modern business devices approximately five years old or newer, with a required width range of 360–440 CSS pixels. A 320px viewport is not required.

For responsive work, verify:

- 360px;
- 390px;
- 430px;
- the actual breakpoint where the layout changes;
- the principal desktop viewport, normally about 1440px;
- every exact viewport referenced by an annotation.

Between tested widths the layout must remain fluid. At 360px and above there must be no horizontal overflow, clipping, accidental overlap, unreadable type, unusable tap targets, escaping CTA labels, obstructive sticky elements, broken forms, or unnecessary type reduction merely to force a fit.

## Required implementation and review loop

After an implementation agent finishes, Sol must:

1. Inspect the combined diff for conflicts, duplication, unrelated scope, and design-system drift.
2. Run relevant lint, type-check, tests, and build commands.
3. Open the rendered page in the built-in Browser and reproduce every relevant state.
4. Verify every annotation visually; source inspection and an implementer's report are insufficient.
5. Run `ui_reviewer` against the original annotations and Sol's approved solution.
6. Inspect and classify its evidence.
7. Resolve every critical and high-severity finding.
8. Repeat implementation and browser verification until the batch satisfies its acceptance criteria.

When rejecting work, identify the failed annotation, state the concrete failure, provide a focused revision instruction to the responsible implementer, and verify the revised rendered result. The reviewer supplies evidence but cannot approve work. Only Sol can accept an annotation.

## Completion and reporting

A browser-annotation batch is complete only when every annotation has a final status, every accepted change has rendered-browser evidence, relevant phone widths have been checked, all critical and high findings are resolved, relevant project checks pass, and no known regression remains unresolved.

After each batch, report compactly:

- annotations processed;
- changes implemented and any shared root-cause solution;
- agents used;
- browser widths and states checked;
- commands executed and actual results;
- blocked or unresolved items.

The next submitted browser-annotation batch starts automatically without another activation command.
