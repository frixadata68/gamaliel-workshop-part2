# Anchored: Resilience Engineering for the Soul — Workshop 3

The Pivot Point Network virtual workshop landing page for **Lew Cirne's return visit**.

| | |
|---|---|
| **Title** | Anchored — Resilience engineering for the soul |
| **Speaker** | Lew Cirne — Founder & Chairman, The Gamaliel Project; Founder, New Relic & Wily Technology |
| **Tool used in session** | [gamaliel.ai](https://gamaliel.ai) |
| **Date** | Friday, November 13, 2026 |
| **Time** | 12:00 – 1:30 PM PST (90 minutes) |
| **Format** | Interactive — 3 teaching modules, 4 labs, prayer. Attendees bring a laptop or phone. |
| **Registration code** | `77777` |
| **Accent palette** | Amber / gold — `#17110a` → `#3a2c12` hero, `#e3b964` accent |
| **Host** | Jeff Frix, Moderator — The Pivot Point Network |

Built from the playbook in `../interview-rubric-workshop/README.md`. Page content is derived from
the source deck, `~/Downloads/Anchored Resilience Engineering for the Soul-1.pdf` (17 slides).

## Files

```
GamalielWorkshopPart2/
  index.html               # Landing page — stack, speaker, run of show, prep, registration
  registrations.html       # Admin view of registrants (reads the Google Sheet)
  LewCirne1.jpg            # Speaker headshot (162×161, pre-cropped circle)
  google-apps-script.js    # Reference copy of the Apps Script backend
  README.md
```

## The workshop

Not a talk — a ninety-minute working session that treats resilience as a system property you
architect before the load arrives. Three teaching modules, each paired with a lab:

| Passage | Module | Lab |
|---|---|---|
| Matthew 7:24–27 | Builder, not storm chaser | Foundation audit |
| Hebrews 12:5–11 | Learner, not quitter | Blameless postmortem of your last setback |
| Luke 22:31–32 | Prayerful through failure | — |

Plus Lab 3 (20 min hands-on in Gamaliel.ai) and Lab 4 (ACTS prayer in pairs), closing with a
30-day runbook. **The Anchored stack** is the organizing metaphor:

- **L3 · heartbeat — Prayer.** Continuous connection to God; the health check that says the system is alive.
- **L2 · runtime — Gamaliel.ai.** Daily study with an AI Bible reader: ask, get context, follow citations.
- **L1 · foundation — Scripture.** The rock everything else runs on (Matthew 7:24).

## Before this goes live

- [x] **Zoom link set** — `ZOOM_LINK` in `google-apps-script.js`. Confirmed as the correct room
      for November 13 (same recurring room used for the July workshop).
- [x] **Speaker photo** — `LewCirne1.jpg` (162×161) wired into the speaker card. The source is
      already circle-cropped with a white ring, so the `<img>` is scaled to `1.06` to push that
      ring past the clip edge. Remember to `git add` the photo when deploying.
- [x] **Day confirmed** — Friday, November 13, 2026, PST. (Workshops 1 and 2 were Mondays; this
      one is deliberately a Friday.)
- [x] **End time confirmed** — 12:00–1:30 PM PST, matching the deck's 90-minute run of show.
- [x] **Delivery confirmed** — Lew Cirne facilitates; the page's speaker framing is correct as-is.
- [x] **`SCRIPT_URL` wired** into both `index.html` and `registrations.html`
      (`.../AKfycbyNwLkf.../exec`).
- [ ] 🚨 **BLOCKER — that deployment is running the wrong code.** A `GET` to it returns Workshop
      2's July registrations, which means the deployed `SHEET_NAME` is still `Workshop
      Registrations`, not `GamalielWorkshopRegistrationsPart2`. Launching in this state would
      append Anchored registrations to Workshop 2's sheet and very likely send registrants
      Bakari's confirmation email. Verify with:

      ```bash
      curl -sL 'https://script.google.com/macros/s/AKfycbyNwLkfoVUXWlx061CMkaU8MlgIl4y1btrRSWm_ps-yflS6kA7q3zPr0HDUu1s6-4ht/exec'
      ```

      A correctly deployed Part 2 script returns `{"status":"success","data":[]}`. Anything with
      July 2026 rows in it means the old code is still live — paste in the current
      `google-apps-script.js` and redeploy as **Version: New version**.
- [ ] **Verify the Formspree form** — reusing form `mpqvzzlp`.

## Backend

The landing page posts to the Google Apps Script (`Content-Type: text/plain` with
`mode: 'no-cors'`; do **not** switch to `application/json` or the browser silently strips the
body) and mirrors to Formspree as a backup notification.

Registrations land in the **GamalielWorkshopRegistrationsPart2** Google Sheet (`SHEET_NAME` in
`google-apps-script.js`). `registrations.html` does not name the sheet — it only knows
`SCRIPT_URL` and reads whatever sheet the deployed Apps Script resolves, so renaming the sheet
requires redeploying the script as a **New version**, not editing the HTML.

### Part 2 gets its own Apps Script project

A deployed script has exactly one `SHEET_NAME` baked into it, and every page pointing at that
`/exec` URL writes to that one sheet. So Part 2 runs on its **own project and its own URL**,
which is what keeps its registrations in `GamalielWorkshopRegistrationsPart2` and leaves
Workshop 1 and Workshop 2 permanently untouched.

Setup, in the browser:

1. [script.google.com](https://script.google.com) → **New project**, name it `Gamaliel Workshop Part 2`.
2. Delete everything in `Code.gs` and paste all of `google-apps-script.js`. Keep the functions
   at top level — do **not** nest them inside `function myFunction() {}`.
3. Save, then confirm the function dropdown lists `doGet`, `doPost`, `getOrCreateSheet`,
   `sendConfirmationEmail`.
4. **Deploy → New deployment → Web app**, with *Execute as:* **Me** and
   *Who has access:* **Anyone** (not "Anyone with Google account").
5. Authorize when prompted — it needs Drive (write the sheet) and Gmail (send confirmations).
6. Copy the **Web app URL** ending in `/exec` and paste it into `SCRIPT_URL` in both
   `index.html` and `registrations.html`.

> ⚠️ **Leave the existing Apps Script project alone.** It still serves
> `../interview-rubric-workshop/`. Don't redeploy it with the new `SHEET_NAME` — that would
> repoint Workshop 2's page at this workshop's sheet.

Until the real URL is pasted in, both pages fail loudly rather than silently: the form refuses
to show a success state, and the admin page says it isn't connected. That's deliberate — the
success message used to appear regardless of whether the save actually worked.

## Deploy to GitHub Pages

```bash
cd /Users/jefffrix/Downloads/GamalielWorkshopPart2
git init
git add index.html registrations.html google-apps-script.js LewCirne1.jpg README.md
git commit -m "Add Anchored workshop landing page"
gh repo create gamaliel-workshop-part2 --public --source=. --push
gh api repos/frixadata68/gamaliel-workshop-part2/pages -X POST \
  -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/"
```

Live at `https://frixadata68.github.io/gamaliel-workshop-part2/` — which is the
`WORKSHOP_PAGE` value already set in `google-apps-script.js`.

## Test checklist

- [ ] Speaker bio, run of show, and date read correctly
- [ ] Wrong code is rejected; `77777` is accepted
- [ ] Test registration appears in `registrations.html` and the Google Sheet
- [ ] Admin notification arrives at jfrix01@gmail.com
- [ ] Registrant confirmation email arrives with the Zoom link and the "bring a laptop" note
- [ ] Formspree backup notification arrives
- [ ] Page holds up at 400px wide
