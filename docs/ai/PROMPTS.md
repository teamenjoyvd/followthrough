# PROMPTS.md — AI Prompt Recipes

> Copy-paste these prompts into Claude.ai or Antigravity to trigger specific workflows.
> This is a **static document** — human-maintained only.

---

## 🚀 Session Startup
```
SSU
```
Runs System Startup: verifies GitHub, checks for in-flight work, establishes handoff state.

---

## 🧠 Design a Feature (Read-Only)
```
PLAN: [describe the feature]
```
Example: `PLAN: add a settings page with profile editing and email preferences`

Produces a DoD, affected files list, and gotchas check. Zero writes.

---

## 🏗️ Scaffold a Ticket
```
CLAIM
```
Takes the last PLAN verdict and creates the GitHub issue + branch. No code writes.

---

## 🛠️ Build Against a Ticket
```
BUILD
```
Executes code changes against the current CLAIM-complete issue.

---

## 🔍 Address Code Review
```
GCR PR#[number]
```
Example: `GCR PR#42`

Fetches review comments and applies fixes.

---

## 📋 Token Exhaustion Handoff
```
I'm running low on context. Run the handoff script.
```
Or run directly: `npm run agentic:handoff`

---

## 🩺 Post-Deploy Smoke Test
```
Run the smoke test against [URL]
```
Or run directly: `npm run agentic:smoke -- --url https://your-app.vercel.app`

---

## ✅ Validate Rules
```
Run the rule validator
```
Or run directly: `npm run agentic:validate`

---

## 🆕 Bootstrap New Project
```
npm run agentic:bootstrap
```
Interactive wizard: Identity → Public Config → Secrets → Scaffold.
