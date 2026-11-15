# Regenerating the role manuals

1. Screenshots (headless Chrome; saves nothing). Install the driver once: `npm i puppeteer-core@23 --no-save`.
   - **Local mode (no passwords):** start the dev server (`npm run dev`, port 5173), then
     ```bash
     cd scripts/manuals && node capture.mjs --local            # or: --local --only admin
     ```
     Reads the academy data with the service key (`.supabase-service-key.local`), shows only the demo
     `@bright.academy` accounts, and blocks every write to the database.
   - **Live mode:** logs in on the live site as admin / math@ teacher / liam@ student:
     ```bash
     node capture.mjs "<admin password>"
     ```
2. PDFs (Python + reportlab):
   ```bash
   python3 build.py          # all three → ../../manuals/*.pdf
   python3 build.py admin    # just one
   ```

Note: the classroom screenshots in the teacher/student manuals need live mode (local mode can't join a real call).
