# Agent notes

## Site type

Static HTML/CSS site. Edit files directly. No package install or build command is required.

## Deploy

Deploy with Cloudflare Pages using Wrangler. This repo is not deployed through Vercel.

Project:

- `justinpbarnett`
- `justinpbarnett.com`
- `justinpbarnett.pages.dev`

Safe deploy command:

```bash
tmp=$(mktemp -d)
cp index.html contact.html work.html resume.html Justin_Barnett_Resume.pdf "$tmp"/
cp -R assets "$tmp"/
wrangler pages deploy "$tmp" --project-name justinpbarnett --branch main --commit-dirty=true
```

Verification:

```bash
curl -I https://justinpbarnett.com/work.html
curl -I https://justinpbarnett.com/Justin_Barnett_Resume.pdf
```

## Resume PDF

When changing resume content, update `resume.html`, regenerate `Justin_Barnett_Resume.pdf`, and verify it is one page:

```bash
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf=Justin_Barnett_Resume.pdf file://$PWD/resume.html
pdfinfo Justin_Barnett_Resume.pdf | grep Pages
```
