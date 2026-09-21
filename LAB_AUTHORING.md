# Lab authoring

Labs are authored in Supabase as `DRAFT`, reviewed, and then explicitly
published. Generated or dataset-derived content must not be auto-published.

A published lab should include:

- dataset and version attribution when applicable
- difficulty, duration, points, objectives, prerequisites, and skills
- tasks and safe validation rules
- hints and questions
- an approved environment template
- completion criteria

Flags are represented by server-side validation digests in `lab_flags`. Plain
text flags must never be shipped to the browser.
