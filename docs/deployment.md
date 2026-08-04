# Deploying Talita Town

The site is built and deployed from `main` by
`.github/workflows/deploy-pages.yaml`. The GitHub repository belongs to the
personal account `talimas`, so its owner must perform the one-time Pages setup.
Normal collaborators can push the workflow and content but cannot administer
Pages settings on a personal-account repository.

## One-time GitHub owner step

Talita must open <https://github.com/talimas/website/settings/pages> and:

1. Under **Build and deployment**, set **Source** to **GitHub Actions**.
2. Under **Custom domain**, enter `talita.town` and click **Save**.
3. Tell Ewan when GitHub shows the domain as attached. A temporary DNS-check
   failure is expected until the Cloudflare cutover below.

The deployment workflow can then be run manually from the repository's
**Actions** tab or triggered by the next push to `main`.

After DNS and certificate provisioning finish, Talita should return to the
Pages settings and enable **Enforce HTTPS** if GitHub has not enabled it
automatically.

## Cloudflare DNS cutover

Do not point DNS at GitHub before `talita.town` is saved as the repository's
custom domain. As verified on 2026-08-03, the `talita.town` Cloudflare zone is
active in Ewan's account and still contains Porkbun parking records.

Remove these parking records:

- Apex `A` records to `207.207.210.107` and `207.207.210.229`
- `www` CNAME to `pixie.porkbun.com`
- Wildcard `*` CNAME to `pixie.porkbun.com`

Create these **DNS only** records with TTL **Auto**:

| Type  | Name  | Target                |
| ----- | ----- | --------------------- |
| A     | `@`   | `185.199.108.153`     |
| A     | `@`   | `185.199.109.153`     |
| A     | `@`   | `185.199.110.153`     |
| A     | `@`   | `185.199.111.153`     |
| AAAA  | `@`   | `2606:50c0:8000::153` |
| AAAA  | `@`   | `2606:50c0:8001::153` |
| AAAA  | `@`   | `2606:50c0:8002::153` |
| AAAA  | `@`   | `2606:50c0:8003::153` |
| CNAME | `www` | `talimas.github.io`   |

Keep the records DNS-only while GitHub validates the domain and provisions its
certificate. GitHub Pages will redirect `www.talita.town` to the configured
apex domain.

## Verification

The launch is complete only when all of the following are true:

- The Pages workflow succeeds for the current `main` commit.
- The authoritative `A`, `AAAA`, and `www` records match the table above.
- <https://talita.town> returns the generated Quartz homepage over HTTPS.
- <https://www.talita.town> redirects to <https://talita.town>.
- GitHub Pages reports the custom domain as verified and HTTPS as enforced.

## If Ewan needs repository-admin access

A repository owned by a personal GitHub account has only owner and collaborator
permission levels; Talita cannot grant a collaborator the admin role needed for
Pages settings. The clean option is to transfer the repository to a GitHub
organization and give Ewan **Admin** access there. That is unnecessary for
ordinary content and deployment work after the one-time owner step above.
