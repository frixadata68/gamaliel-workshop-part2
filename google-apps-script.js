// ============================================================
// GOOGLE APPS SCRIPT — Deploy this in the Google Apps Script editor
// (This file is for reference only, not used by the website)
//
// Workshop: The Gamaliel Project, Part 2 — Lew Cirne
// Date:     Friday, November 13, 2026 · 12:00–1:30 PM PST (90 min)
// ============================================================
//
// SETUP STEPS:
// 1. Go to https://script.google.com and open your project
// 2. Paste this entire script into gamaliel-workshop2.gs, and make sure it
//    is the ONLY .gs file in the project — any other .gs file declaring
//    doPost / sendConfirmationEmail / SHEET_NAME will override it
//    (Do NOT nest inside function myFunction — keep at top level)
// 3. Save (Cmd+S)
// 4. Verify function dropdown shows: doGet, doPost, getOrCreateSheet,
//    sendConfirmationEmail
// 5. Deploy > Manage deployments > pencil > Version: New version > Deploy
// 6. Authorize when prompted (includes Gmail permission for sending emails)
//
// ⚠️  BEFORE YOU DEPLOY: set the ZOOM_LINK script property.
//        Project Settings (⚙ in the left sidebar)
//        > Script Properties > Add script property
//        Property: ZOOM_LINK
//        Value:    the full Zoom join URL for this workshop
//
//     The Zoom link is deliberately NOT stored in this file, because this
//     file lives in a public GitHub repo. Until the property is set, the
//     confirmation email omits the Zoom button and tells the registrant
//     the link will follow separately — so a broken link never goes out.
// ============================================================

var SHEET_NAME = 'GamalielWorkshopRegistrationsPart2';

// ── UPDATE THESE FOR EACH WORKSHOP ──
// NOTE: the Zoom link is NOT here — it is read from the ZOOM_LINK script
// property at send time. See getZoomLink() below.
var WORKSHOP_PAGE = 'https://frixadata68.github.io/gamaliel-workshop-part2/';
var ADMIN_EMAIL   = 'jfrix01@gmail.com';

var WORKSHOP_TITLE = 'The Gamaliel Project, Part 2: Anchored: Resilience engineering for the soul';
var WORKSHOP_DATE  = 'Friday, November 13, 2026';
var WORKSHOP_TIME  = '12:00 – 1:30 PM PST (90 minutes)';
var WORKSHOP_START = '12:00 PM PST';

// ⚠️  The date and time appear in the email ONLY via the three constants
//     above. Never hardcode a date or time further down — change it here
//     once and the subject line, event details, Zoom fallback, closing line
//     and admin notification all follow.

/**
 * The Zoom join URL, read from the ZOOM_LINK script property.
 * Returns '' if the property is unset or unreadable, which makes the
 * confirmation email fall back to "your link will arrive separately"
 * rather than emailing a broken link to every registrant.
 */
function getZoomLink() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty('ZOOM_LINK');
    return (v && v.indexOf('http') === 0) ? v : '';
  } catch (err) {
    return '';
  }
}

function getOrCreateSheet() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SHEET_NAME);
    var sheet = ss.getActiveSheet();
    sheet.appendRow(['Timestamp', 'First Name', 'Last Name', 'Email', 'Background']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return ss;
}

