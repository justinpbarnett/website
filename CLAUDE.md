# Claude instructions

This repo is a static HTML website. There is no build step.

## Deployment

Use Cloudflare Pages via Wrangler. Do not use Vercel for this site.

Project details:

- Cloudflare Pages project: `justinpbarnett`
- Production domain: `justinpbarnett.com`
- Pages domain: `justinpbarnett.pages.dev`

Preferred deploy command from the repo root:

```bash
tmp=$(mktemp -d)
cp index.html contact.html work.html resume.html Justin_Barnett_Resume.pdf "$tmp"/
cp -R assets "$tmp"/
wrangler pages deploy "$tmp" --project-name justinpbarnett --branch main --commit-dirty=true
```

Direct deploy also works, but may include local cache files if new untracked directories appear:

```bash
wrangler pages deploy . --project-name justinpbarnett --branch main --commit-dirty=true
```

Verify after deploy:

```bash
curl -I https://justinpbarnett.com/
curl -I https://justinpbarnett.com/work.html
curl -I https://justinpbarnett.com/Justin_Barnett_Resume.pdf
```

## Notes

- Keep `Justin_Barnett_Resume.pdf` in sync with `resume.html` when resume content changes.
- Use Chromium headless to regenerate the PDF:

```bash
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf=Justin_Barnett_Resume.pdf file://$PWD/resume.html
```

- Confirm it stays one page:

```bash
pdfinfo Justin_Barnett_Resume.pdf | grep Pages
```
