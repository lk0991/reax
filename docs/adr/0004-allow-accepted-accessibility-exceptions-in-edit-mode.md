# Allow an accessibility exception only when a person accepts it in Edit mode

Accessibility requirements are never overridden by a chat request, the project or a card. The one exception is the preview's Edit mode: when a draft change breaks a requirement, the preview lists the warning, and a person can tick "I accept these accessibility exceptions" before applying. The agent then makes the change, adds a code comment naming the rule it breaks, and the exception is recorded in `comments.json`, where `improve` lists it.

## Considered options

- **Never allow an exception.** Rejected: the person owns their product, and a skill that silently refuses a change they have seen and understood gets worked around by hand, leaving no record.
- **Let any request override.** Rejected: a request in chat rarely shows the person what it breaks. Edit mode shows the specific warning on the specific element first.

## Consequences

- An exception always leaves a trace: a code comment and an accepted-exception entry.
- SKILL.md, the shared rules, the visual-test reference and the preview all state this one rule.
