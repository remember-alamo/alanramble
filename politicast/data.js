// POLITICAST predictions. Edit this file, commit, and push to update the site.
//
// Each race is keyed by two-letter state code:
//   lean:       "D" or "R"                    which party you pick
//   rating:     "safe" | "likely" | "lean" | "tilt"
//   margin:     projected margin in points (positive number, shown as e.g. "R+9.0")
//   candidates: [{ name, party }]             shown in the hover box
//
// "holdovers" are seats NOT up this cycle, counted as safe in the 100-seat tally bar.
// States with no entry in `races` show as blank ("no race").
//
// !! Everything below is PLACEHOLDER SAMPLE DATA so the widget has something to draw. !!
// Replace it with your real picks, then set `sample: false` to hide the sample notice.
window.POLITICAST_DATA = {
  sample: true,
  year: 2026,

  senate: {
    label: "Senate",
    holdovers: { D: 34, R: 31 },
    races: {
      AL: { lean: "R", rating: "safe",   margin: 24.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      AK: { lean: "R", rating: "lean",   margin: 6.0,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      AR: { lean: "R", rating: "safe",   margin: 22.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      CO: { lean: "D", rating: "safe",   margin: 15.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      DE: { lean: "D", rating: "safe",   margin: 20.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      FL: { lean: "R", rating: "likely", margin: 9.0,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      GA: { lean: "D", rating: "lean",   margin: 3.5,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      ID: { lean: "R", rating: "safe",   margin: 30.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      IL: { lean: "D", rating: "safe",   margin: 14.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      IA: { lean: "R", rating: "lean",   margin: 5.0,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      KS: { lean: "R", rating: "likely", margin: 12.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      KY: { lean: "R", rating: "safe",   margin: 18.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      LA: { lean: "R", rating: "safe",   margin: 20.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      ME: { lean: "R", rating: "tilt",   margin: 1.0,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      MA: { lean: "D", rating: "safe",   margin: 25.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      MI: { lean: "D", rating: "tilt",   margin: 2.0,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      MN: { lean: "D", rating: "likely", margin: 8.0,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      MS: { lean: "R", rating: "safe",   margin: 17.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      MT: { lean: "R", rating: "safe",   margin: 19.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      NE: { lean: "R", rating: "likely", margin: 11.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      NH: { lean: "D", rating: "lean",   margin: 4.0,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      NJ: { lean: "D", rating: "safe",   margin: 12.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      NM: { lean: "D", rating: "safe",   margin: 12.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      NC: { lean: "D", rating: "tilt",   margin: 1.5,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      OH: { lean: "R", rating: "tilt",   margin: 1.8,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      OK: { lean: "R", rating: "safe",   margin: 28.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      OR: { lean: "D", rating: "safe",   margin: 14.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      RI: { lean: "D", rating: "safe",   margin: 22.0, candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      SC: { lean: "R", rating: "likely", margin: 13.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      SD: { lean: "R", rating: "safe",   margin: 26.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      TN: { lean: "R", rating: "safe",   margin: 21.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      TX: { lean: "R", rating: "lean",   margin: 5.5,  candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      VA: { lean: "D", rating: "likely", margin: 9.0,  candidates: [{ name: "Candidate Name", party: "D" }, { name: "Candidate Name", party: "R" }] },
      WV: { lean: "R", rating: "safe",   margin: 30.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] },
      WY: { lean: "R", rating: "safe",   margin: 35.0, candidates: [{ name: "Candidate Name", party: "R" }, { name: "Candidate Name", party: "D" }] }
    }
  },

  // Governors: toggle is wired up, data comes later. Same shape as `senate`
  // (without `holdovers`) once you're ready; `null` shows "coming soon".
  governors: null
};
