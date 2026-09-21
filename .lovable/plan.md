# NISQ Vanguard cinematic homepage upgrade

## Scope
Upgrade only the homepage opening experience and the Cyber Range entry flow. Keep the existing backend, authentication architecture, official logo, navigation, founder section, and unrelated pages unchanged.

## Homepage hero
- Replace the current opening section with a full-bleed cinematic cyber-defence environment inspired by the supplied reference, without embedding or copying the reference image.
- Generate an original production-quality realistic cyber-wolf foreground and complementary dark mountain/security environment. Keep the official NISQ Vanguard logo asset untouched, correctly proportioned, and visibly paired with:
  - NISQ VANGUARD
  - DEFENCE TECHNOLOGIES
  - Educate. Assess. Defend.
  - “CYBERSECURITY BUILT AROUND PEOPLE, ORGANIZATIONS AND THE THREATS OF TOMORROW.”
- Build a 2–4 second staged entrance: environment, particles/network traces, scan ring, wolf reveal/approach, eye illumination, HUD activation, branding, then controls.
- Add restrained living motion after entry: breathing-scale drift, head/ear suggestion, eye variation, energy pulses, and occasional scanning.
- Add professional demo-status HUD labels such as “Threat visualization / Active” and “Network simulation / Secure,” avoiding claims of real monitoring.
- Rotate one unattributed cybersecurity quote at a time with a soft fade/slide.

## Interaction and effects
- Track pointer position with throttled `requestAnimationFrame` updates and smooth interpolation; use layered wolf transforms, eye-light positioning, and nearby-node reactions to suggest gaze/head awareness without aggressive body rotation.
- Add a small, fading particle response and scan ripple near the pointer, limited to the hero.
- Support touch-driven subtle reactions on mobile without capturing or blocking page scrolling.
- Reduce particle density and parallax on smaller or lower-capability devices.
- Respect `prefers-reduced-motion`: render the complete hero statically, disable tracking and particles, and retain every action and message.

## Hero actions and entry transition
- Add working actions for:
  - **Book a Consultation** → `/solutions/consulting`
  - **Explore Cyber Range** → `/cyber-range`
  - **Enter Cyber Labs** → `/cyber-range/labs`
- On Labs entry, play a sub-one-second eye/ring/network transition before navigation; skip it for reduced motion.
- If signed in, open Labs directly. If signed out, present a focused sign-in prompt whose Google action uses the existing provider and returns to `/cyber-range/labs` after authentication. Do not add or duplicate an auth system.

## Focused destination pages
- Add `/solutions/consulting` as a concise consultation page connected to the existing college/program booking experience; no backend changes.
- Add `/cyber-range` as a professional overview/entry page using the wolf, grid, node, cyan, and dark-lab visual language.
- Add protected `/cyber-range/labs` under the existing authenticated route guard. Present an honest lab entry surface linked to existing learning content, with no fake scan results, exercises, or security telemetry.
- Give each new page unique page title, description, sharing metadata, and working navigation.

## Existing homepage continuation
- Preserve the existing homepage sections and data-backed content after the opening area.
- Refine only the transition from the hero into **Educate → Assess → Defend**, followed by the requested capability names: Cybersecurity Consulting, NISQ Academy, NISQ Cyber Range, CyberSecure Campus, CyberShieldAI, and NISQ Intelligence.
- Use selective fade, short slide, reveal, and restrained parallax effects rather than animating every element.

## Technical and verification details
- Keep visual colors and effects in semantic design tokens and isolate the interactive hero into focused components.
- Use optimized local/CDN assets, lazy-load noncritical imagery, CSS transforms, passive listeners, and animation cleanup on unmount.
- Preserve the current Google/email sign-in implementation while carrying the validated `next` destination through OAuth return.
- Verify the intro, cursor response, touch behavior, login prompt, authenticated return, all three destinations, reduced-motion mode, and no overlaps at desktop and mobile sizes.
- Confirm the generated route tree, accessibility names/tap targets, runtime console, and final preview build are clean.