function sendConfirmationEmail(firstName, email) {
  var zoomLink = getZoomLink();
  var hasZoom  = zoomLink !== '';

  var subject = 'You\'re Registered — The Pivot Point Network Workshop: ' + WORKSHOP_DATE;

  var htmlBody = '<!DOCTYPE html><html><head><style>' +
    'body { font-family: Arial, Helvetica, sans-serif; background: #f7f5f0; margin: 0; padding: 20px; color: #1a1a18; }' +
    '.container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0ddd6; }' +
    '.header { background: linear-gradient(160deg, #17110a 0%, #3a2c12 60%, #241a09 100%); padding: 32px 28px; }' +
    '.header h1 { font-size: 22px; color: #f5f2ec; margin: 0 0 6px; }' +
    '.header p { font-size: 14px; color: rgba(245,242,236,0.7); margin: 0; }' +
    '.tag { display: inline-block; font-size: 11px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #e3b964; background: rgba(227,185,100,0.12); border: 1px solid rgba(227,185,100,0.3); padding: 3px 10px; border-radius: 12px; margin-bottom: 14px; }' +
    '.body { padding: 28px; }' +
    '.body p { font-size: 14px; line-height: 1.7; color: #4a4a46; margin: 0 0 16px; }' +
    '.body h2 { font-size: 17px; color: #1a1a18; margin: 24px 0 10px; }' +
    '.detail-row { margin-bottom: 8px; }' +
    '.detail-label { font-size: 13px; font-weight: bold; color: #1a1a18; display: inline-block; width: 70px; }' +
    '.detail-value { font-size: 13px; color: #4a4a46; }' +
    '.speaker-box { background: #fdf7e8; border-radius: 10px; padding: 18px; margin: 16px 0; }' +
    '.speaker-name { font-size: 16px; font-weight: bold; color: #1a1a18; margin-bottom: 4px; }' +
    '.speaker-role { font-size: 13px; color: #6b6b67; margin-bottom: 10px; }' +
    '.speaker-bio { font-size: 13px; color: #4a4a46; line-height: 1.65; }' +
    '.stat { display: inline-block; font-size: 11px; font-weight: bold; color: #42300a; background: #f0e0b8; padding: 3px 10px; border-radius: 10px; margin: 3px 3px 3px 0; }' +
    '.checklist { list-style: none; padding: 0; margin: 0; }' +
    '.checklist li { font-size: 14px; color: #2a2a26; padding: 8px 0; border-bottom: 1px solid #f0ede6; line-height: 1.55; }' +
    '.checklist li:last-child { border-bottom: none; }' +
    '.check { color: #8a6410; font-weight: bold; margin-right: 8px; }' +
    '.btn { display: inline-block; background: #8a6b1f; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: bold; margin: 8px 0; }' +
    '.footer { padding: 20px 28px; border-top: 1px solid #e0ddd6; text-align: center; font-size: 12px; color: #888780; line-height: 1.7; }' +
    'a { color: #8a6410; }' +
    '</style></head><body>' +

    '<div class="container">' +

    // Header
    '<div class="header">' +
    '<div class="tag">Confirmed Registration</div>' +
    '<h1>' + WORKSHOP_TITLE + '</h1>' +
    '<p>The Pivot Point Network Virtual Workshop</p>' +
    '</div>' +

    // Body
    '<div class="body">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>You\'re confirmed. <strong>Anchored</strong> is a ninety-minute working session, not a talk &mdash; three short teaching modules, four hands-on labs, and prayer. <strong>Bring a laptop or phone</strong>; two of the labs are hands-on. Here\'s everything you need.</p>' +

    // Event details
    '<h2>Event Details</h2>' +
    '<div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">' + WORKSHOP_DATE + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">' + WORKSHOP_TIME + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">Where:</span><span class="detail-value">Live via Zoom</span></div>' +
    (hasZoom
      ? '<div class="detail-row"><span class="detail-label">Zoom:</span><span class="detail-value"><a href="' + zoomLink + '">' + zoomLink + '</a></span></div>'
      : '<div class="detail-row"><span class="detail-label">Zoom:</span><span class="detail-value">Your Zoom link will arrive in a separate email before ' + WORKSHOP_DATE + '.</span></div>') +
    '<div class="detail-row"><span class="detail-label">Host:</span><span class="detail-value">Jeff Frix, Moderator &mdash; The Pivot Point Network</span></div>' +

    // Speaker
    '<h2>Your Guest Speaker</h2>' +
    '<div class="speaker-box">' +
    '<div class="speaker-name">Lew Cirne</div>' +
    '<div class="speaker-role">Founder &amp; Chairman, The Gamaliel Project · Founder, New Relic &amp; Wily Technology</div>' +
    '<div class="speaker-bio">' +
    'Lew invented the Application Performance Management category. He founded <strong>Wily Technology</strong> in 1998 (acquired by CA Technologies for <strong>$375M</strong>) and <strong>New Relic</strong> in 2008, scaling it from a Ruby prototype he hand-coded to a public company taken private in 2023 for roughly <strong>$6.5B</strong>. Known as Silicon Valley\'s <strong>&ldquo;Coding CEO,&rdquo;</strong> he wrote code two days a week while running a public company and holds <strong>19 patents</strong>. He also built <a href="https://gamaliel.ai">Gamaliel.ai</a>, the AI Bible reader at the center of this workshop\'s middle layer. He returns to The Pivot Point Network not to demo a product, but to teach what he has learned about <strong>what holds when the storm actually hits.</strong>' +
    '</div>' +
    '<div style="margin-top: 10px;">' +
    '<span class="stat">Wily — $375M exit</span>' +
    '<span class="stat">New Relic — $6.5B take-private</span>' +
    '<span class="stat">19 APM patents</span>' +
    '<span class="stat">Dartmouth Hall of Fame ’24</span>' +
    '</div>' +
    '</div>' +

    // The Anchored stack
    '<h2>The Anchored Stack</h2>' +
    '<ul style="font-size: 14px; color: #4a4a46; line-height: 1.7; padding-left: 20px; margin: 0 0 16px;">' +
    '<li><strong>L3 · heartbeat — Prayer.</strong> Continuous connection to God. The health check that tells you the system is alive.</li>' +
    '<li><strong>L2 · runtime — Gamaliel.ai.</strong> Daily study with an AI Bible reader: ask questions, get context, follow the citations.</li>' +
    '<li><strong>L1 · foundation — Scripture.</strong> The rock everything else runs on (Matthew 7:24).</li>' +
    '</ul>' +

    // Agenda
    '<h2>Run of Show (90 min)</h2>' +
    '<ol style="font-size: 14px; color: #4a4a46; line-height: 1.7; padding-left: 20px; margin: 0 0 16px;">' +
    '<li><strong>0:00 · Welcome and opening prayer</strong></li>' +
    '<li><strong>0:05 · Why resilience, why now</strong> — the Anchored stack</li>' +
    '<li><strong>0:15 · Module 1 + Lab 1</strong> — Builder, not storm chaser (Matthew 7:24–27); foundation audit</li>' +
    '<li><strong>0:30 · Module 2 + Lab 2</strong> — Learner, not quitter (Hebrews 12:5–11); blameless postmortem</li>' +
    '<li><strong>0:45 · Module 3</strong> — Prayerful through failure (Luke 22:31–32)</li>' +
    '<li><strong>0:55 · Lab 3</strong> — Hands-on with Gamaliel.ai</li>' +
    '<li><strong>1:15 · Lab 4</strong> — Prayer: the heartbeat check, in pairs</li>' +
    '<li><strong>1:25 · Your 30-day runbook</strong> and closing prayer</li>' +
    '</ol>' +

    // Prep steps
    '<h2>How to Prepare (Action Items)</h2>' +
    '<ul class="checklist">' +
    '<li><span class="check">&#10003;</span> <strong>Bring a laptop or phone.</strong> Two of the four labs are hands-on — you\'ll be working in the tool, not watching a demo.</li>' +
    '<li><span class="check">&#10003;</span> Open <a href="https://gamaliel.ai">Gamaliel.ai</a> once beforehand so you\'re not setting up during Lab 3. Free, account optional; the <a href="https://apps.apple.com/gb/app/gamaliel/id6755366281">iOS</a> and <a href="https://play.google.com/store/apps/details?id=ai.gamaliel.app">Android</a> apps work too.</li>' +
    '<li><span class="check">&#10003;</span> Read the three passages ahead of time: <strong>Matthew 7:24–27</strong>, <strong>Hebrews 12:5–11</strong>, <strong>Luke 22:31–32</strong>.</li>' +
    '<li><span class="check">&#10003;</span> Come ready to think about <strong>one real setback</strong> — a layoff, a failed loop, a missed promotion. Lab 2 is a private postmortem of it.</li>' +
    '<li><span class="check">&#10003;</span> Come with <strong>3 thoughtful, insightful questions</strong> prepared for Lew — the more specific, the better.</li>' +
    '<li><span class="check">&#10003;</span> Review <a href="https://www.linkedin.com/in/lewcirne/">Lew\'s LinkedIn profile</a> to familiarize yourself with his background.</li>' +
    '</ul>' +

    (hasZoom
      ? '<div style="text-align: center; margin: 28px 0 8px;">' +
        '<a href="' + zoomLink + '" class="btn">Join the Zoom Meeting</a>' +
        '</div>'
      : '') +

    '<p style="font-size: 13px; color: #888780; text-align: center;">See you ' + WORKSHOP_DATE + ' at ' + WORKSHOP_START + ' — bring a laptop or phone.</p>' +
    '</div>' +

    // Footer
    '<div class="footer">' +
    'Hosted by <strong>Jeff Frix</strong> · Moderator, The Pivot Point Network<br>' +
    'A Zoom community of experienced software engineers &amp; developers in career transition<br>' +
    '<a href="' + WORKSHOP_PAGE + '">View the full workshop page</a>' +
    '</div>' +

    '</div></body></html>';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getOrCreateSheet();
    var sheet = ss.getActiveSheet();

    var firstName = data.firstName || '';
    var email = data.email || '';

    sheet.appendRow([
      new Date().toISOString(),
      firstName,
      data.lastName || '',
      email,
      data.background || ''
    ]);

    // Send confirmation email to registrant
    if (email) {
      sendConfirmationEmail(firstName, email);
    }

    // Notify admin of new registration
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Workshop Registration: ' + firstName + ' ' + (data.lastName || ''),
      htmlBody: '<p><strong>New registration for ' + WORKSHOP_DATE + ' (Anchored — Gamaliel Pt 2):</strong></p>' +
        '<ul>' +
        '<li><strong>Name:</strong> ' + firstName + ' ' + (data.lastName || '') + '</li>' +
        '<li><strong>Email:</strong> ' + email + '</li>' +
        '<li><strong>Background:</strong> ' + (data.background || 'Not specified') + '</li>' +
        '<li><strong>Time:</strong> ' + new Date().toLocaleString() + '</li>' +
        '</ul>' +
        '<p><a href="' + WORKSHOP_PAGE + 'registrations.html">View all registrations</a></p>'
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Registration saved and email sent' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = getOrCreateSheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();

    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
