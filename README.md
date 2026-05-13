# Justin Barnett website

Static personal website for `justinpbarnett.com`.

## Structure

- `index.html` - about page
- `work.html` - work and projects page
- `contact.html` - contact page
- `resume.html` - printable resume source
- `Justin_Barnett_Resume.pdf` - downloadable one-page resume
- `assets/` - images and social preview assets

## Deployment

This site is deployed with Cloudflare Pages, not Vercel.

Cloudflare Pages project:

- Project name: `justinpbarnett`
- Production domains: `justinpbarnett.com`, `justinpbarnett.pages.dev`

Deploy with Wrangler from the repo root:

```bash
wrangler pages deploy . --project-name justinpbarnett --branch main --commit-dirty=true
```

If you want to avoid uploading local tool/cache directories, deploy a clean temp directory instead:

```bash
tmp=$(mktemp -d)
cp index.html contact.html work.html resume.html Justin_Barnett_Resume.pdf "$tmp"/
cp -R assets "$tmp"/
wrangler pages deploy "$tmp" --project-name justinpbarnett --branch main --commit-dirty=true
```

After deploying, verify:

```bash
curl -I https://justinpbarnett.com/work.html
curl -I https://justinpbarnett.com/Justin_Barnett_Resume.pdf
```
