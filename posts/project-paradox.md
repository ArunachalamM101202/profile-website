# I Was Building a Mafia Game. I Accidentally Built an AI Framework.

*Mar 27, 2026 · 45 min read*

*A deep dive into the memory architecture, prompt engineering, and accidental framework that came out of 10 weeks during [Supercell's AI Innovation Lab](https://ailab.supercell.com/) at [Hive Coding School](https://www.hive.fi/)*

![Found the Supercell logo at Supercell HQ in Helsinki, Finland](posts/project-paradox/supercell-hq-logo.png)

In 10 weeks at Supercell's AI Innovation Lab in Helsinki, I accidentally built a multi-agent AI framework called **_Project Paradox_** along with my teammate Erina Karati while trying to make a Mafia game. This is the full technical story, the architecture decisions, the rewrites, the research that inspired it, and the moments where the AI did things we didn't explicitly program. If you've ever wanted to give a game character a real brain, this is how we did it.

---

## Chapter 1 — Nobody Plans to Build a Framework

In the summer of 2024, I was one of 16 people invited to Supercell's AI Innovation Lab in Helsinki — a pilot program where small teams were given 10 weeks to build AI-powered games from scratch.

![The first batch of Supercell's AI Innovation Lab, Helsinki, May 2025. 16 people, 10 weeks, and a brief to build something interesting with AI and games.](posts/project-paradox/ai-lab-first-batch.png)

No templates. No hand-holding. Just a brief: **build something interesting with AI and games.**

**We started with Blood on the Clocktower.**

If you haven't played it, it's a social deduction game, think Mafia, but with more roles, more deception, and a lot of reading people. We loved playing it with our friends, and the moment we started exploring LLMs and multi-agent systems, the idea felt obvious: _what if all the characters were AI?_

What if instead of your friends lying to you, it was agents — with their own secrets, their own reasoning, their own memory of what happened last night?

So we started building. And almost immediately, we started rewriting.

Every new mechanic needed a new tool. Agents needed to talk to each other, build a conversation system. Agents needed to remember things, build a memory system. Agents needed to vote, build a voting system. Agents needed to react to game events, build an event system. And each time, we were hard-coding it to Blood on the Clocktower. The voting logic assumed specific roles. The memory was tuned for a deception game. The dialogue assumed hidden information.

We were building a game, but we kept accidentally building infrastructure.

**At some point (I don't remember the exact moment) we stopped and asked a different question.**

> What if instead of building tools _for_ this game, we built tools _for any game_?

What if talking to other characters, remembering conversations, reacting to events, making plans — what if those were just capabilities you could hand to any character in any environment?

The game didn't matter. The framework did.

So we pivoted. We stopped asking "what does the Blood on the Clocktower killer need to do?" and started asking "what does _any_ character need in order to feel like they have a mind?" The answer we arrived at, through a lot of rewrites and a few too many late nights, was this:

**Memory. Emotion. Belief. Personality. And a plan.**

Give a character those five things, wire them together properly, and you don't get a scripted NPC anymore. You get something that starts to feel like it's actually _thinking_.

This blog is the story of how we built that, the architectural decisions behind it, the research that inspired it, and the moments where it surprised even us and how we presented it to multiple CEO's and Supercell developers.

---

## Chapter 2: From NPCs to Agents — A Shift in Thinking

Traditional game characters are liars. Not in the fun, deceptive way. They lie to you about having a mind.

They say "Good morning!" when you walk past because a developer wrote "if player_nearby: say greeting." They have the _appearance_ of personality, a name, a sprite, maybe a catchphrase, but nothing underneath. Talk to them twice and the illusion collapses. **They don't remember your first conversation.** They don't care that you just burned down the tavern. They're vending machines with faces.

![Traditional NPCs vs Our Agent in Games](posts/project-paradox/npc-vs-agent.png)

This is what we kept bumping into as we were designing our Blood on the Clocktower agents. We'd get excited about a mechanic, implement it, test it and then the character would say something that made it obvious there was nobody home. The dialogue felt hollow because it _was_ hollow. There was no continuity, no inner state, nothing that persisted between one moment and the next.

The question we kept coming back to was: _what's the minimum set of things a character needs to actually feel like they're thinking?_

We looked at the research. The closest thing to what we were trying to build was a [**2023 Stanford and Google paper — _Generative Agents: Interactive Simulacra of Human Behavior_ by Park et al.**](https://arxiv.org/pdf/2304.03442) where 25 LLM-powered agents lived in a Sims-like sandbox, formed relationships, spread news, and even coordinated a Valentine's Day party that nobody explicitly programmed. Their architecture had three core components: memory, reflection, and planning. It was the right skeleton. But it was designed for open-ended social simulation, not for a game framework that developers could actually pick up and use.

We needed something more structured. More mechanical. Something where the character's inner state wasn't just flavor — it _drove_ behavior in ways the game engine could act on.

So we defined five things every character in our framework needed to have:

![Brief overview of the major components powering Project Paradox](posts/project-paradox/paradox-components-overview.png)

**Personality** — who they are, expressed as a natural language string that seeds every single LLM call they make. Sakura is spontaneous and artistic. Charles is stoic and skeptical. This never changes. It's the bedrock.

**Emotion** — a live, 5-dimensional vector of joy, sadness, fear, anger, and disgust. Not cosmetic. These numbers shift every time something happens to the character, and they flow directly into how the character speaks, plans, and votes.

**Belief** — a trust score for every other character in the world, between 0.0 and 1.0. Who do they trust? Who are they suspicious of? This updates with every new memory and decays naturally over time when relationships go quiet.

**Memory** — not a log file. A three-tier architecture inspired by how humans actually remember things, with short-term recall, high-importance retention, and long-term semantic retrieval. This is the hardest one to get right, and the most important. We'll spend an entire chapter on it.

**A Plan** — structured, machine-readable goals the character is actively working toward. Not vibes. Actual actions: move here, pick this up, talk to that person, for this specific reason.

Give a character all five of these, wired together so that each one influences the others, and something shifts. They stop being NPCs you interact with and start being agents you _share a world with_.

Our village of _Saint Paul_ (inspired from where we did our Masters) had six of them: Charles, Adam, Toby, Blossom, Sakura, and Gwen. Each defined at the start by nothing more than a name, a role, and a personality string. A few words that became the seed of an entire simulated inner life.

![Our first batch of agents along with their personalities](posts/project-paradox/agents-personalities.png)

The rest of this blog is about how we built the machinery that made those few words matter.

---

## Chapter 3: The Hardest Problem — Memory

Here's the thing nobody tells you about building AI characters: **dialogue is the easy part.**

Getting an LLM to produce one natural, in-character line of conversation is almost trivially straightforward once you have a decent prompt. The hard part is making that line feel like it comes from someone who was _there yesterday_. Someone who remembers what you said to them three days ago, who noticed something odd last week and has been quietly thinking about it since, who connects today's conversation to something that happened before you even met them.

> Memory is the difference between a character that feels alive and one that feels like a very convincing chatbot that resets every time you talk to it.

This was the hardest technical problem I worked on. And the solution we arrived at was directly inspired by _Park et al.'s Generative Agents paper_ — though we had to adapt it significantly for our constraints, and the journey from v1 to the final architecture taught us more than the research did.

### V1: The Naive Approach

The first memory system was a **_simple list_**. Every time something happened to a character, a conversation, an observation, a game event, we appended it to their memory. When we needed to build a prompt, we'd take the last N items from that list and inject them.

It worked. Until it didn't.

The problem was the _context window_. We were running a quantized llama3 locally via Ollama, and the model had a 4,096 token limit. A rich prompt already consumed a significant chunk of that, character description, emotional state, current location, conversation history. The memory block was fighting for whatever space was left. We started with 10 items. The prompts bloated. Responses degraded. We did the math and landed on 7.

Seven wasn't arbitrary. There's a piece of cognitive psychology called Miller's Law:

> The observation that humans can hold roughly 7 items in working memory at once.

We weren't trying to be clever about it; the token budget forced us there, and the psychology happened to agree. Seven items. Short-term RAM. That's Tier 1.

But then we had a new problem. **If RAM only holds 7 items and we compress the rest, what happens to the memory of the most important thing that ever happened?**

It gets buried in a summary, averaged out, diluted. A character who witnessed a murder on Day 1 shouldn't have that memory compressed into a footnote by Day 5.

### The Three-Tier Architecture

This is where the design got interesting. I built a custom memory system with three distinct tiers, each serving a different purpose:

![Three-tier memory architecture](posts/project-paradox/memory-three-tier.png)

**Tier 1 — RAM (Short-Term Memory)** The 7 most recent memories, always present in every prompt. Fast, immediate, no retrieval needed. Think of this as what the character is actively holding in their head right now.

**Tier 2 — Core Memory (The Cache)** Any memory with an importance score of 8 or above, on a 1 to 10 scale, gets written here permanently and _never_ compressed away. A casual conversation might score a 3. Witnessing an argument scores a 6. Discovering who the killer is scores a 10. **Core memory is the character's most significant experiences, always retained, always accessible.**

**Tier 3 — FAISS (Long-Term Semantic Memory)** When RAM overflows, the older memories get compressed by the LLM into a summary, scored for importance, and then embedded into a per-character FAISS vector index. They're gone from the prompt context, but not forgotten. They can be retrieved semantically, by meaning, not by keyword. Since it is indexed per character, each agent's experience is not mixed up with one another, ensuring that Charles's suspicions remain Charles's, Sakura's memories of the apple conversation remain Sakura's, and no two characters ever share a past they didn't actually live.

The compression isn't lossy in the way you might fear. Before a character makes a plan or casts a vote, we query their FAISS index with a task-specific question, _"What do I need to remember to decide what to do?"_ or _"What do I know that helps me decide who to vote for?"_, and the most semantically relevant memories surface back into the prompt. A conversation from three game days ago, long since compressed, comes back exactly when it's relevant.

### The Memory Insertion Pipeline

Every time a new memory is stored, a six-step pipeline runs:

![Memory insertion pipeline](posts/project-paradox/memory-insertion-pipeline.png)

**Step 1 — Store in RAM.** The memory gets a UUID and goes into the character's short-term list.

**Step 2 — Core memory check.** If importance is 8 or above, it also goes into core memory. Permanently.

**Step 3 — Emotion update.** The memory text is sent to the LLM with a focused prompt: _how should this character's emotional state change given what just happened?_ The model returns a JSON delta — small shifts across joy, sadness, fear, anger, disgust — and we apply them, clamped between 0.0 and 1.0.

**Step 4 — Belief update.** A separate LLM call asks which other characters are implicated in this memory and by how much trust should shift. It returns a simple CSV — `Sakura, 0.05` or `Charles, -0.1` — and we update the trust scores accordingly. Before applying the update, existing scores are exponentially decayed based on elapsed time. Trust that isn't reinforced fades naturally.

**Step 5 — RAM compression.** If RAM now holds more than 7 items, all uncompressed memories are collected, summarized by the LLM into a single paragraph, scored for importance, embedded into FAISS, and cleared from RAM. What remains is one compressed memory item representing everything that was just collapsed.

**Step 6 — Reflection trigger.** If 3 or more memories share the same linked character, a reflection is triggered. The LLM generates an introspective thought about that person, something the character has _concluded_ about them based on accumulated evidence, not just observed. This is the closest thing to genuine opinion formation in the system.

### The Moment It Proved Itself

I was recording demo footage late night in the lab, running the agents through a cozy village scenario. Two characters had a conversation about apple prices, a throwaway exchange, nothing significant. Days of game time passed. Other conversations happened. That early memory got compressed, summarized, embedded into FAISS, long gone from any prompt context.

**Then, in a completely separate conversation much later, one character referenced it.** Not because I scripted it. Not because I prompted for it. Because when the system built that character's prompt for that conversation, the FAISS retrieval surfaced the apple memory as semantically relevant — and the LLM wove it in naturally.

> _"Prices are still too high for me."_

That was the moment I knew the memory architecture was working. Not because it was technically impressive, but because it felt like something a _person_ would say from a collection of experiences.

---

## Chapter 4: Emotions and Beliefs Are Not Decoration

Most AI character systems treat emotion as a display layer. The character looks sad. The character sounds angry. But underneath, the decision-making is the same regardless. Emotion is costume, not consequence.

We made a deliberate choice early on to do the opposite. **_In Project Paradox, a character's emotional state and their trust in others are not there to make the dialogue feel warmer_**. They are mechanically wired into every decision the character makes. Change the emotion, you change the behaviour. Change the belief, you change the vote. These numbers have consequences.

This chapter is about why that matters — and the single example that made it clearest to us.

### The Hat Example

> Two agents. John and Anna. John wants his hat back.
>
> He walks over to Anna and asks for it. She gives it to him, no friction, no drama. A simple exchange. From the outside, nothing interesting happened.

![The hat example — one event, two entirely different emotional outcomes](posts/project-paradox/hat-example.png)

But watch what happens inside each agent after that conversation ends.

The conversation gets summarized into a memory — one compressed line that captures what occurred. And here is where it gets interesting, because each agent summarises it from their own perspective, through the lens of their own personality, emotional state, and existing beliefs.

> **John's memory of the event:** _"I asked Anna for my hat and she returned it."_ John accomplished what he set out to do. His emotion vector shifts — joy ticks up. His belief score for Anna increases slightly. She was cooperative. She can be trusted. Everything is fine.
>
> **Anna's memory of the exact same event:** _"John came to get his hat back. He didn't trust me with it."_ Same conversation. Same words. Completely different interpretation. Anna's belief score for John dips. Her sadness nudges upward. To her, this wasn't a friendly exchange — it was a signal that John doesn't feel comfortable leaving his belongings with her.

**One event. Two agents. Two entirely different emotional and relational outcomes, neither of which was explicitly programmed**. They emerged from the combination of perspective-aware memory summarization, personality-driven LLM interpretation, and the mechanical connection between memory and emotional state.

This is why we built the system this way. Run this village for a week of game time and the relationships that form between characters are ones nobody designed. **_John and Anna might grow distant without ever having an argument_**. Two characters who started as strangers might develop genuine trust through a series of small cooperative moments. A character who feels increasingly fearful might start voting defensively, suspecting people they used to trust.

None of that is scripted. It's emergent, and it only emerges because emotion and belief are doing real work, not decorative work.

### The Emotion Vector

Every character carries a 5-dimensional emotion vector — _joy, sadness, fear, anger, disgust_ — each a float between 0.0 and 1.0. After every new memory is stored, the LLM is asked a focused question: given what this character just experienced, how should their emotional state shift?

The response comes back as a JSON delta:

```json
{"joy": 0.1, "sadness": 0.0, "fear": -0.05, "anger": 0.0, "disgust": 0.0}
```

Small, bounded shifts. We apply them and clamp the result to the valid range. Over time, these micro-adjustments accumulate into a genuine emotional trajectory. A character who has had a bad few days will carry that in their numbers, and the LLM, seeing those numbers in every subsequent prompt, will produce dialogue and decisions that reflect it naturally.

A character with high fear votes more defensively. A character with high anger is more confrontational in conversation. A character with high joy is more cooperative in planning. _The LLM doesn't need to be explicitly told "be angry" — it sees_ `anger: 0.8` _in the prompt context and the output adjusts accordingly._

### Belief Scores: A Living Trust Network

**Every character maintains a trust score for every other character in the world — a float between 0.0 and 1.0.** At the start, scores are initialised with a positive bias, between 0.6 and 1.0. These are villagers, not adversaries. They begin as a community.

From there, two forces act on every score continuously.

**Decay.** Trust that isn't reinforced fades. **We apply exponential decay based on elapsed time — the longer two characters go without meaningful interaction, the more their trust score drifts back toward a neutral baseline.** This mirrors something real: relationships require maintenance. Ignore someone long enough and the warmth fades, not because anything bad happened, but because nothing happened at all.

**Memory-driven updates.** Every new memory triggers a belief update. The LLM is asked which characters are implicated in the memory and by how much trust should shift. The allowed granularities are small — ±0.05, ±0.1, ±0.2 — which keeps the trust network stable rather than lurching around wildly after a single event.

These scores flow directly into prompts in plain language:

```
Current beliefs about others:
- Charles: 0.72 (moderate trust)
- Sakura: 0.91 (high trust)
- Blossom: 0.45 (low trust)
```

The LLM reads this the same way a person reads a room. Blossom at 0.45 gets treated with more guardedness. Sakura at 0.91 gets warmth. Charles at 0.72 gets something in between. Nobody programmed those specific social dynamics — they grew from accumulated memory and time.

### Why This Creates Endless Replayability

In a game like Mafia or Blood on the Clocktower, no two play throughs will ever produce the same outcome in our framework. Not because of random number generation, but because the LLM's probabilistic nature interacts with each character's unique psychological state, which is itself the product of a specific sequence of memories, emotions, and belief shifts that will never repeat exactly.

A fearful Gwen votes differently than a confident Blossom. A Charles who has grown suspicious of Sakura over three days of quiet distance will interpret her words differently than a Charles who just had a warm conversation with her an hour ago. The gameplay emerges from psychology, not from scripts. And the psychology emerges from memory.

The hat example is small. But scale it across six characters, dozens of interactions, and multiple game days — and you get a social world that surprises even the person who built it.

---

## Chapter 5: The Performance Crisis — From 5 Seconds to 700ms

There is a specific kind of dread that comes from watching someone use something you built and seeing them wait.

Not a loading spinner wait. Not a "this is a big file" wait. A dead, silent, nothing-is-happening wait that makes the person using it glance at you with the polite version of "is this broken?" We hit that wall hard about halfway through the build when we showed it some Supercell developers. And fixing it taught me more about systems design in two days than the previous five weeks combined.

### How We Got There

When the memory pipeline was first built, it was synchronous. Simple, logical, obvious. A conversation ends, you process it, you move on. Here's what "processing it" actually meant:

**Call 1 — Summarise the dialogue.** Take the full conversation history, send it to the LLM, get back a one or two sentence memory that captures what happened. This is the memory that gets stored.

**Call 2 — Score importance.** Send that summary back to the LLM with a prompt asking it to rate the memory's importance from 1 to 10. This determines whether it goes to core memory, how it gets weighted in retrieval, whether it triggers compression.

**Call 3 — Emotion update.** Send the memory to the LLM and ask how the character's emotional state should shift. Get back a JSON delta across five dimensions.

**Call 4 — Belief update.** Send the memory to the LLM and ask which other characters are implicated and how much trust should change. Get back a CSV of names and deltas.

**Call 5 — Compression check.** If RAM is now over 7 items, collect all uncompressed memories and send them to the LLM for summarisation into a single compressed memory item.

![Five synchronous LLM calls — the source of the 5-second freeze](posts/project-paradox/sync-calls-performance.png)

Five LLM calls. Each one between 800ms and 1.2 seconds on our local llama3 setup. Done one after another in a straight line.

The result was a **5 second freeze** after every single conversation. The player says goodbye to Sakura. Nothing happens. Five seconds later, the world moves again. For a game that's supposed to feel alive, 5 second freeze is a near-fatal flaw.

### The Diagnosis

The first instinct was to try to reduce the number of calls. Could we combine the summarisation and importance scoring into one prompt? Could we skip the belief update for low-significance conversations?

We tried. The combined prompts produced worse outputs — the LLM would conflate the tasks, giving vague summaries or ignoring one of the two instructions entirely. Skipping belief updates broke the trust network in subtle ways that only showed up days later in play testing with Supercell developers and other AI game developers, when characters were behaving oddly and we couldn't trace why.

![Presenting the core framework idea of Project Paradox during the 5th week to Supercell Developers at Supercell HQ](posts/project-paradox/presenting-supercell-hq.png)

The problem wasn't the number of calls. The problem was that we were running them in series when almost none of them actually depended on each other.

Look at the dependency graph:

![Call dependency graph — showing which calls can be parallelised](posts/project-paradox/dependency-graph.png)

- The **summary** depends on the conversation history. ✓ Must run first.
- The **importance score** depends on the summary. ✓ Must run after Call 1.
- The **emotion update** depends on the summary. ✓ Must run after Call 1.
- The **belief update** depends on the summary. ✓ Must run after Call 1.
- The **compression check** depends on the importance score. ✓ Must run after Call 2.

Calls 3 and 4 had zero dependency on each other. They both needed the summary — and once the summary existed, they could run simultaneously. Call 2 could also run in parallel with 3 and 4. The only hard sequencing constraint was: generate the summary first, then fire everything else, then handle compression when the importance score came back.

We weren't blocked by the LLM. We were blocked by our own code structure.

### The Fix

The solution was Python's `threading.Thread` — deliberately simple, no Celery, no asyncio task queue, no distributed infrastructure. We were a two-person team with 10 weeks on the clock. The goal was the minimum change that solved the problem correctly.

The new flow looked like this:

```
Conversation ends
        │
        ▼
  [Call 1] Summarise dialogue  ← blocking, must complete first
        │
        ▼
  ┌─────┴──────┬──────────────┐
  │            │              │
[Call 2]   [Call 3]       [Call 4]
Importance  Emotion        Belief
  Score      Update        Update
  │            │              │
  └─────┬──────┴──────────────┘
        │ (all three complete)
        ▼
  [Call 5] Compression check (if needed)
```

Three LLM calls running simultaneously after the summary completed. The wall clock time dropped from the sum of five sequential calls to the sum of: one call, plus the slowest of the parallel three, plus one final call if compression was needed.

**Before: ~5,000ms.** After: **~700ms.**

### The Mental Model That Made It Clean

The reason this worked so cleanly — and the reason I'd recommend this pattern to anyone building LLM pipelines — is that we were treating the LLM as a **stateless pure function**.

Every call we made contained everything it needed. The emotion update prompt had the character's current emotional state, the memory text, the character prompt, all of it, self-contained. The belief update prompt had the full cast of characters, the memory text, the current trust scores. **Nothing relied on server-side session state inside the LLM. Nothing carried over between calls implicitly.**

When your LLM calls are pure functions — input in, output out, no shared mutable state — parallelism becomes trivial. You don't need to coordinate. You don't need locks. You fire them, you wait for all of them, you apply the results. The architecture made concurrency safe almost by accident.

There's a broader lesson here that goes beyond this project: **the bottleneck in an LLM pipeline is almost never the model**. It's the assumptions baked into how you've sequenced your calls. Draw the dependency graph first. If two calls don't depend on each other's outputs, there is no reason they should be sequential — and in a real-time interactive system, that reason matters enormously.

### What We'd Do Differently at Scale

> For a single-player game running locally, `threading.Thread` was exactly the right tool. But if this system were handling multiple concurrent users or sessions, the right answer would be a proper async task queue — Celery with a Redis broker, or Python's native asyncio with a task group. The pattern is identical; only the infrastructure changes.

We also identified that Call 5 — the compression check — could be deferred even further. Compression doesn't need to complete before the next interaction. The character doesn't need their compressed memory immediately. We could have fired it as a completely background job with no blocking at all, bringing the perceived response time down even further. We didn't implement that in the 10-week window, but it's the obvious next step.

---

## Chapter 6: Choosing the Brain, Then Teaching It to Converse

### Why Llama3 — And Why Local

Before we talk about how conversations work, it's worth addressing something that might already be nagging at you: why Llama3? Why a local open-source model when GPT-4o exists?

The answer starts with a research paper. While figuring out which model to use, I came across [**_"Large Language Models Passed the Turing Test"_**](https://arxiv.org/pdf/2503.23674) — a controlled, pre-registered study where participants held 5-minute conversations with both a human and an AI system simultaneously, then judged which was which. **_The results were striking. GPT-4.5, when prompted with a humanlike persona, was judged to be human 73% of the time — more often than the actual human it was being compared against. LLaMA-3.1-405B, with the same persona prompt, was judged human 56% of the time — statistically indistinguishable from a real person._** Meanwhile GPT-4o, despite being arguably the most capable model in the lineup, was identified as a machine at well above chance — a win rate of just 21%.

That last finding is the one that reframed everything for me. GPT-4o is objectively more powerful than LLaMA-3.1. It reasons better, codes better, handles complexity better. **But in open-ended human conversation, the kind where you're just talking, not solving, it reads as artificial.** Too clean. Too structured. Too optimised for correctness in a way that real people simply aren't.

For a game where players are supposed to feel like they're talking to a person, that's the wrong optimisation. We weren't looking for the most capable model. _We were looking for the most human-feeling one — for conversations that don't require technical knowledge or complex reasoning, just natural, grounded, in-character dialogue that doesn't break the illusion._

LLaMA-3.1 passed the Turing test at human parity. That was good enough for us. We ran it (Llama 3.1 8B quantized) locally via Ollama — and that decision came with a meaningful secondary benefit.

> No API costs. No rate limits. No data leaving the machine. No internet dependency during a live demo in Supercell HQ in front of the CEO of Supercell, the co-founder of Crunchyroll, the co-founder of Kabam Games, and the VP of Tech at Lego. Cloud APIs have a way of failing at exactly the wrong moment. Local inference does not.

The trade-off was speed — each LLM call takes between 800ms and 1.2 seconds on a decent local machine. Which is precisely why the parallelization from Chapter 5 wasn't optional. The model choice and the async architecture were directly linked decisions, each one making the other necessary.

### The Dialogue Engine: Three Modes, One Goal

With the model chosen and the memory system running, the next problem was conversation itself. Not just generating a line of dialogue, any LLM can do that, but **building a system where conversations feel dynamic, contextual, and genuinely different depending on who is talking to whom and what they've both been through.**

We built three distinct dialogue modes, each serving a different purpose in the game.

### Mode 1: Player Talks to a Character

The most familiar mode. The player initiates, the character responds. But unlike a standard chatbot exchange:

> _Every response is built from a prompt that contains the full psychological state of the character at that exact moment — their emotional vector, their trust scores, their recent memories, their current location, what items are nearby, what they're in the middle of planning._

The output is constrained to a single line of dialogue. This was a deliberate decision. Ask an LLM for "a response" and you get a paragraph. Ask for "one natural line of dialogue" and you get something that sounds like a person talking. The constraint is doing real work.

After every exchange, an intent detection check runs — a lightweight, focused prompt that asks a simple question: _should this conversation end?_ The answer is yes or no. Nothing more. We intentionally kept this as a separate minimal prompt rather than folding it into the dialogue generation, because combining the tasks produced worse results on both.

> If the user tries ragebaiting the agent, it will decide to end the conversation — which was fun to experiment with.

Memory processing for the conversation runs asynchronously in a background thread the moment the player's response arrives, the pipeline from Chapter 3 fires behind the scenes while the character's reply is already on its way back to the client.

### Mode 2: A Character Initiates

Sometimes a character should approach the player, not the other way around. When the game triggers this, the flow inverts. **The character speaks first, generating an opening line from their own context — motivated by their current emotional state, their active plan, and what they most recently remember.**

The `npc_initiation_prompt` gives the LLM the character's full state and asks for a natural opening line that feels motivated, not random.

> Gwen, who is nervous and has been quietly observing something suspicious, opens a conversation very differently than Adam, who is boisterous and just wants to share something funny he saw at the market. Same mechanism, completely different output — because the psychological state driving it is different.

From there, the exchange continues exactly as Mode 1.

### Mode 3: Two Characters Talk to Each Other

This is the most technically interesting mode, and the one that produced the most surprising behaviour.

**Two characters conduct a full conversation with no human involvement at all.** The system runs a loop — generate a line for the current speaker, check if the conversation should end, swap speakers, repeat — until a natural stopping point is reached. The conversation history is shared between both characters as it builds, so each line is responding to what was actually just said, not to a static prompt.

![Two characters conducting an autonomous conversation](posts/project-paradox/two-chars-conversation.png)

What makes this mode genuinely powerful is what happens after the conversation ends.

**Both characters receive a memory summary of the conversation — but they receive _different_ summaries.** Each summary is generated separately, using that character's own system prompt, personality, and emotional state.

> Charles and Blossom walk away from the same conversation having encoded it differently, because they are different people who noticed different things and interpreted the same words through different lenses.

This is the same principle as the hat example from Chapter 4, but now playing out in real time, in natural language, between two fully realised characters. And because those divergent memories then feed back into future emotions and belief scores, the downstream effects compound. A single autonomous conversation between two characters can quietly reshape the entire social dynamic of the village without the player ever witnessing it.

We didn't program those dynamics. We built the conditions for them to emerge.

### The Anatomy of a Dialogue Prompt

Every dialogue generation call assembles a prompt from the character's live state. Here's what that looks like in practice for Charles mid-conversation with Blossom:

```
[SYSTEM]
You are Charles, a stoic and skeptical villager in Saint Paul.
Speak naturally. Stay in character. Never break the fourth wall.
One line of dialogue only.

[USER]
Your emotional state:
  Joy: 0.3  Sadness: 0.1  Fear: 0.0  Anger: 0.2  Disgust: 0.0

Your beliefs about others:
  Blossom: 0.51 (low trust)
  Sakura: 0.88 (high trust)

Recent memories:
  [dialogue-summary] Blossom mentioned she saw someone
  near the forest at night.
  [observation] The dock was unusually quiet this morning.
  [compressed-memory] Tensions have been rising in the village.

You are at: Dock
Items here: Old Rope, Fishing Net

Conversation so far:
  Blossom: Charles, we need to talk about last night.
  Charles: [generate this line]
```

Every piece of this prompt is doing work. The emotional state shapes the tone. The belief score for Blossom — 0.51, low trust — makes Charles guarded. The memories give him things to reference. The location grounds him physically. The single-line output constraint keeps the conversation moving.

Change any one of those inputs and you get a meaningfully different response. That's the point.

---

## Chapter 7: Prompt Engineering Is Architecture

There is a temptation, when building systems like this, to think of prompts as the soft part. The code is the real architecture — the data models, the memory pipeline, the async threading, the API routes. Prompts are just the text you pass to the model. You write them last, you tweak them when something sounds off, and you move on.

This is exactly backwards.

**In Project Paradox, the prompts _are_ the architecture.** They are the place where every upstream decision — the emotion vector, the belief scores, the three-tier memory system, the personality string, the spatial context — gets assembled into something the LLM can reason about.

> A perfect memory system feeding into a poorly designed prompt produces garbage. A well-engineered prompt can make a modest local model feel genuinely intelligent. The prompts are not downstream of the design. They are the design.

We had six distinct prompt categories, each solving a different problem. Together they form a complete picture of how natural language reasoning was used not just for dialogue, but as the computational engine for emotion, memory, belief, planning, and democratic decision-making.

### The Golden Rule: Constrain Everything

Before getting into the individual prompts, the single most important principle that runs through all of them:

**Tell the LLM exactly what format to return, constrain the length, and provide an example.**

This sounds obvious. It isn't. Early in the build, our prompts asked for things like "generate a response" or "describe how the character feels." The outputs were verbose, inconsistently structured, and nearly impossible to parse reliably. We were treating the LLM like a human collaborator who would intuit what we needed. It isn't. It's a function. And like any function, it performs best when its output contract is unambiguous.

**Every prompt we settled on has three components: a clear task, an explicit output format, and at least one example.** That combination — task, format, example — is what made Llama3 produce valid JSON reliably, generate single lines of dialogue instead of monologues, and return CSV belief updates instead of paragraphs of reasoning.

The constraint is not a limitation. It is the engineering.

### The Six Prompts

![The six prompt categories powering Project Paradox](posts/project-paradox/six-prompts.png)

#### 1. The Character Prompt — The Foundation

Every character has a system prompt built once at initialization and stored permanently on their `AgentState`. It is injected as the LLM system message in every single call involving that character — dialogue, planning, voting, reflection, everything.

```
You are Sakura, a Villager in the cozy village of Saint Paul.
Personality: Spontaneous, artistic, loves metaphors.

Known villagers in Saint Paul:
- Charles (Villager)
- Adam (Villager)
- Toby (Villager)
- Blossom (Villager)
- Gwen (Villager)

Behavioral guidelines:
- Stay in character at all times
- Speak naturally as a village resident
- Your responses reflect your emotional state and history
- Never break the fourth wall
```

This prompt does something subtle but important. It doesn't tell Sakura _how_ to be spontaneous and artistic — it trusts the LLM's understanding of those words to shape the output. The personality string is a seed, not a script. And because this same seed is present in every single call, it creates a consistent throughline across every emotion update, every conversation, every vote Sakura ever casts.

We built three variants of this prompt for different game modes — cozy village, murder mystery, and social deduction — each with slightly different behavioural guidelines that shift the character's orientation without changing who they fundamentally are.

#### 2. The Emotion Update Prompt — Mechanising Feeling

Fired after every new memory is stored. Focused, minimal, unambiguous:

```
Given that Sakura just experienced the following event:
"John walked past without acknowledging her."

How should her emotional state change?
Return JSON only. No explanation. No preamble.

{"joy": float, "sadness": float, "fear": float,
 "anger": float, "disgust": float}

Each value is a DELTA — positive or negative.
Example: {"joy": -0.1, "sadness": 0.15, "fear": 0.0,
          "anger": 0.05, "disgust": 0.0}
```

The phrase "Return JSON only. No explanation. No preamble." is doing enormous work here. **Without it, Llama3 would prepend the JSON with a sentence explaining its reasoning — which breaks parsing.** With it, the output is clean and directly usable.

The delta framing — rather than asking for absolute values — keeps emotional shifts small and cumulative. We're not resetting how Sakura feels. We're nudging her, the way real experiences nudge real people.

#### 3. The Belief Update Prompt — Social Accounting

Fired in parallel with the emotion update after every memory:

```
Sakura just formed this memory:
"John walked past without acknowledging her."

Which other agents (if any) are involved, and how should
Sakura's trust in them change?

Return as CSV: AgentName,delta
Allowed deltas only: 0.05, 0.1, 0.2 (or their negatives)
If no agents are involved: return NONE

Example:
John,-0.05
Charles,0.1
```

The restricted delta values — ±0.05, ±0.1, ±0.2 — are a deliberate constraint. Without them, the LLM would return arbitrary floats that caused trust scores to swing wildly after a single event. Limiting the granularity keeps the trust network stable and makes the social dynamics evolve gradually, the way they do between real people.

#### 4. The Memory Summarisation Prompt — Compression Without Loss

Triggered during RAM overflow, when older memories need to be compressed before moving to FAISS:

```
Summarise the following memories for Sakura in 1-2 sentences.
Focus on key events, relationships, and emotional context.
Write from Sakura's perspective.

1. Observed John walking past without acknowledging her.
2. Had a warm conversation with Gwen about the harvest festival.
3. Noticed Charles seemed distracted near the dock.

Summary:
```

The instruction "write from Sakura's perspective" is the critical line. It's what produces perspective-aware compression — the summary encodes not just what happened, but how Sakura experienced it. **When this summary later gets retrieved from FAISS and injected into a future prompt, it reads as Sakura's memory, not a neutral event log.**

This is the same principle as the hat example from Chapter 4, operating at the compression layer.

#### 5. The Planning Prompt — Structured Agency

The most complex prompt in the system, and the one that required the most iteration. It must reliably produce valid, parseable JSON from a model that has never been fine-tuned for structured output:

```
You are Sakura, a Villager in Saint Paul.
[Full character prompt]

Current emotional state:
  joy=0.6, sadness=0.1, fear=0.0, anger=0.0, disgust=0.0

Belief scores:
  Charles: 0.72  Gwen: 0.88  Adam: 0.61

Recent memories:
  [dialogue-summary] Gwen mentioned the harvest festival
  is tomorrow.
  [observation] The market was busier than usual today.

Current location: Fountain
Location description: The heart of the village square,
  where residents often gather.
Items here: Flower Bouquet, Wooden Bench

Your inventory: Empty

Available locations: Tavern, Dock, Townhall, Church,
  Market, Forest, Fountain, Graveyard

Generate a plan. Return a JSON array with exactly 1 item.
Use only these actions: MOVE_TO_X | MOVE_TO_Y |
  PICKUP_ITEM | DROP_ITEM | TRANSFER_ITEM

[{
  "action": "ACTION_NAME",
  "target": "target name or location",
  "task": null,
  "reason": "your motivation in character"
}]

Example:
[{
  "action": "MOVE_TO_Y",
  "target": "Market",
  "task": null,
  "reason": "I want to pick up something special for
             the festival tomorrow"
}]
```

Three things make this prompt work reliably. First, the schema is shown explicitly — the LLM sees exactly what fields are expected. Second, a concrete example is provided — not a description of what a good example looks like, but an actual one. Third, the action vocabulary is enumerated and closed — the LLM cannot invent new action types because the allowed options are listed explicitly.

The `reason` field is worth calling out specifically. It adds no complexity to the Unity client — the game engine only needs the action and target to animate. **But it adds something invaluable for debugging and for the player experience: you can see why the character is doing what they're doing.**

#### 6. The Voting Prompt — Psychology Meets Decision

The voting prompt is where every upstream system converges into a single consequential output:

```
You are Charles, a stoic and skeptical Villager in Saint Paul.
[Full character prompt]

Your emotional state:
  joy=0.1, fear=0.6, anger=0.3, sadness=0.2, disgust=0.0

Your trust levels:
  Sakura: 0.91 (very high)
  Adam: 0.72 (moderate)
  Blossom: 0.45 (low)
  Gwen: 0.63 (moderate)
  Toby: 0.38 (very low)

What you remember:
  Recent: [RAM block — last 7 memories]
  From the past: [RAG results — semantically retrieved
                  long-term memories]

It is time to vote for elimination.
Based on your memories, emotions, and trust levels,
who do you vote to eliminate?

Return JSON only:
{
  "vote_for": "AgentName or NONE",
  "reason": "your reasoning in character, 1-2 sentences"
}
```

This prompt is the clearest demonstration of why the whole system is built the way it is. **Charles's vote is not random.** It is the product of six chapters of architecture — his personality shaping how he interprets events, his emotion vector making him vote from a place of fear, his belief scores making him suspicious of Toby and protective of Sakura, his RAM giving him recent evidence, and his FAISS index surfacing long-term memories that are semantically relevant to the question of who to trust.

Two playthroughs of the same scenario will produce different votes because the psychological states that feed this prompt are never identical. The LLM is not the source of the variance. The accumulated history of each character is.

### The Lesson

Prompt engineering at this level is not about clever wording. It is about understanding exactly what information a decision requires, assembling that information cleanly, constraining the output format unambiguously, and trusting the model to reason within those constraints.

Every prompt in this system is a precise specification. Task, context, format, example. Nothing vague, nothing open-ended, nothing that requires the LLM to guess what you want. The sophistication lives in the architecture that feeds the prompt — the memory system, the emotion vector, the belief scores — not in the prompt itself trying to do too much.

The prompts are not the soft part. They are where everything else becomes real.

---

## Chapter 8: The API Contract — How Unity Talks to the Brain

There is a principle in systems design that tends to get overshadowed by the more glamorous architectural decisions: **the boundary between two systems is as important as either system individually.**

In Project Paradox, that boundary was the REST API between Unity and the FastAPI backend. Getting that boundary right was what made the collaboration work.

![The REST API contract between Unity and the FastAPI backend](posts/project-paradox/unity-fastapi-api.png)

### The Design Philosophy: Unity as a Dumb Client

The most important decision we made about the API was a philosophical one: **Unity should be as dumb as possible.**

Not dumb in a pejorative sense — but dumb in the systems sense. Unity's job is to render the world and animate what it's told. It should not be making decisions, interpreting character state, or doing any reasoning of its own. Every intelligent decision — where a character goes, what they say, who they vote for, what they remember — happens in the FastAPI backend. Unity receives instructions and executes them.

The contract was simple: the backend speaks in structured JSON, Unity listens, animates, and reports back when it's done.

### The Planning Engine: Giving Characters Intent

A character that can talk but cannot act is half a mind. Dialogue tells you who someone is. Plans tell you what they're doing about it.

Every character in Project Paradox carries two plan states simultaneously: a `current_plan` — the action they are executing right now — and a `future_plans` queue — the ordered sequence of what comes next. Together they give a character not just a next step, but a short-term narrative of intent.

**When Unity requests a plan for a character, the backend assembles everything the character knows at that exact moment — their emotional state, their belief scores, their RAM memories, the top semantically relevant long-term memories retrieved from FAISS, and critically, their current spatial context — and sends it to the LLM as a structured planning prompt.** The model returns a JSON array of actions. The first action becomes `current_plan`. The rest sit in `future_plans`, waiting.

This is short-term planning. One coherent sequence of actions motivated by a single current goal. Go to the market, pick up the apples, bring them to the fountain. Each step is purposeful, each step has a reason, and the whole sequence was generated from the character's psychological state at the moment they decided to act.

Long-term planning emerges differently — not from a single prompt, but from the accumulation of memory over time.

> A character who has been quietly suspicious of Toby for three game days doesn't generate a five-day investigation plan upfront. They generate one step at a time, each step informed by what they've experienced since the last. The arc builds naturally from the memory system rather than being scripted in advance.

This is what made the Mafia investigation behaviour so striking — an agent working toward finding the killer not because we told it to run an investigation, but because its accumulated memories kept pointing in that direction and its plans kept reflecting that.

### Spatial Context: The World Feeding the Brain

Plans are only as good as the information that generates them. A character standing in the forest should not plan the same way as one standing in the market — and in Project Paradox, they don't, because Unity continuously feeds the brain precise spatial context.

Whenever a character crosses a pre-set boundary in the game world — entering a new location, moving into a new zone — Unity fires a location update to the backend:

```json
{
  "agent_name": "Blossom",
  "location_name": "Fountain",
  "event_type": "enter",
  "present_objects": ["Flower Bouquet", "Wooden Bench"],
  "present_agents": ["Adam", "Toby"]
}
```

This isn't just a coordinate update. It rewrites the character's entire spatial awareness — what they can see, what they can interact with, who else is present. That context flows directly into the next planning prompt.

> Blossom at the Fountain with Adam and Toby present will generate a fundamentally different plan than Blossom alone in the Forest, because the world around her is different and the LLM sees that world in full.

The boundary trigger system was Erina's implementation in Unity — invisible zones in the game world that fire an API call the moment a character crosses them. From the AI side, it was a clean location update endpoint. From the player's side, it looked like characters who were genuinely aware of their surroundings. The spatial grounding made conversations feel anchored in a real place rather than floating in an abstract dialogue box.

### Framework Flexibility: Two Actions That Proved the Point

One of the quietest validations of the framework's design came from a simple test. **We wanted to know how much work it would take to add a new physical capability to a character** — not a new dialogue mode or a new memory type, but an entirely new thing a character could _do_ in the world.

We chose two actions: **pick up an object** and **drop an object**.

Erina designed the animations and Unity logic for both. On the AI side, I added `PICKUP_ITEM` and `DROP_ITEM` to the planning action vocabulary — two new entries in the closed list of valid actions the LLM could return. That was it. No new prompts, no new memory types, no new routes. The planning prompt already contained the character's inventory and the items present in their current location. The LLM, seeing those fields and the new action types, immediately began incorporating them into plans when they were contextually relevant.

The result was the picnic scene from the demo. Blossom was asked to bring food to the fountain for a picnic. Without any additional scripting, she generated a plan that included walking to where the pastry was, picking it up, walking to the fountain, and dropping it there — a four-step sequence involving two locations and two object interactions, motivated entirely by the request and her knowledge of the world around her.

> _"It's always a pleasure to share the joy of fresh treats with you at my favorite spot by the fountain."_

**She said that mid-transit, when the player spoke to her between steps. In context.** Because the plan she was executing was present in her prompt and she was aware of what she was doing and why.

That moment captured what the framework was designed to enable. A game developer adds an animation. They register the action name. The brain handles the rest — the reasoning, the sequencing, the motivation, the contextual dialogue. The two systems stay in their own domains and the behaviour that emerges belongs to neither one exclusively.

That is the boundary working exactly as intended.

### The Planning Loop: A Conversation Between Two Systems

The clearest example of the API contract in action is the planning loop — the back-and-forth between Unity and the backend that drives autonomous character behaviour.

**Step 1 — Unity requests a plan.**

```
GET /plan/{agent_name}/plan-structured
```

The backend assembles the full agent context, fires the planning prompt, parses the JSON response, and returns the first action in the queue as the character's `current_plan`.

**Step 2 — Unity receives the action and animates it.**

```json
{
  "action": "MOVE_TO_Y",
  "target": "Tavern",
  "task": null,
  "reason": "I want to find Adam and ask what he saw last night"
}
```

Unity reads the `action` field, maps it to the corresponding animation and pathfinding logic, and moves the character. The `reason` field is available to display to the player if desired — motivation made visible — but the game engine doesn't need to parse or understand it.

**Step 3 — Unity reports completion.**

```
POST /plan/{agent_name}/on-complete
```

When the animation finishes — the character has arrived at the Tavern, picked up the item, transferred the object — Unity fires this endpoint. The backend advances the agent to the next item in `future_plans`, making it the new `current_plan`. Unity then reads that and animates the next action.

This callback pattern is the load-bearing mechanism of autonomous behaviour. The backend never assumes Unity has finished. Unity never assumes the backend has the next action ready. They stay in sync through explicit signalling — one side completes, reports it, and the other responds.

### Broadcast Announcements: Changing the World in One Call

One of the more powerful endpoints in the API is deceptively simple:

```
POST /agent/broadcast-announcement

{
  "announcement": "Jacob has been found dead in the graveyard."
}
```

This sends a message to every alive agent simultaneously, storing it as an importance-10 memory — the highest possible score — in every character's RAM and core memory at once. It is the mechanism behind the dynamic story trigger system shown in the demo: a choir at the church, a sale at the market, a murder mystery unfolding.

The power of this endpoint is that it requires no scripting beyond the announcement text itself. The AI does the rest. Every character receives the same information and reacts to it independently, through the lens of their own personality, emotional state, and existing beliefs.

> The choir announcement lands differently for a character who loves music than for one who is grieving. The murder announcement lands differently for the killer than for an innocent villager.

**One API call. Six different reactions. None of them programmed.**

### The GameSession Singleton: Holding It All Together

Behind every route is a single `GameSession` instance — a Python singleton that holds the complete state of the world:

```python
class GameSession:
    def __init__(self):
        self.agents: Dict[str, AgentState] = {}
        self.current_day = 1
        self.current_phase = "setup"
        self.game_started = False
        self.room_inventory = RoomInventoryManager()

session = GameSession()  # module-level singleton
```

Every route module imports this same instance. There is no dependency injection framework, no database, no distributed state. For a single-player game running one session at a time, the singleton pattern is exactly the right level of complexity — simple to reason about, simple to debug, and impossible to accidentally fork into inconsistent copies.

It is worth being honest about the trade-off: this architecture does not scale horizontally. _If Project Paradox were a multiplayer server handling thousands of concurrent sessions, this would need to be replaced with proper session management and persistent storage._ But for the scope we were building — a local game, one player, one active world — the singleton is not a shortcut. It is the correct solution for the problem at hand.

The best architecture is always the simplest one that solves the actual problem. Not the hypothetical future problem. The one in front of you.

---

## Chapter 9: What I Learned in 10 Weeks

I want to be honest in this chapter. Not performatively honest — not the kind of "lessons learned" section that's really just a list of humble brags dressed up as reflection. Genuinely honest about what was hard, what surprised me, and what I'd do differently if I started over tomorrow.

Because the version of this project that got demoed in Helsinki to a room full of game developers and industry founders was not the first version. It wasn't the second. There were rewrites, dead ends, moments where I genuinely wasn't sure the architecture was going to hold together in time. The clean system you've read about across eight chapters was carved out of something much messier.

![From left: me (Arun), Ilkka Paananen — CEO and co-founder of Supercell, and my teammate Erina Karati during demo day](posts/project-paradox/demo-day-ilkka.jpeg)

Here's what that process actually taught me.

### Memory Is the Soul of a Good AI Character

This one I didn't fully appreciate until I saw the difference between a character with a working memory system and one without.

Early in the build, before the three-tier architecture was complete, we had characters that could hold conversations. Good ones, even — contextually appropriate, personality-consistent, natural sounding. But every conversation started from scratch.

> Talk to Sakura today and she'd have no recollection of what you discussed yesterday. She'd be warm, she'd be artistic, she'd be entirely herself — and she'd be meeting you for the first time. Again.

It made every interaction feel ultimately hollow. You could see the ceiling. You knew that no matter how good this conversation was, it wouldn't matter tomorrow.

The moment the memory system started working — really working, with compression and retrieval and perspective-aware summaries — everything changed. Not just the technical behaviour. The feeling. _Talking to a character who remembers you is a qualitatively different experience from talking to one who doesn't. It's the difference between a character and a person._

> **If you take one thing from this entire blog: give your AI characters memory first. Emotions, beliefs, planning — all of it becomes more interesting when it builds on something that happened before. Memory is not a feature. It is the foundation.**

### The Synchronous Version Ships First — And That's Fine

I spent a non-trivial amount of time feeling bad about the fact that I shipped the synchronous memory pipeline first. Five sequential LLM calls, five second delays, a system that clearly wasn't production-ready. It felt like a failure of foresight.

It wasn't. It was the correct order of operations.

The synchronous version let me verify that each call was doing the right thing before I had to worry about them running concurrently. I could see the summary, check it, see the importance score, check it, see the emotion delta, check it — one step at a time. Debugging a parallel pipeline where three calls fire simultaneously is significantly harder than debugging a sequential one. I got the logic right first, then made it fast.

The 5 second delay was not a bug I missed. It was a measurement I needed to make in order to know what to fix.

> **You cannot optimise something you haven't profiled. Build it working, then build it fast.**

### Prompts Are First-Class Engineering Artifacts

I came into this project thinking of prompt engineering as something adjacent to real engineering. A softer skill. Something you did after the actual architecture was in place.

By the end of the 10 weeks, I had completely reversed that view.

The prompts were where hours went. Not writing them — iterating on them. A single word change in the emotion update prompt changed the character of the outputs in ways that cascaded through the entire system. **Moving the output format instruction from the middle of the prompt to the end reduced malformed JSON by a significant margin.**

Adding one concrete example to the planning prompt made the difference between a model that occasionally invented new action types and one that reliably returned valid structured output every time.

Every one of those changes was a debugging session. A hypothesis, a test, an observation, a refinement. That is engineering. The medium is natural language rather than code, but the process is identical.

> **Treat your prompts as code. Version control them. Review them. Test changes to them systematically. They are not configuration — they are logic.**

### Emotions and Beliefs Need to Have Stakes

This is a subtler lesson and one I think a lot of AI character systems get wrong.

It is very easy to add emotions to a character as a display layer. Show an angry face when anger is high. Show a sad animation when sadness peaks. Make the dialogue sound a bit more terse. This feels like it's doing something, but it isn't — not really. The emotion is decorating behaviour without changing it.

**What made the emotion and belief systems in Project Paradox genuinely interesting was that they had mechanical consequences.** A character with high fear voted differently. Low trust changed how dialogue was framed. The belief scores weren't personality flavour — they were inputs to decisions that changed the game.

The moment you make an internal state consequential — the moment it changes what the character actually does rather than just how they appear — the system starts generating behaviour that nobody designed.

> **Charles becoming quietly suspicious of Toby over several days and then voting him out, for reasons that make complete sense given his accumulated experience, was not something I programmed. It emerged from a belief score that had been decaying for the right reasons.**

Emergence is the reward for building systems where internal state has real stakes.

### The Apple Moment

There was a specific moment during demo recording in Helsinki — late, quiet, most of the lab had gone for the night — where I was running a cozy village scenario just to capture footage. **Two characters had discussed apple prices in an early conversation, a throwaway exchange that I'd barely paid attention to.** Days of game time passed. Many other things happened. That memory was long since compressed, embedded in FAISS, nowhere near any active prompt context.

**Then in a completely separate conversation, one character referenced it. Casually, naturally, the way you'd bring up something you both remembered.**

> _"Apple prices are still too high for me."_

I stopped recording. Sat back. That moment — a three-word callback to a conversation I'd almost forgotten — was the clearest confirmation that the architecture worked. Not because it was technically impressive in isolation, but because it was the kind of thing a _person_ does. People remember small things. People bring them up when they become relevant again. People don't forget a conversation just because time has passed.

> **Building a system that produces that behaviour — not by scripting it, but by creating the conditions for it to happen naturally — is the closest I've come to feeling like the engineering and the human experience it was meant to create actually met each other.**

### What This Could Become

We built Project Paradox for games. But the architecture doesn't care about games.

> **A multi-agent system where each agent has persistent memory, dynamic trust relationships, emotional state, and structured planning capability is useful anywhere you want to simulate human-like social behaviour.**

_Marketing research — how do agents with different personalities respond to the same message?_

_Political modelling — how does information spread through a trust network over time?_

_Social computing — what emergent behaviours arise when you seed a community with a specific event?_

The framework we built in 10 weeks is a starting point for all of those questions. We presented to founders and executives who had built some of the most successful games in the world. They asked good questions and pushed us to think beyond the demo in front of them.

**The most important question anyone asked was the simplest one: _what happens when you scale this up?_**

---

## Chapter 10: Build the Brain, Then Set It Free

We started with a Mafia game.

**We ended with a framework for giving any character in any environment a memory, a personality, a set of emotions, a trust network, and a plan. Not because that was the vision on day one — but because every time we tried to hardcode something to a specific game, we found ourselves building something more general instead. The architecture kept pushing toward the universal.**

That tension — between the specific thing you're trying to build and the general system that wants to emerge from it — is one of the most interesting creative forces in engineering. When you feel it, it's worth paying attention to.

### What We Actually Built

Strip away the village of Saint Paul, the cozy aesthetics, the murder mystery mode, and what remains is a set of ideas about what it takes to make a simulated mind feel real:

**Memory that persists and degrades naturally.** Not a log file. A three-tier system that keeps what matters, compresses what doesn't, and retrieves the past when it becomes relevant again.

**Emotion that has consequences.** Not a display layer. Numbers that shift with experience and feed directly into every decision the character makes.

**Belief that evolves through interaction.** Not static relationship flags. A living trust network that grows warmer with cooperation, cools with neglect, and reshapes social dynamics nobody explicitly designed.

**Plans that are structured and executable.** Not free-form intentions. Machine-readable goals that a game engine — or any system — can act on immediately.

**Prompts that are architecture.** Not afterthoughts. The precise specifications that assemble every upstream system into something a language model can reason about coherently.

These are not game design patterns. **They are agent design patterns.** And they apply wherever you want a system to behave like it has an inner life.

### The Bigger Idea

The traditional NPC is a lookup table. Input triggers output. The same question always gets the same answer. The character has no history, no relationships, no emotional trajectory — just responses.

What we built is the opposite of that. Every character in Saint Paul is the product of everything that has happened to them. Their dialogue reflects their emotional state. Their votes reflect their accumulated suspicions. Their plans reflect their current goals and the memories that shaped them.

> You cannot predict what Charles will do on Day 5 by reading his character description on Day 1, because who he is on Day 5 depends on what he experienced in between.

That is a meaningful shift. Not just technically — philosophically. The character is not defined by their starting conditions. They are defined by their history.

That's what it means to go from an NPC to an agent.

### If You're Building Something Like This

**Start with memory.** Everything else — emotion, belief, planning — becomes exponentially more interesting when it builds on accumulated experience. Without memory, you have a chatbot. With memory, you have a character.

**Make internal state consequential.** Emotions and beliefs that only affect dialogue tone are decoration. Wire them into decisions — votes, plans, trust — and emergence follows naturally.

**Treat prompts as code.** Version them, test them, iterate on them systematically. A one-word change in a prompt can cascade through an entire system in ways you won't predict. Respect that.

**Build the simple version first.** The synchronous pipeline, the naive memory list, the hardcoded game mechanic — build it, measure it, then make it better. The clean architecture in this blog was carved out of messy first drafts. Every good system is.

**Design your API boundary on day one.** If two systems need to talk to each other, agree on the contract before you build either side. It is the cheapest conversation you will ever have.

### See It Running

Everything described across these ten chapters — the memory architecture, the emotion system, the autonomous conversations, the dynamic story triggers, the planning loop — is running in the demo below.

> Watch Blossom pick up the pastry and carry it to the fountain. Watch the agents react to the choir announcement and the apple sale. Watch a murder mystery unfold from a single prompt.

The apple moment is in there too. Listen for it.

---

_Project Paradox was built at Supercell's AI Innovation Lab, Helsinki, Finland from April 2025 – June 2025 by Arunachalam Manikandan and Erina Karati._

_Inspired by Park, J.S. et al. — "Generative Agents: Interactive Simulacra of Human Behavior." UIST 2023. [arxiv.org/abs/2304.03442](https://arxiv.org/abs/2304.03442)_

_Model selection informed by Jones & Bergen — "Large Language Models Passed the Turing Test." 2025. [arxiv.org/abs/2503.23674](https://arxiv.org/abs/2503.23674)_
