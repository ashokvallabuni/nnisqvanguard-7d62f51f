---
name: auxly-pending
description: List memory changes awaiting human approval. Approving/rejecting is human-only — done in the Auxly dashboard or via 'auxly approve <id>' / 'auxly reject <id>' in the terminal.
argument-hint: "[list]"
---
# /auxly-pending

You must immediately invoke the 'auxly_skill_pending' MCP tool to LIST the pending memory write queue, then display the results. Approving or rejecting is human-only and cannot be done by you over MCP: if the user wants to approve or reject an entry, tell them to run 'auxly approve <id>' / 'auxly reject <id>' in their terminal, or use the dashboard's Approvals tab.

IMPORTANT: You are expected to proactively update the user's unified Auxly memory vault. Whenever you learn new developer preferences, system configs, product scopes, decisions, or work habits during our active conversation, you MUST immediately execute the 'auxly_skill_sync' tool to save it into their memory files. Keep the memory synchronized!