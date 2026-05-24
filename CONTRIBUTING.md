# Contributing to HORUS OS

Thanks for helping build the Egyptian AI & Robotics Linux distribution.
Beginners are welcome — many issues are labelled `good first issue`.

## Ways to contribute
- **Project templates** — add a runnable starter under `templates/`.
- **Apps & features** — Python (FastAPI) backends + self-contained HTML, or
  React frontends built at ISO time.
- **Translations** — Arabic/English UI strings and docs (keep RTL correct).
- **Tutorials & docs** — markdown under `docs/`, bilingual where possible.
- **Testing** — build the ISO, boot it in a VM, report what breaks.

## Dev setup
```bash
git clone https://github.com/alaa2134/horus-edu-os
cd horus-edu-os
# Build the ISO (Ubuntu 22.04 host, ~8GB free, sudo):
sudo scripts/build-iso.sh --arch amd64
# Or test the output in a VM:
vm/run-qemu.sh dist/horus-os-1.0.0-amd64.iso
```

## Adding a project template
1. Create `templates/<your-template>/` with runnable code.
2. Add a `horus.json`:
   ```json
   { "name": "My Template", "description": "...", "tags": ["arduino"], "run": "..." }
   ```
3. It appears automatically in **Horus Robotics → New Project**.

## Pull requests
- Branch off `master`; keep PRs focused.
- Run the checks the CI runs: `bash -n` on scripts, `python -m py_compile`
  on Python, valid JSON. The **Validate** workflow must pass.
- Follow the design system: gold `#c9a227`, dark surfaces, beginner-first tone.
- Describe **why**, not just what. Add screenshots for UI changes.

## Reporting bugs
Use the issue templates. Include: HORUS version, hardware/VM, steps to
reproduce, and logs (`journalctl -b`, or the failing build step).

## Code of conduct
By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
