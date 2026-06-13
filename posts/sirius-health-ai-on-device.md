# What If Your Health AI Literally Couldn't Sell Your Data? We Built One to Find Out

*Apr 20, 2026 · 14 min read*

> We spent 24 hours at the O1 Summit Hackathon building Sirius — a health AI that runs entirely on your iPhone and Mac, with no cloud, no servers, and no architecture that could ever betray your data even if we wanted it to.

![Sirius health AI app hero banner](posts/sirius-health-ai-on-device/sirius-banner.png)

It started the way most good ideas do — not with a plan, but with a problem we couldn't stop thinking about.

> The three of us — me, Dipan, and Erina — are the kind of people who voluntarily spend weekends in rooms full of energy drinks and whiteboards.

When we saw the [O1 Summit Hackathon](https://www.joinoriginhouse.com/) advertised in our university mailing list, we didn't need much convincing. Our skills complement each other well, we love working under pressure, and honestly — we just love hackathons. We signed up, showed up, and for the first three hours, we had absolutely no idea what we were going to build.

We sat down and did what we always do first: **research.** What are real problems people face? What are our actual strengths? What happens when you combine them? I had been exploring **Gemma E2B — its tool-calling capabilities, how far you could push on-device inference**, what a proper memory architecture expansion could look like. Erina had been deep in research on RAG-like pipelines and how they could work in constrained, privacy-sensitive environments on Apple hardware.

Then we opened a browser and started reading about health apps.

That's when the anger kicked in.

Not the abstract, "this is ethically concerning" kind of anger. The specific, documented, infuriating kind. Cerebral — an app millions of people trusted with their mental health — had shared sensitive patient data with Google, Meta, and TikTok for ad targeting. **Over 3.1 million people.** [**Flo Health**](https://www.ftc.gov/news-events/news/press-releases/2021/06/ftc-finalizes-order-flo-health-fertility-tracking-app-shared-sensitive-health-data-facebook-google)**, used by over 100 million women, shared menstrual cycle data with Facebook and Google. BetterHelp, GoodRx — the list went on.** Every single time, the company had a privacy policy. Every single time, they broke it anyway.

![Health app privacy scandals — Cerebral, Flo Health, BetterHelp, GoodRx](posts/sirius-health-ai-on-device/health-data-privacy-scandals.png)

But what made us angrier wasn't the past scandals. It was the structural reality: even the apps that _haven't_ been caught yet could change overnight. _OpenAI famously shifted its mission._

Any cloud-based health AI can quietly update a policy, get acquired, or start using your data for model training — and you'd never know. The problem isn't bad actors. The problem is an architecture that _allows_ bad actors to exist.

We looked at each other and agreed on one thing before we agreed on anything else: **whatever we build, it has to be architecturally incapable of betraying the user.** Not a promise. Not a policy. A technical impossibility.

That constraint became [Sirius](https://project-sirius.lovable.app/).

## From Blank Canvas to a Bet We Actually Believed In

Three hours of research before a single line of code. That's not procrastination — that's how we work.

![Funniest diagram I have ever generated with Claude](posts/sirius-health-ai-on-device/claude-architecture-diagram.png)

The problem space we kept coming back to was health. Specifically, the gap between what people _experience_ after a hospital visit — a stack of lab reports, a list of medications, discharge notes written in clinical shorthand — and what they actually _understand_ from it. Most people leave a doctor's appointment with more anxiety than clarity. They go home, Google their results, land on something terrifying, and have no way to know if it applies to them.

This was also a domain where OpenAI and Perplexity have also been researching about and just entered space.

![OpenAI and Perplexity entering the health AI space](posts/sirius-health-ai-on-device/openai-perplexity-health-space.png)

That's when the constraint and the use case clicked together. What if we took a general-purpose medical AI and made it genuinely _personal_ — not by sending your data to a server, but by keeping everything on the device you already carry? Your history, your medications, your lab results, your upcoming appointments — all of it living locally, feeding into every answer.

The model choice came fast. **I had been exploring Gemma E2B specifically — Google's 2-billion parameter model — and what made it genuinely exciting wasn't just its size. Gemma E2B has remarkably strong tool-calling capability for a model this small, which meant we could build a real agentic pipeline: web search, memory retrieval, calendar awareness — all orchestrated by the model itself, all running on-device.** Paired with Google's TurboQuant quantization, the model punched well above its weight class on Apple silicon.

We sketched the architecture on a whiteboard. Erina immediately saw the memory problem — without persistent, structured health memory, every conversation would start from zero. The model would be smart but amnesiac, asking _"what medications are you on?"_ every single time. She started pulling on that thread while I focused on the inference pipeline. We got our first mentor feedback in that window too — people who'd seen a hundred hackathon pitches told us the idea was real and the privacy angle was genuinely differentiated. That landed more than we expected. It shifted us from _excited but nervous_ to _let's actually build this thing._

By hour three, we had a name, a constraint, and a division of work. The clock was running.

## Three People, Two Platforms, One Insane Deadline

We didn't split the work by feature. We split it by world.

I took iOS. Dipan took macOS. Erina took memory. And then we had to figure out how to make all three worlds talk to each other — without the internet.

> **I had prepared some AI tools for this hackathon which I have documented in a blog along with my workflow. If you are interested in knowing about AI coding practices for accelerating development, you can check this blog out —** [**AI Workflow and ToolKit**](post.html?slug=ai-toolkit-hackathon-workflows)

![Who built what. Three towers, MPC bridge.](posts/sirius-health-ai-on-device/three-towers-mpc-bridge.png)

> **My job on iOS was the full Gemma pipeline: loading the model natively using Google's LiteRT framework, wiring up tool-calling, and building the complete voice pipeline — speech-to-text using Apple's** `**SFSpeechRecognizer**`**, text-to-speech with** `**AVSpeechSynthesizer**`**, and making sure the whole chain felt seamless. Talk to it, it thinks, it talks back. On a phone. Locally. No latency from a server round-trip because there was no server.**

Dipan tackled the same problem on macOS, but with a different stack entirely. On Mac, we used Apple's MLX framework for inference, Whisper Small for speech recognition, and Kokoro 82M for text-to-speech — a lightweight, natural-sounding voice model that runs entirely on-device. Two platforms, two inference stacks, the same promise: nothing leaves the device.

Erina went deep on the problem of memory. Without persistent, structured health memory, Sirius would be impressive but shallow. **She architected** `**HealthMemoryModule**`**: a standalone Swift package that works like a RAG pipeline built specifically for health data, running entirely on-device.** Encrypted SQLite storage, 512-dimensional semantic vectors using Apple's `NLEmbedding`, hybrid retrieval that combines structured SQL queries with semantic search — all of it local, all of it encrypted with AES-256-GCM. 121 tests. Zero cloud dependencies. We'll link the full package below — it deserves its own deep-dive.

Then came the part none of us had fully solved on paper: how do you sync a rich health memory profile between an iPhone and a Mac, securely, without a database, without a server, without an internet connection?

**The answer was Apple's** `**MultipeerConnectivity**` **framework — a peer-to-peer networking layer that works over Bluetooth and local Wi-Fi. We built a full sync engine on top of it: a 6-digit pairing code generates a 256-bit AES key via HKDF-SHA256 derivation, the devices find each other on the local network, and from that point forward they sync automatically whenever they're in range.**

The merge strategy is a CRDT-lite design — union for medications and allergies, last-write-wins for preferences, append-only for conversation history — so there are no conflicts, no overwrites, no data loss. Your health profile on your iPhone and your Mac stay identical, and the whole thing works in airplane mode.

> **_No database. No server. No account. Just two Apple devices, a shared secret, and a protocol that's been sitting in the iOS SDK since 2013 waiting for someone to use it properly._**

## The Model Loaded. Then It Almost Didn't.

Getting a 2-billion parameter language model to run natively on an iPhone sounds like the kind of thing that shouldn't work. Spoiler: it does. But the path to getting there was not clean.

The first wall I hit was the inference framework itself. The obvious choice for running local LLMs is `llama.cpp` — battle-tested, widely documented, huge community. I tried it. llama.cpp had no support for Gemma E2B at the time. That was a dead end. So I went looking for alternatives and landed on **Google's own LiteRT framework — formerly TensorFlow Lite, rebuilt and optimised specifically for on-device inference on mobile hardware with the help of this** [**blog**](https://medium.com/@ritukampani/your-iphone-can-run-gemma-4-now-and-it-changes-everything-c5e226a0a55f)**.**

The Swift bindings, `LiteRTLM-Swift`, gave me a path to load Gemma's weights directly and run inference using the iPhone's Neural Engine and GPU via Metal. No llama.cpp. No compromise on the model.

Getting the model loaded was step one. Getting it to stay loaded was step two.

![Gemma E2B memory pressure warnings on iPhone during development](posts/sirius-health-ai-on-device/gemma-memory-pressure.png)

Mid-build, I started seeing memory pressure warnings. Gemma E2B, even quantized, is not a small guest on an iPhone's RAM.

> **On older devices it would simply crash — the OS kills processes that take too much memory, and a 2B model running inference is exactly the kind of process that triggers that.**

I hit that wall hard enough that for a stretch I genuinely wasn't sure we'd be able to ship the iOS version at all. I went deep into Apple's memory profiling tools, read every blog post I could find on LiteRT optimisation, and worked through the quantization configuration carefully — getting the weights compressed tightly enough to fit comfortably within the memory envelope of an iPhone 13 Pro and above, while keeping quality high enough that the model's tool-calling still worked reliably.

That last part matters more than it sounds. Tool-calling on a 2B model is not guaranteed. Larger models handle structured output reliably because they have the parameter budget for it. At 2 billion parameters, you need the model to have been trained well on instruction-following and function-calling formats — and Gemma E2B, with Google's TurboQuant training, actually delivers this.

Once the memory issues were resolved and the model was stable, I wired up the full tool-calling pipeline: **Sirius can autonomously decide when it needs to search the web, call the right tool with the right sanitised query, receive the result, and weave it into its answer — all orchestrated by the model itself, all on-device.**

![Screenshot of Sirius on iOS powered by Gemma and our HealthMemory Module](posts/sirius-health-ai-on-device/sirius-ios-screenshot.png)

The voice pipeline came together in parallel. `SFSpeechRecognizer` with `requiresOnDeviceRecognition` set to true — no audio ever touches Apple's servers. `AVSpeechSynthesizer` for response playback. The chain from tap-to-speak to hearing Sirius answer runs entirely on the Neural Engine. First-token latency landed under 200ms on target hardware. For a fully local LLM with tool-calling, that felt like a small miracle.

By the time it was all wired together — model stable, voice pipeline smooth, tools calling correctly, memory holding — the feeling wasn't celebration. It was relief. The kind you only get after you've genuinely doubted whether something is going to work.

## Your Health AI Is Only as Good as What It Remembers

Without memory, every conversation starts from zero — _"what medications are you on?"_ asked every single time. Erina solved this by building `HealthMemoryModule` from scratch: a standalone Swift package that works like a RAG pipeline designed specifically for health data, running entirely on-device with AES-256-GCM encrypted SQLite storage, 512-dimensional semantic vectors via Apple's `NLEmbedding`, and a hybrid retrieval engine that makes every Gemma response more personal the more you use Sirius.

The architecture goes deep — encrypted storage, contradiction detection, PHI firewall, device sync, 121 tests passing, zero cloud dependencies.

> **_Check out the_** [**_Full deep dive blog on HealthMemoryModule_**](https://www.erinakarati.dev/blog/hmblog/)

## Five Bets We Made. All of Them Paid Off.

![The hero. Full system — both devices, memory, MPC sync, TinyFish boundary.](posts/sirius-health-ai-on-device/sirius-full-system.png)

## Voice — the most natural way to talk to your health AI

Nobody wants to type out their symptoms. From the start, we wanted Sirius to feel like talking to a knowledgeable friend — not filling out a form. The full voice pipeline runs on-device: `SFSpeechRecognizer` transcribes your speech locally, Gemma processes it, and `AVSpeechSynthesizer` reads the response back to you. No audio ever touches a server. You can ask about a medication interaction while driving, hear the answer, and not a single byte of that conversation has left your phone.

## Camera OCR — point your phone at a lab report, get answers

![Screenshot of Sirius using Apple's VisionKit to do OCR completely on-device](posts/sirius-health-ai-on-device/sirius-camera-ocr-screenshot.png)

Most people receive lab results as a printout or a PDF. Most people don't fully understand what they're reading. We built a camera scanning flow using Apple's `VisionKit` — point your camera at a lab report, prescription, or discharge note, and Sirius extracts every value using on-device OCR, reads it through Gemma, and saves the relevant data directly into your health memory. No cloud OCR. No uploading documents to a third-party service. The scan happens entirely on the Neural Engine in seconds.

![Sirius's multimodal capabilities powered by Gemma](posts/sirius-health-ai-on-device/sirius-multimodal-gemma.png)

## Proactive calendar — it knows your appointment is tomorrow

![Sirius proactive calendar brief showing personalised prep for health appointments](posts/sirius-health-ai-on-device/sirius-proactive-calendar.png)

This was my idea, and I'm glad we made time for it even under the clock. Sirius reads your calendar on-device using `EventKit`, automatically detects health-related appointments — GP visits, cardiology, dental, blood tests — and surfaces a personalised prep brief the day before. Not a generic checklist. A brief grounded in _your_ actual health memory: your current medications, recent labs, conditions, what you've been asking Sirius about lately. It tells you what to bring, what to ask, and what to flag. All on-device. Your calendar never leaves your iPhone.

## TinyFish — web search that knows its limits

![TinyFish web search integration with de-identified medical queries](posts/sirius-health-ai-on-device/tinyfish-web-search.png)

When Gemma needs current clinical information — a recent FDA warning, a new drug interaction update — it calls our web search tool via TinyFish. But before any query leaves the device, **Sirius strips every personal identifier: names, dates, identifiers, possessive markers.** What reaches TinyFish is a clean, de-identified medical question. And TinyFish only queries ten pre-approved sources — FDA, NIH, CDC, Mayo Clinic, PubMed, WHO, [Drugs.com](http://Drugs.com), MedlinePlus, DailyMed, [ClinicalTrials.gov](http://ClinicalTrials.gov). No Reddit threads. No SEO health blogs. No data brokers. The list was assembled after deep research across Perplexity, Claude Opus, and Gemini — every source on it had to earn its place.

## Multipeer Connectivity — sync without the internet

![Screenshot of Sirius on iOS and macOS connected using our Sync Engine powered by Apple's MultipeerConnectivity](posts/sirius-health-ai-on-device/sirius-multipeer-sync.png)

This was the piece that tied the whole system together and the one we're most proud of technically. Your health memory — every medication, condition, conversation, lab result — needs to exist on both your iPhone and your Mac without ever touching a cloud server. **We built a full peer-to-peer sync engine on top of Apple's** `**MultipeerConnectivity**` **framework.** Pair your devices once with a 6-digit code. That code derives a 256-bit AES key via HKDF-SHA256 — the same cryptographic standard used in Signal. From that point, whenever your iPhone and Mac are in Bluetooth or local Wi-Fi range, they sync automatically. The merge is CRDT-lite: union for medications and allergies, last-write-wins for preferences, append-only for conversations.

**No conflicts. No data loss. No internet. Works in airplane mode, in a hospital basement, anywhere.**

## 24 Hours Taught Us More Than a Semester Could

Hackathons have a way of forcing clarity. You can't over-engineer when the clock is running. Every decision has to be justified in seconds, not days. Looking back, that pressure produced some of the best technical decisions we've made — the LiteRT pivot, the CRDT merge strategy, the PHI firewall design. Constraints are a feature, not a bug.

What genuinely surprised us was how far Apple's on-device stack has come. `SFSpeechRecognizer`, `NLEmbedding`, `VisionKit`, `MultipeerConnectivity`, `EventKit` — every layer we needed was already sitting in the SDK, mature and performant, waiting to be composed into something meaningful. We didn't fight the platform. We leaned into it completely. And it rewarded us.

**What we'd do differently?** Scope more ruthlessly in the first hour. The feature creep anxiety was real — there were moments mid-build where we genuinely worried we'd bitten off more than we could ship. We got lucky that the architecture held. Next time, we'd lock the feature list earlier and protect that decision more aggressively.

We won the **Vanta Security Prize** at the O1 Summit Hackathon's Health Track for HIPAA compliance. Honestly, that wasn't an afterthought. Every architectural decision we made — AES-256-GCM encryption at rest, zero PHI transmitted over the internet, Vanta's automated evidence collection baked in from day one — was driven by the belief that privacy without compliance is just marketing. The prize validated that you don't have to choose between moving fast and building something genuinely secure. We did both, in 24 hours.

## What's Next for Sirius

Sirius isn't a hackathon project we're shelving. It's a foundation we're building on.

![Sirius roadmap and future development plans](posts/sirius-health-ai-on-device/sirius-roadmap.png)

The immediate focus for me personally is pushing the boundaries of **on-device tool-calling** further. Getting Gemma E2B to call tools reliably at 2 billion parameters is genuinely hard — the model has to understand when to search, what to search for, how to sanitise the query, and how to weave the result back into a coherent answer, all without the parameter budget that makes this trivial for larger models. That challenge is what's driving me forward. I want to understand how far a small, quantized, truly local model can go when you optimise aggressively around its constraints — better tool orchestration, smarter context injection, tighter memory retrieval. The goal is a health AI that gets meaningfully smarter with every conversation, entirely on your device.

On the product side, we're working toward a full TestFlight launch, deeper Apple Health integration for vitals and heart rate trends, and a more complete macOS experience. The waitlist is open now.

## Try It. Follow Along.

We built Sirius in 24 hours to prove a point: that privacy-first, on-device health AI isn't a future vision — it's something you can run on the iPhone in your pocket today.

If that resonates with you, here's where to go next:

> **_Join the Sirius waitlist_** _→_ [_project-sirius.lovable.app_](https://project-sirius.lovable.app/)
> 
> **Youtube Video Demo** — [https://www.youtube.com/watch?v=nd7MbtGQ8BI&t](https://www.youtube.com/watch?v=nd7MbtGQ8BI&t=)

> The most personal data a human generates should never have to live on someone else's server. Sirius is our proof that it doesn't have to.
