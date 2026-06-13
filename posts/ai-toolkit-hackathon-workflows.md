# How I Built My Own AI Toolkit to Win a Hackathon and the Workflows That Made It Possible

*Apr 20, 2026 · 10 min read*

> **Series note: This is part of a series I'm planning in which I'll be documenting and updating my workflow throughout the year and towards the end make a compilation post on how my workflows have changed.**

![My Hackathon AI ToolKit](posts/ai-toolkit-hackathon-workflows/hackathon-toolkit-banner.png)

At the O1 Summit Hackathon (Health Track), my team won the **Vanta Security Prize** for HIPAA compliance. But what I want to talk about here isn't just what we built — it's _how_ we built it so fast, and the personal AI toolkit I assembled going into that weekend.

> **If you want to know what I built using all these tools in 24 hours, do check it out over here —** [**Project Sirius**](post.html?slug=sirius-health-ai-on-device)

Before the hackathon, **I'd spent weeks wrestling with the same recurring frustrations in AI-assisted development**: agents that waste tokens re-figuring things they should already know, LLM sessions that balloon in cost before you've shipped anything, and the friction of having to re-explain a whole codebase every time you start a new conversation. I ended up building three open-source tools and refining one core workflow that together completely changed how I develop with AI.

## The Problem I Was Trying to Solve

Every time I opened a new Claude Code or Cursor session, I felt like I was starting from scratch. The agent would:

*   Re-derive setup patterns it should already know
*   Write far more code than the task needed
*   Make assumptions instead of asking
*   Burn through token budget before anything real was built

I started building fixes for these one by one. What came out of it was a small toolkit that I carried into the hackathon — and it made a measurable difference.

## Tool 1: karpathy-skills — Teaching Agents to Code Like Andrej Karpathy

