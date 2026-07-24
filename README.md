# Preop Assistant

A mobile-first web app for running through a patient's chart before an
anesthesia preop and presenting it to an attending, faster.

- **Dictate** - use your phone's microphone to read through the chart out
  loud. Speech is matched against the preop template's fields (PMH, meds,
  allergies, airway exam, labs, etc.) and you confirm the matches before
  they're saved. Anything that doesn't match lands in an "unsorted" bucket
  you can assign later.
- **Checklist** - a separate walkthrough mode (not active while dictating)
  that steps through required fields you haven't filled in yet. Fill each
  one by dictating just that field, picking from a dropdown, or typing.
- **Summary** - a clean, attending-ready readout of the case, plus curated
  anesthetic considerations (monitors, positioning, complications) for the
  procedure type selected.

All case data is stored locally on-device (IndexedDB) - there is no backend
and nothing is synced or uploaded.

## Anesthetic considerations knowledge base

`src/data/procedures.ts` is a starting set of per-procedure notes (currently
TAVR, CEA, AAA repair, hip fracture, lap chole, spine fusion) that you write
and maintain yourself. It is not pulled live from any external source (no API
exists for Jaffe's, OpenEvidence, etc.) - treat it as your own editable
quick-reference, and review/correct it against primary sources before relying
on it clinically.

## Browser support

Dictation uses the Web Speech API (`SpeechRecognition`), which is available
in Chrome, Edge, and Safari (including iOS Safari), but not Firefox. Manual
text/dropdown entry always works regardless of browser.

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # typecheck + production build
```

To use on your phone: install as a home-screen app (the app ships a web
manifest) so the mic and layout behave like a native app rather than a
browser tab.
