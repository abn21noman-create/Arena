# 🔒 Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

We take all security bugs seriously. We appreciate your efforts to responsibly
disclose your findings and will make every effort to acknowledge your
contributions.

### How to Report

Send security reports to: **abn21.noman@gmail.com** (project owner)

Include the following information:

1. **Type of issue** (e.g., XSS, SQL injection, authentication bypass, etc.)
2. **Full paths** of affected source file(s)
3. **Location** of the affected code (tag/branch/commit or URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact** of the issue, including severity

### What to Expect

- **Acknowledgment** within 48 hours of submission
- **Regular updates** on the progress of the fix
- **Credit** in the release notes (unless you prefer to remain anonymous)

## Security Best Practices (For Self-Hosters)

If you're running HSC Ultimate on your own infrastructure:

### Environment Variables

```bash
# CRITICAL: Rotate all secrets before deployment
openssl rand -base64 32  # For NEXTAUTH_SECRET

# Rotate API keys from each provider's dashboard:
# - Groq:      https://console.groq.com/keys
# - Mistral:   https://console.mistral.ai/
# - Cerebras:  https://cloud.cerebras.ai/
# - OpenRouter: https://openrouter.ai/keys
# - Resend:    https://resend.com/api-keys
# - Supabase:  https://supabase.com/dashboard
```

### Database Security

1. **Enable Row-Level Security (RLS)** in Supabase for all tables
2. **Use SSL connections** (default for Supabase)
3. **Restrict database access** to specific IPs where possible
4. **Enable daily backups** in Supabase
5. **Rotate database password** every 90 days

### Application Security

1. **Always use HTTPS** in production (Let's Encrypt / Cloudflare)
2. **Set `NEXTAUTH_URL`** to your actual production URL
3. **Enable HSTS** (already in `next.config.ts`)
4. **Set up CSP** (Content Security Policy) — currently disabled due to multi-source dependencies
5. **Monitor logs** for suspicious activity (consider Sentry)
6. **Rate limit** authentication endpoints (consider Upstash/Redis)

### Password Security

- Minimum 6 characters (enforced)
- Bcrypt hashed (cost factor 10)
- No password reset without email verification
- **Admin password rotation** required every 90 days

### API Security

- All API routes (except public) require valid session
- Admin routes require `role: "ADMIN"`
- CSRF protection via NextAuth
- Input validation via Zod on critical endpoints

## Known Security Considerations

### Currently Implemented
- ✅ Bcrypt password hashing (cost 10)
- ✅ NextAuth session management (JWT-based)
- ✅ Middleware route protection (`proxy.ts`)
- ✅ Admin role-based access control
- ✅ Input validation (Zod on most endpoints)
- ✅ SQL injection protection (Prisma parameterized queries)
- ✅ XSS protection (React auto-escaping)
- ✅ Security headers (X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy, HSTS)
- ✅ Audit logging for admin actions

### Planned / Recommended
- ⏳ Two-factor authentication for admin
- ⏳ Rate limiting on auth endpoints (Upstash/Ratelimit)
- ⏳ Content Security Policy (CSP) — requires careful source mapping
- ⏳ CSRF token rotation
- ⏳ IP-based blocking for repeated failures
- ⏳ Email verification on signup
- ⏳ Session invalidation on password change
- ⏳ Automated security scanning (Snyk, Dependabot)

## Disclosure Policy

When we receive a security report, we will:

1. **Confirm receipt** within 48 hours
2. **Investigate** and provide an initial assessment within 5 business days
3. **Develop a fix** based on severity:
   - **Critical** (data breach, RCE): within 7 days
   - **High** (auth bypass, privilege escalation): within 14 days
   - **Medium** (XSS, CSRF): within 30 days
   - **Low** (information disclosure): within 90 days
4. **Release a patch** and notify users
5. **Public disclosure** 30-90 days after the fix (coordinated disclosure)

## Bug Bounty

We do not currently offer a paid bug bounty program. However, we deeply
appreciate responsible disclosure and will:

- Credit you in release notes (if desired)
- Add you to our contributors list
- Potentially offer swag/recognition for significant findings

## Security Hall of Fame

(Will be populated as security researchers report issues)

## Contact

- **Email:** abn21.noman@gmail.com
- **Response time:** 48 hours
- **Encryption:** PGP key available on request

---

**Last updated:** 2026-08-02