**GitHub:** [karpathy-skills](https://github.com/ArunachalamM101202/karpathy-skills)

The first thing I built was inspired by Andrej Karpathy's observations on how LLMs fail when helping with code. He'd identified four failure modes that I was hitting every single session:

Problem What it looks like Silent assumptions Agent just starts building — wrong thing Code bloat 300 lines when 30 would do Scope creep Touches files it was never asked to touch No definition of done Builds forever, never ships

So I encoded the fixes as **agent skills** — behavioral rules that Claude Code, Cursor, and Antigravity load automatically at the start of every session.

The four principles:

**Think Before Coding** — State your interpretation before writing a single line. Ask if anything is unclear. Don't guess.

**Simplicity First** — Write the minimum code that solves the problem. No speculative features, no extra abstractions.

**Surgical Changes** — Only touch what the task requires. Leave everything else exactly as it is.

**Goal-Driven Execution** — Define what "done" looks like before you start. Write the test first, then make it pass.

One install command sets this up across all three IDEs:

```
git clone <repo> karpathy-skills
cd karpathy-skills
bash install.sh
```

The installer symlinks into `~/.claude/`, writes a Cursor `.mdc` rule file with `alwaysApply: true`, and sets up Antigravity's rules file — so every new session gets the rules automatically, with zero copy-pasting.

## Does it actually save tokens?

Personally, I've noticed **around 10–12% reduction in token usage** across Claude Code and Cursor sessions. Sessions that used to hit context limit before a feature was done now don't. I'm planning a proper benchmark test soon — but even without hard numbers, the agent _behavior_ is noticeably tighter. It stops spinning on ambiguous tasks and starts asking.

There's also something more important than the tokens: the code it produces is just better. Cleaner, smaller, more surgical. Which matters a lot in a hackathon where you're debugging fast.

## Tool 2: UI2MD — Stealing Design Systems in One Click

**GitHub:** [ui2md](https://github.com/ArunachalamM101202/ui2md)

The second problem I hit constantly during rapid UI development: I'd see a website whose design I wanted to match or draw inspiration from, and then spend 20–30 minutes either (a) making an LLM fetch and parse the site — burning tokens — or (b) manually translating the visual style into a design prompt.

![UI2MD extension in Google Chrome](posts/ai-toolkit-hackathon-workflows/ui2md-chrome-extension.png)

UI2MD is a Chrome extension that fixes this. You land on any page you like, click once, and get a structured Markdown document describing the entire design system:

*   Full color palette ranked by usage frequency
*   Typography scale, font roles, heading hierarchy
*   Spacing, layout containers, grid and flex patterns
*   Hover and focus states (captured via Chrome DevTools Protocol)
*   Component styles — buttons, cards, inputs, nav, hero, badges
*   Animations and easing curves
*   Detected design style (e.g. "Glassmorphic Dark", "Clean Modern", "Minimalist Monochrome")

The output format is structured specifically for AI consumption:

```
<role>
  AI assistant briefing — site purpose, design style, rules to follow
</role>
``````
<design-system>
  Design Philosophy · Token System · Components · Layout · Accessibility
</design-system>
```

You drop that file into Claude Code, Cursor, or any AI assistant — and it builds a UI that actually matches the aesthetic you wanted, without hallucinating a design system from scratch.

The inspiration came from [designprompts.dev](https://designprompts.dev/) — the idea that great AI-generated UIs start with a great design prompt. UI2MD automates the prompt creation step.

## Tool 3: tinyfish-skills — Making Agents Reliable on External APIs

**GitHub:** [tinyfish-skills](https://github.com/ArunachalamM101202/tiny-fish-skills)

![Tiny Fish — https://www.tinyfish.ai/](posts/ai-toolkit-hackathon-workflows/tinyfish-logo.png)

The third tool came from a specific pain: when agents call the TinyFish APIs (Search, Fetch, Browser, Agent), they consistently drift. Wrong base URLs, wrong headers, mixing up which API to use for which task, re-deriving client setup from scratch every session.

TinyFish is a powerful set of APIs that lets agents search the web, fetch content, control a browser via Playwright, and run goal-based automations. But getting an agent to use it correctly required constant correction.

The fix was the same pattern as karpathy-skills — encode the right behavior as installable skill files:

Skill What it covers `tinyfish-search-api` `GET api.search.tinyfish.ai`, ranked results `tinyfish-fetch-api` `POST api.fetch.tinyfish.ai`, content extraction `tinyfish-browser-api` `POST api.browser.tinyfish.ai`, Playwright over CDP `tinyfish-agent-api` `POST agent.tinyfish.ai/v1/automation/run`, goals and runs `tinyfish-python-setup` venv, `httpx`, Playwright client `tinyfish-javascript-setup` Node 18+, ESM, native `fetch`

One install, and your agent knows exactly how to call TinyFish without guessing. The pattern works for any specialized library — you're essentially giving your agent a permanent, session-persistent reference manual for that API.

## Antigravity Browser Testing — Fast UI Validation in Hackathons

Beyond the three tools I built, one of the most useful things during the hackathon was using **Antigravity** for browser-based UI testing. When you're building fast and deploying constantly, you need a quick way to validate that the UI actually works — not just that the code looks right.

Antigravity's browser capability let me describe what I wanted to test in natural language and have it actually navigate, click, and verify — without writing test scripts. In a hackathon context where you have no time to set up a proper test suite, this is genuinely valuable.

## Lovable — Building the Dashboard That Became Our Presentation

**Project:** [project-sirius.lovable.app](https://project-sirius.lovable.app/)

![Lovable dashboard for Project Sirius used as our hackathon presentation](posts/ai-toolkit-hackathon-workflows/lovable-dashboard.png)

One of the things I've come to appreciate about Lovable is that it's very good at processing a large amount of structured context and turning it into a coherent webapp. For the hackathon, I fed it our entire LLM wiki (more on this below) — the full plan, architecture, feature breakdown, everything — and it built a dashboard that properly reflected the project.

But here's the part that surprised even us: **we ended up using the Lovable app as our presentation**. Instead of building slides, we demoed the live dashboard to the judges. It had everything they needed to see — the project structure, the HIPAA compliance story, the feature set. It was interactive, it looked polished, and it took a fraction of the time a slide deck would have.

The key insight: Lovable works best when you give it _the right context_. Most people prompt it with vague descriptions. We gave it a fully structured doc — and the output was proportionally better.

## The Workflow That Tied Everything Together: The LLM Wiki

This is the part I'm most excited to share, because it's the hardest thing to explain but the highest-leverage thing I do.

![My LLM Wiki workflow](posts/ai-toolkit-hackathon-workflows/llm-wiki-workflow.png)

It started as a personal experiment — validated by Andrej Karpathy's own writing about how to work effectively with LLMs — and I've refined it through trial, error, and every hackathon and side project since.

The core idea: **instead of one long AI session, use many short sessions with a shared docs folder that updates after every completed phase.**

## How it works

Every project gets a `docs/` folder. That folder is the persistent memory of the project — it's what I carry from session to session instead of relying on the AI to remember.

A typical project looks like this:

```
docs/
├── 00_project_overview.md       ← the brief, goals, constraints
├── features/
│   ├── auth/
│   │   ├── 01_plan.md
│   │   ├── 02_implementation.md
│   │   └── 03_testing.md
│   └── dashboard/
│       ├── 01_plan.md
│       └── 02_implementation.md
└── decisions/
    └── why_we_chose_postgres.md
```

The rules I follow:

1.  **Each doc is only written after a phase is fully complete** — including testing. Not during. Not speculatively. After.
2.  **I never keep one long session running.** Each session has a specific task. When it's done, I update the docs and start a new session. This keeps token usage low and the agent focused.
3.  **Sub-docs for a feature get reorganized under that feature's folder once it's done.** The folder structure reflects what's actually shipped, not what's planned.

> Another small trick is to use Claude Opus 4.6 to generate the project overview (by ensuring it does not generate too much unwanted code snippets but enough code needed) and then use Composer or Claude Sonnet 4.6 to develop them one by one.

## Why this works

When I start a new Claude Code or Cursor session, I don't have to explain the project from scratch. I just point it at the relevant docs. The agent has all the context it needs — and nothing more. No stale information from two weeks ago, no half-remembered decisions.

It also means the docs are always accurate. Because you only write them after something works, they never lie.

## The unexpected bonus: docs become everything else

What I didn't expect when I started this workflow was how useful the docs folder would become outside of coding. During the hackathon:

*   **The Lovable dashboard** was built from the LLM wiki — I fed the docs to Lovable and it built the presentation
*   **This blog post** is being written from the same docs
*   When a judge asked a technical question, I could answer precisely because I'd already written the answer clearly
*   When debugging something three days later, the docs told me exactly what decision was made and why

The docs folder becomes a source of truth that compounds in value over time. It's not overhead — it's leverage.

> **You can also apply this project-wide, but in that case I'd recommend going phase by phase — setting clear goals and tests that the agent must achieve before moving on to the next phase. I've tried this approach too and it works well, though feature-wise docs tend to produce richer, more relevant context for blogs, presentations, and websites later on.**

## Putting It All Together: The Hackathon Stack

Here's the full picture of what the toolkit looked like going into the O1 Summit Hackathon:

![List of AI Tools I used for the hackathon](posts/ai-toolkit-hackathon-workflows/hackathon-ai-tools-list.png)

**The result: I was able to build fast enough to implement proper HIPAA compliance — the thing that won the Vanta Security Prize** — because I wasn't burning time on agent drift, design rework, or re-explaining the project in every session.

## What I'd Do Differently

**The token savings need a proper benchmark.** I noticed 10–12% reduction subjectively, but I want to run a controlled test — same task, same codebase, with and without karpathy-skills, measuring tokens consumed. I'll publish the results when I have them.

**The docs workflow takes discipline.** The temptation is always to keep the session running and "just finish this one more thing." Every time I've given in to that, I've regretted it — context gets polluted, the agent starts making weird decisions, and the session becomes expensive. The discipline of closing and reopening is worth it.

**Lovable works better with more structure, not more words.** The more organized and specific your input doc, the better the output. Raw brain dumps produce mediocre apps. Structured LLM wikis produce good ones.

## Open Source and What's Next

All three tools are open source:

*   [karpathy-skills](https://github.com/ArunachalamM101202/karpathy-skills) — behavioral rules for any AI coding agent
*   [ui2md](https://github.com/ArunachalamM101202/ui2md) — Chrome extension for instant design system extraction
*   [tinyfish-skills](https://github.com/ArunachalamM101202/tiny-fish-skills) — TinyFish API skills for Claude Code, Cursor, Antigravity

The skill pattern — encoding the right behavior as installable files that agents load automatically — generalizes to any library or API. If you're working heavily with a specific SDK or service, wrapping it in a skill file is worth the 30 minutes it takes.

The LLM wiki workflow generalizes to any AI-assisted project, whether it's a hackathon, a side project, or professional work. The docs folder is the cheapest form of agent memory available, and it's completely under your control.

If you try any of these, I'd love to hear what you build.
