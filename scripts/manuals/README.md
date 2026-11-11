# Regenerating the role manuals

1. Screenshots (headless Chrome, browses the live site as admin / math@ teacher / liam@ student — saves nothing):
   ```bash
   cd scripts/manuals && npm i puppeteer-core@23 --no-save
   node capture.mjs "<admin password>"
   ```
2. PDFs (Python + reportlab):
   ```bash
   python3 build.py    # writes ../../manuals/*.pdf
   ```
