# LEVL Sleep Protocols PRD

## Objective
Build a prototype of the broader LEVL Protocols App, starting with sleep-related protocols and modalities.

This should be a protocol-first product, not just a standalone DeepCell app and not just a generic sleep tracker. The goal is to evolve the existing DeepCell testing app into the first domain-specific slice of the larger LEVL protocols platform.

Keep the onboarding mostly as it already is in the current app. Preserve what is already working well. During onboarding, recommend a small set of strong general sleep modalities, including DeepCell, then allow the user to add additional modalities or remove recommended ones to create a personalized sleep protocol.

The app should let users build a sleep protocol from modalities such as DeepCell, blue light blocking, dimming lights before bed, sleep stories, no social media an hour before bed, melatonin, and similar interventions. Users should be able to customize their protocol, follow it, and use the existing before and after testing and tracked variables from the current app to measure change over time.

Assume modality definitions and scoring data are externally supplied and evolving over time; build the system so these inputs can be updated without redesigning the core product model.

## Important product framing

The list of modalities and their structured scores/attributes is incoming and should be treated as external data that will be plugged into the system. Do not hardcode a tiny fixed set of modalities into the architecture.

Design the modality system so it can cleanly ingest structured modality data now, and later connect into a larger dynamically updating LEVL knowledge graph that can continuously feed modality attributes, evidence data, safety information, pathway/mechanism information, and other scoring metadata into the app.

The app should therefore treat modality metadata as a real structured layer, not just display text. Some of that metadata may initially be static or manually supplied, but the architecture should make it straightforward to replace or augment that with knowledge-graph-driven updates later.

## Core product behavior

Users should be able to:
- go through the existing onboarding flow with minimal disruption
- receive a recommended starter sleep protocol
- add or remove modalities from that protocol
- view modality details
- complete baseline testing using the current before/after testing structure
- follow their protocol over time
- complete follow-up testing later
- view changes in their tracked variables
- understand which modalities were active during the period being measured

The app should feel credible, elegant, modular, and outcomes-oriented.

## Product thesis

Most sleep apps are content libraries, trackers, or supplement funnels. LEVL should feel like a personal protocol builder plus lightweight outcomes engine.

The key interaction is:
Users assemble a protocol from modalities, follow it for a period of time, and measure whether it appears to work for them.

## Key design principles

- **Preserve what already works:** Keep the onboarding and before/after testing flow mostly intact unless improving them clearly strengthens the experience.
- **Protocol-first:** The core object is a protocol composed of modalities.
- **Modular:** Users can add or remove modalities without breaking the product model.
- **Outcome-oriented:** Measurement should remain central.
- **Knowledge-graph-ready:** The modality layer should be designed to later plug into a dynamically updating LEVL knowledge graph.
- **Extensible:** This is the sleep-domain prototype of a broader protocols platform.
- **Elegant, not overbuilt:** Build a durable foundation without trying to fully implement the entire future LEVL ecosystem now.

## Modality data requirements

I will separately provide the list of modalities and their attributes/scores. The system should be ready to ingest modality data with structured fields like evidence quality, effect size, safety margin, timing sensitivity, contraindications, synergy potential, mechanism/pathway links, and related metadata.

These incoming modality records should be treated as structured entities that can support:
- recommendation of starter modalities
- modality detail views
- filtering and sorting
- future personalization logic
- future contraindication checking
- future synergy-aware protocol design
- future knowledge graph integration

Do not assume the current modality list is final. The model should anticipate the modality library expanding over time.

## UX guidance

Keep onboarding mostly as-is, but evolve it so the user is guided into a recommended sleep stack that includes strong general modalities, including DeepCell, while preserving the ability to customize.

The product should feel like:
- a real protocol builder
- a premium health product
- scientifically grounded without feeling cold or clinical
- modular and easy to expand later

The modality selection and protocol editing experience should be one of the strongest parts of the app.

## Assessments and results

Preserve and extend the current testing structure from the DeepCell app.

The app should support:
- baseline assessment
- follow-up assessment
- variable-level tracking
- longitudinal comparison
- protocol-aware interpretation of results
- visibility into which modalities were active during a measurement window

Include lightweight adherence tracking so results can later be interpreted in context.

Avoid overconfident causal claims. The tone should be rigorous and credible.

## Architecture guidance

Build this around reusable concepts such as:
- user
- modality
- protocol
- user protocol instance
- protocol version
- assessment event
- tracked variable
- adherence/completion
- modality metadata
- content-linked modality where relevant

DeepCell should be treated as one modality within the sleep domain, even if it is featured.

Preserve raw assessment events, protocol versions, timestamps, and modality state cleanly so future outcome analysis remains trustworthy.

## Knowledge graph direction

The app does not need the full LEVL knowledge graph implemented now, but it should clearly be designed so that modality definitions and scores can later be enriched or updated by a larger dynamically updating knowledge graph.

In other words:
- today: modalities and scores can be manually supplied or seeded
- later: the same modality model can be fed by a live LEVL knowledge graph

Design with that future in mind.

## Technical stack

If not already defined in the fork, use this stack or the latest stable compatible version of it:
- Framework: Next.js 16.x with App Router, React 19.x
- Styling/UI: Tailwind CSS v4, Motion for React (formerly Framer Motion), Vaul, Lucide React
- Backend/DB: Supabase with PostgreSQL schema that can support migrations like `0000_initial_schema`, `0001_modalities_schema`, etc.
- Types/Validation: TypeScript, Zod, React Hook Form
- PWA: Configured with Next PWA, if compatible with the rest of the stack

Prefer the latest stable compatible releases rather than stale pins if a named dependency has moved forward. Next.js App Router is the default direction.

## Out of scope for this prototype

Do not build:
- a full clinician dashboard
- deep wearable integrations
- a full recommendation engine
- elaborate AI coaching
- marketplace mechanics
- a full commerce system
- a full knowledge graph platform
- speculative infrastructure that is not needed for this product slice

## Success criteria

This prototype is successful if:
- onboarding still feels smooth and familiar
- users are given a recommended starter sleep protocol including DeepCell
- users can add and remove modalities easily
- before/after testing remains strong
- results are tied to the protocol the user actually followed
- the modality system is clearly ready for incoming modality data and future knowledge graph integration
- the app feels like the first real slice of the broader LEVL protocols platform

## Implementation freedom

Take creative liberties in the UI, component structure, interaction design, and system design. Focus more on building the right product shape than on rigidly following one implementation path.

Optimize for:
- premium UX
- modularity
- extensibility
- clean data foundations
- preserving the strongest parts of the existing app
