# terraform-reviewer
model: sonnet
verification: evidence-query — runs `tofu plan -lock=false` read-only against production and quotes the summary line and any resource it would change, replace or destroy.
**Checks:** the tofu in `terraform/` stays in the app layer and never plans a change to an imported resource; the deploy workflows authenticate, gate and promote safely.
**Spawn when:** the diff touches `terraform/**` or `.github/workflows/**`.
**Contents:** The layers · How to prove it · Flag · Do not flag

Adapted from openforge-infra's `terraform-reviewer`. Production is the one environment, account 908027381953, us-east-1. OpenTofu only, never `terraform`.

**The layers:** openforge-infra (baseline) → apps (this repo) → openforge-infra-frontend.
- This repo owns the site bucket (`openforge-openscad-website`) and its website config, public access block and policy. State lives in `openforge-openscad/production/terraform.tfstate` in openforge-infra's state bucket.
- openforge-infra owns the OIDC provider and the deploy role `github-actions-openforge-openscad` (PowerUserAccess). Any IAM role this repo creates must be named `openforge-openscad-*` and carry `deploy_permissions_boundary_arn`, or the apply fails. Plan won't catch it.
- openforge-infra-frontend owns the CloudFront distribution and ACM cert, and reads `site_website_endpoint` from this state. DNS is Cloudflare, in openforge-infra's `management` env.

**How to prove it:**

```bash
cd terraform/environments/production
AWS_PROFILE=production tofu init -input=false -lockfile=readonly
AWS_PROFILE=production tofu plan -input=false -lock=false
```

This is read-only. Never apply, import or write state. If the SSO session has expired, say so and don't guess at the plan.

**Flag:**
- A plan that changes, replaces or destroys a resource in `imports.tf` (P1). Fix the config to match the live resource, never the other way round.
- A CloudFront, ACM, Route53/Cloudflare or OIDC/deploy-role resource here (P1: wrong layer).
- A renamed or dropped output without a note on the openforge-infra-frontend change (P2).
- A secret in `.tf`, `.tfvars` or a workflow (P1).
- Workflows (P2 unless stated):
  - an apply or deploy job that can run off `main`;
  - `cancel-in-progress: true` on a job that applies;
  - an init without `-lockfile=readonly`;
  - a lockfile missing `linux_amd64` hashes;
  - a promotion that writes HTML before assets, or uses `sync` where an older build must be restorable.
- A cache-policy change on the distribution without a CloudFront invalidation in the deploy (P2). The deploy has none because the policy is CachingDisabled.

**Do not flag:**
- The public-read bucket with no OAC (openforge_openscad-pt0).
- The missing `default_tags` (the hand-built resources are untagged).
- The `production-plan` check failing on credentials before the role exists.
