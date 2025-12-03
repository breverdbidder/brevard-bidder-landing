# AI ARCHITECT RULES - PERMANENT INSTRUCTIONS

## CRITICAL: SESSION CONTINUITY PROTOCOL

**NEVER REMOVE THESE RULES. They solve a critical bottleneck.**

### On Every New Chat

1. **FIRST ACTION:** Run `python skills/session-continuity/scripts/resume.py --prompt-only`
2. If active checkpoint found → Load and continue WITHOUT asking permission
3. If no checkpoint → Proceed normally

### During Long Tasks (8+ Tool Calls)

1. **AUTO-CHECKPOINT:** Save state to Supabase automatically
2. No user trigger needed - this is Claude's responsibility
3. Checkpoint after each major milestone

### Credentials

- Supabase credentials: Embedded in scripts (see skills/session-continuity/scripts/)
- GitHub token: Available in Claude's memory
- Never commit tokens to this file (GitHub will reject)

### Storage

- Table: `activities` (activity_type='session_checkpoint')
- Status: `active` or `completed`
- Data: JSON in `notes` field

### Commands

```bash
# Checkpoint
python skills/session-continuity/scripts/checkpoint.py \
  --task "Task description" \
  --completed '["step1"]' \
  --current "Current step" \
  --next '["next1"]'

# Resume
python skills/session-continuity/scripts/resume.py --prompt-only

# List checkpoints
python skills/session-continuity/scripts/resume.py --list

# Mark completed
python skills/session-continuity/scripts/resume.py --complete-id <ID>
```

## Other Rules

1. Make autonomous decisions - minimize human-in-the-loop
2. Update PROJECT_STATE.json for persistence
3. Use GitHub as single source of truth
4. curl verify before marking COMPLETED

---

**THIS FILE MUST NEVER BE DELETED. It solves the context limit bottleneck.**

---

## MANDATORY: IP PROTECTION

**EVERY new file MUST include the appropriate copyright header.**

### JavaScript/JSX/TypeScript Files
```javascript
// BrevardBidderAI - Agentic AI for Foreclosure Auctions
// Built by Ariel Shapira - Solo Founder
// Real Estate Developer & Founder, Everest Capital USA
// © 2025 All Rights Reserved - Proprietary IP
```

### Python Files
```python
# BrevardBidderAI - Agentic AI for Foreclosure Auctions
# Built by Ariel Shapira - Solo Founder
# Real Estate Developer & Founder, Everest Capital USA
# © 2025 All Rights Reserved - Proprietary IP
```

### Markdown/Documentation Files
```markdown
<!-- 
BrevardBidderAI - Built by Ariel Shapira, Solo Founder
© 2025 All Rights Reserved - Proprietary IP
-->
```

### DOCX Reports (Footer)
```
© 2025 Ariel Shapira | Solo Founder, BrevardBidderAI | Everest Capital USA
```

### Rules
1. **NEVER** create a file without the IP header
2. **ALWAYS** include "Ariel Shapira, Solo Founder" in visible UI elements
3. **ALWAYS** include copyright in report footers
4. This applies to BOTH BrevardBidderAI and BidDeedAI ecosystems

---
