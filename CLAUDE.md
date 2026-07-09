
### COPILOT ADOPTION PROTOCOL (Mar 30 2026, PERMANENT)

**1. STRUCTURED ISSUE TEMPLATES:** All SUMMIT issues MUST use `.github/ISSUE_TEMPLATE/summit-task.yml`. Required fields: objective, acceptance (checkboxes), scope, constraints, exit_proof. CC rejects issues missing acceptance or exit_proof. Freeform issues get template fields added as first commit.

**2. SECURITY SCAN AGENT:** `.github/workflows/security-scan.yml` on ALL PRs to main/production. 4 jobs: Semgrep SAST (p/default+p/secrets+p/javascript+p/typescript+p/python) → Gitleaks → npm/pip audit → Security Gate. CRITICAL/HIGH=blocked. All findings logged to security_scan_results. Sentinel monitors failures.

**3. SESSION DECISION LOG:** Every CC session MUST produce `.claude/session-logs/{date}-{issue}.yml`. Schema: session metadata, decisions array (step/action/result/reason), artifacts array, verification array (check/proof/status per Honesty Protocol). Committed last. Pushed to session_decision_logs table. XGBoost retrains on this data nightly.
