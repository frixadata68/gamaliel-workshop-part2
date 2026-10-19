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

- [ ] **Set the `ZOOM_LINK` script property** — Apps Script → Project Settings (⚙) → Script
      Properties → Add script property, name `ZOOM_LINK`, value the Zoom join URL. The link is
      deliberately **not** in this repo; `getZoomLink()` reads it at send time. Set the property
      *before* redeploying, or confirmation emails will say the link follows separately.
- [ ] 🔐 **Rotate the Zoom meeting.** The previous link was a **Personal Meeting ID**
      (`.../j/7987024723`) with its passcode, published in this repo and in
      `interview-rubric-workshop` since July. A PMI is permanent, so that exposed every meeting
      hosted in it, not just this workshop. Schedule November 13 as a new meeting with
      *Generate Automatically* for the Meeting ID, and enable the **Waiting Room** — that is the
      real attendance gate. Removing the link from this repo does not undo the leak; git history
      keeps it. Rotating does.
      **Note:** rotating invalidates the link in the confirmation emails already delivered to the
      first four registrants — they need the new link in a follow-up.
- [x] **Speaker photo** — `LewCirne1.jpg` (162×161) wired into the speaker card. The source is
      already circle-cropped with a white ring, so the `<img>` is scaled to `1.06` to push that
      ring past the clip edge. Remember to `git add` the photo when deploying.
- [x] **Day confirmed** — Friday, November 13, 2026, PST. (Workshops 1 and 2 were Mondays; this
      one is deliberately a Friday.)
- [x] **End time confirmed** — 12:00–1:30 PM PST, matching the deck's 90-minute run of show.
- [x] **Delivery confirmed** — Lew Cirne facilitates; the page's speaker framing is correct as-is.
- [x] **`SCRIPT_URL` wired** into both `index.html` and `registrations.html`
      (`.../AKfycbzMMXDV.../exec`).
- [x] **Backend verified isolated** — `gamaliel-workshop2.gs` is the only `.gs` file, and the
      deployment reads and writes `GamalielWorkshopRegistrationsPart2`. Re-check any time with:

      ```bash
      curl -sL 'https://script.google.com/macros/s/AKfycbzMMXDV86EJAQsT6zoB-e01gMhYnsjKw681QzeUB6-h3rPy4OORYSzMS9untsKp4ObKXg/exec'
      ```

      Expect October/November 2026 rows for this workshop. **July 2026 rows coming back would mean
      a second `.gs` file is shadowing the Part 2 code again** — the failure that sent the first
      five registrants Workshop 2's 11:00 AM email.
- [ ] **Verify the Formspree form** — reusing form `mpqvzzlp`.

## ⚠️ Known defect: reads and writes can land on different tabs

**Status: diagnosed, not fixed (as of October 19, 2026).** Inherited from the Workshop 2 code.

`doPost` and `doGet` both select the tab with `ss.getActiveSheet()`:

```
line 215  (doPost)  var sheet = ss.getActiveSheet();   ← writes here
line 260  (doGet)   var sheet = ss.getActiveSheet();   ← reads here
```

`getActiveSheet()` returns whichever tab is **currently active** — stored state on the file that
changes when someone clicks a different tab in the browser. With one tab it is harmless, which is
why it never surfaced before. With more than one, a registration can be appended to one tab while
`registrations.html` reads another.

**Observed symptom:** on October 19 the same `/exec` URL returned five October registrations in
the morning and a single July 11 row a few hours later — same deployment, same `SHEET_NAME`,
one file in Drive, nothing in trash.

**Until it is fixed:** treat the Google Sheet as the source of truth, not `registrations.html`.
Check every tab before trusting a headcount.

**Diagnostic** — paste into `gamaliel-workshop2.gs`, select `listTabs`, Run, read the Execution log:

```js
function listTabs() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  while (files.hasNext()) {
    var ss = SpreadsheetApp.open(files.next());
    Logger.log('FILE: ' + ss.getName() + '  →  ' + ss.getUrl());
    Logger.log('  active tab: "' + ss.getActiveSheet().getName() + '"');
    var tabs = ss.getSheets();
    Logger.log('  tab count: ' + tabs.length);
    for (var i = 0; i < tabs.length; i++) {
      Logger.log('    [' + i + '] "' + tabs[i].getName() + '"  rows=' + tabs[i].getLastRow());
    }
  }
}
```

**The fix** is to pin both functions to one explicitly named tab — resolve it by name via
`ss.getSheetByName(...)`, creating it with headers if absent — so the active-tab state can never
influence which rows are written or read. Worth doing before promoting the page widely.

**Backup:** the five registrations captured on October 19 are saved at
`~/Downloads/anchored-registrations-backup-2026-10-19.csv` — deliberately outside this repo,
which is public and must never contain registrant email addresses.

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
2. Create a file named `gamaliel-workshop2.gs`, paste all of `google-apps-script.js` into it, and
   delete every other `.gs` file so it is the **only** one in the project. Keep the functions at
   top level — do **not** nest them inside `function myFunction() {}`.

   > ⚠️ **Never leave two `.gs` files that both define `doPost` / `sendConfirmationEmail` /
   > `SHEET_NAME`.** Apps Script has no per-file scope: every `.gs` file is concatenated into one
   > global namespace, and when a function name is declared twice the **last file in order wins**.
   > A leftover file from a previous workshop — including the default one a new project starts
   > with — will silently override `gamaliel-workshop2.gs`. The symptom is the previous workshop's
   > confirmation email going out and registrations landing in its sheet. The function dropdown
   > does *not* reveal this; duplicates each appear once.
3. Save, then confirm the function dropdown lists `doGet`, `doPost`, `getOrCreateSheet`,
   `getZoomLink`, `sendConfirmationEmail`.
3b. **Project Settings (⚙) → Script Properties → Add script property**: name `ZOOM_LINK`, value
   the Zoom join URL. Nothing else needs a secret, and the link never enters the repo.
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
