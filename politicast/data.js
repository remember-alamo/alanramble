// POLITICAST predictions. Edit this file, commit, and push to update the site.
//
// Each race is keyed by two-letter state code:
//   lean:       "D" or "R"                    which party you pick
//   rating:     "safe" | "likely" | "lean" | "tilt"
//   margin:     projected margin in points (positive number, shown as e.g. "R+9.0")
//   candidates: [{ name, party }]             shown in the hover box
//
// The seat-count bar and map colors are computed from this file, so changing a race's
// `lean` / `rating` updates both automatically.
// "holdovers" are seats NOT up this cycle, counted as safe in the tally bar. If a holdover
// seat changes hands (appointment, resignation, special election), update these numbers.
// States with no entry in `races` show as blank ("no race").
//
// Candidates: D and R nominees plus the main independent challengers, taken from Wikipedia's
// 2026 Senate and gubernatorial election pages on Oct 8, 2026. Minor-party and fringe
// candidates are left out; double-check late changes (e.g. AK top-four, ID, SC, ME).
//
// !! The ratings, margins and holdover counts below are still PLACEHOLDERS, not real picks. !!
window.POLITICAST_DATA = {
  asOf: "October 8th, 2026",
  year: 2026,

  senate: {
    label: "Senate",
    holdovers: { D: 34, R: 31 },
    races: {
      AK: { lean: "R", rating: "lean",   margin: 6.0, candidates: [{ name: "Mary Peltola", party: "D" }, { name: "Dan Sullivan", party: "R" }] },
      AL: { lean: "R", rating: "safe",   margin: 24.0, candidates: [{ name: "Everett Wess", party: "D" }, { name: "Barry Moore", party: "R" }] },
      AR: { lean: "R", rating: "safe",   margin: 22.0, candidates: [{ name: "Hallie Shoffner", party: "D" }, { name: "Tom Cotton", party: "R" }] },
      CO: { lean: "D", rating: "safe",   margin: 15.0, candidates: [{ name: "John Hickenlooper", party: "D" }, { name: "Mark Baisley", party: "R" }] },
      DE: { lean: "D", rating: "safe",   margin: 20.0, candidates: [{ name: "Chris Coons", party: "D" }, { name: "Michael Katz", party: "R" }] },
      FL: { lean: "R", rating: "likely", margin: 9.0, candidates: [{ name: "Angie Nixon", party: "D" }, { name: "Ashley Moody", party: "R" }] },
      GA: { lean: "D", rating: "lean",   margin: 3.5, candidates: [{ name: "Jon Ossoff", party: "D" }, { name: "Mike Collins", party: "R" }] },
      IA: { lean: "R", rating: "lean",   margin: 5.0, candidates: [{ name: "Josh Turek", party: "D" }, { name: "Ashley Hinson", party: "R" }] },
      ID: { lean: "R", rating: "safe",   margin: 30.0, candidates: [{ name: "Jim Risch", party: "R" }, { name: "Todd Achilles", party: "I" }] },
      IL: { lean: "D", rating: "safe",   margin: 14.0, candidates: [{ name: "Juliana Stratton", party: "D" }, { name: "Don Tracy", party: "R" }] },
      KS: { lean: "R", rating: "likely", margin: 12.0, candidates: [{ name: "Adam Hamilton", party: "D" }, { name: "Roger Marshall", party: "R" }] },
      KY: { lean: "R", rating: "safe",   margin: 18.0, candidates: [{ name: "Charles Booker", party: "D" }, { name: "Andy Barr", party: "R" }] },
      LA: { lean: "R", rating: "safe",   margin: 20.0, candidates: [{ name: "Jamie Davis", party: "D" }, { name: "Julia Letlow", party: "R" }] },
      MA: { lean: "D", rating: "safe",   margin: 25.0, candidates: [{ name: "Ed Markey", party: "D" }, { name: "John Deaton", party: "R" }] },
      ME: { lean: "R", rating: "tilt",   margin: 1.0, candidates: [{ name: "Troy Jackson", party: "D" }, { name: "Susan Collins", party: "R" }] },
      MI: { lean: "D", rating: "tilt",   margin: 2.0, candidates: [{ name: "Abdul El-Sayed", party: "D" }, { name: "Mike Rogers", party: "R" }] },
      MN: { lean: "D", rating: "likely", margin: 8.0, candidates: [{ name: "Peggy Flanagan", party: "D" }, { name: "Michele Tafoya", party: "R" }] },
      MS: { lean: "R", rating: "safe",   margin: 17.0, candidates: [{ name: "Scott Colom", party: "D" }, { name: "Cindy Hyde-Smith", party: "R" }] },
      MT: { lean: "R", rating: "safe",   margin: 19.0, candidates: [{ name: "Alani Bankhead", party: "D" }, { name: "Kurt Alme", party: "R" }, { name: "Seth Bodnar", party: "I" }] },
      NC: { lean: "D", rating: "tilt",   margin: 1.5, candidates: [{ name: "Roy Cooper", party: "D" }, { name: "Michael Whatley", party: "R" }] },
      NE: { lean: "R", rating: "likely", margin: 11.0, candidates: [{ name: "Pete Ricketts", party: "R" }, { name: "Dan Osborn", party: "I" }] },
      NH: { lean: "D", rating: "lean",   margin: 4.0, candidates: [{ name: "Chris Pappas", party: "D" }, { name: "John E. Sununu", party: "R" }] },
      NJ: { lean: "D", rating: "safe",   margin: 12.0, candidates: [{ name: "Cory Booker", party: "D" }, { name: "Justin Murphy", party: "R" }] },
      NM: { lean: "D", rating: "safe",   margin: 12.0, candidates: [{ name: "Ben Ray Luján", party: "D" }, { name: "Larry Marker", party: "R" }] },
      OH: { lean: "R", rating: "tilt",   margin: 1.8, candidates: [{ name: "Sherrod Brown", party: "D" }, { name: "Jon Husted", party: "R" }] },
      OK: { lean: "R", rating: "safe",   margin: 28.0, candidates: [{ name: "N'Kiyla Jasmine Thomas", party: "D" }, { name: "Kevin Hern", party: "R" }] },
      OR: { lean: "D", rating: "safe",   margin: 14.0, candidates: [{ name: "Jeff Merkley", party: "D" }, { name: "David Brock Smith", party: "R" }] },
      RI: { lean: "D", rating: "safe",   margin: 22.0, candidates: [{ name: "Jack Reed", party: "D" }, { name: "Raymond McKay", party: "R" }] },
      SC: { lean: "R", rating: "likely", margin: 13.0, candidates: [{ name: "Annie Andrews", party: "D" }, { name: "Darline Graham", party: "R" }] },
      SD: { lean: "R", rating: "safe",   margin: 26.0, candidates: [{ name: "Mike Rounds", party: "R" }, { name: "Brian Bengs", party: "I" }] },
      TN: { lean: "R", rating: "safe",   margin: 21.0, candidates: [{ name: "Marquita Bradshaw", party: "D" }, { name: "Bill Hagerty", party: "R" }] },
      TX: { lean: "R", rating: "lean",   margin: 5.5, candidates: [{ name: "James Talarico", party: "D" }, { name: "Ken Paxton", party: "R" }] },
      VA: { lean: "D", rating: "likely", margin: 9.0, candidates: [{ name: "Mark Warner", party: "D" }, { name: "Bert Mizusawa", party: "R" }] },
      WV: { lean: "R", rating: "safe",   margin: 30.0, candidates: [{ name: "Rachel Fetty Anderson", party: "D" }, { name: "Shelley Moore Capito", party: "R" }] },
      WY: { lean: "R", rating: "safe",   margin: 35.0, candidates: [{ name: "James W. Byrd", party: "D" }, { name: "Harriet Hageman", party: "R" }] }
    }
  },

  governors: {
    label: "Governors",
    // 14 governorships are not up in 2026 (DE, IN, KY, LA, MS, MO, MT, NJ, NC, ND, UT, VA, WA, WV).
    // Placeholder split: verify against who currently holds them.
    holdovers: { D: 6, R: 8 },
    races: {
      AK: { lean: "R", rating: "lean",   margin: 6.0, candidates: [{ name: "Jonathan Kreiss-Tomkins", party: "D" }, { name: "Dave Bronson", party: "R" }, { name: "Treg Taylor", party: "R" }, { name: "Bernadette Wilson", party: "R" }] },
      AL: { lean: "R", rating: "safe",   margin: 25.0, candidates: [{ name: "Doug Jones", party: "D" }, { name: "Tommy Tuberville", party: "R" }] },
      AR: { lean: "R", rating: "safe",   margin: 24.0, candidates: [{ name: "Fredrick Love", party: "D" }, { name: "Sarah Huckabee Sanders", party: "R" }] },
      AZ: { lean: "D", rating: "tilt",   margin: 1.5, candidates: [{ name: "Katie Hobbs", party: "D" }, { name: "Andy Biggs", party: "R" }] },
      CA: { lean: "D", rating: "safe",   margin: 20.0, candidates: [{ name: "Xavier Becerra", party: "D" }, { name: "Steve Hilton", party: "R" }] },
      CO: { lean: "D", rating: "safe",   margin: 14.0, candidates: [{ name: "Phil Weiser", party: "D" }, { name: "Victor Marx", party: "R" }] },
      CT: { lean: "D", rating: "likely", margin: 9.0, candidates: [{ name: "Ned Lamont", party: "D" }, { name: "Ryan Fazio", party: "R" }] },
      FL: { lean: "R", rating: "likely", margin: 10.0, candidates: [{ name: "David Jolly", party: "D" }, { name: "Byron Donalds", party: "R" }] },
      GA: { lean: "R", rating: "tilt",   margin: 1.8, candidates: [{ name: "Keisha Lance Bottoms", party: "D" }, { name: "Rick Jackson", party: "R" }] },
      HI: { lean: "D", rating: "safe",   margin: 25.0, candidates: [{ name: "Josh Green", party: "D" }, { name: "Gary Cordery", party: "R" }] },
      IA: { lean: "R", rating: "lean",   margin: 5.0, candidates: [{ name: "Rob Sand", party: "D" }, { name: "Zach Lahn", party: "R" }] },
      ID: { lean: "R", rating: "safe",   margin: 30.0, candidates: [{ name: "Terri Pickens", party: "D" }, { name: "Brad Little", party: "R" }] },
      IL: { lean: "D", rating: "safe",   margin: 13.0, candidates: [{ name: "JB Pritzker", party: "D" }, { name: "Darren Bailey", party: "R" }] },
      KS: { lean: "D", rating: "tilt",   margin: 1.0, candidates: [{ name: "Cindy Holscher", party: "D" }, { name: "Ty Masterson", party: "R" }] },
      MA: { lean: "D", rating: "safe",   margin: 24.0, candidates: [{ name: "Maura Healey", party: "D" }, { name: "Mike Minogue", party: "R" }] },
      MD: { lean: "D", rating: "safe",   margin: 22.0, candidates: [{ name: "Wes Moore", party: "D" }, { name: "Dan Cox", party: "R" }] },
      ME: { lean: "D", rating: "lean",   margin: 4.0, candidates: [{ name: "Hannah Pingree", party: "D" }, { name: "Robert B. Charles", party: "R" }, { name: "Rick Bennett", party: "I" }] },
      MI: { lean: "D", rating: "tilt",   margin: 2.0, candidates: [{ name: "Jocelyn Benson", party: "D" }, { name: "John James", party: "R" }] },
      MN: { lean: "D", rating: "likely", margin: 8.0, candidates: [{ name: "Amy Klobuchar", party: "D" }, { name: "Lisa Demuth", party: "R" }] },
      NE: { lean: "R", rating: "safe",   margin: 20.0, candidates: [{ name: "Lynne Walz", party: "D" }, { name: "Jim Pillen", party: "R" }] },
      NH: { lean: "R", rating: "likely", margin: 8.0, candidates: [{ name: "Cinde Warmington", party: "D" }, { name: "Kelly Ayotte", party: "R" }] },
      NM: { lean: "D", rating: "likely", margin: 9.0, candidates: [{ name: "Deb Haaland", party: "D" }, { name: "Gregg Hull", party: "R" }] },
      NV: { lean: "R", rating: "tilt",   margin: 1.2, candidates: [{ name: "Aaron Ford", party: "D" }, { name: "Joe Lombardo", party: "R" }] },
      NY: { lean: "D", rating: "likely", margin: 11.0, candidates: [{ name: "Kathy Hochul", party: "D" }, { name: "Bruce Blakeman", party: "R" }] },
      OH: { lean: "R", rating: "lean",   margin: 5.0, candidates: [{ name: "Amy Acton", party: "D" }, { name: "Vivek Ramaswamy", party: "R" }] },
      OK: { lean: "R", rating: "safe",   margin: 25.0, candidates: [{ name: "Cyndi Munson", party: "D" }, { name: "Mike Mazzei", party: "R" }] },
      OR: { lean: "D", rating: "likely", margin: 10.0, candidates: [{ name: "Tina Kotek", party: "D" }, { name: "Christine Drazan", party: "R" }] },
      PA: { lean: "D", rating: "likely", margin: 10.0, candidates: [{ name: "Josh Shapiro", party: "D" }, { name: "Stacy Garrity", party: "R" }] },
      RI: { lean: "D", rating: "safe",   margin: 15.0, candidates: [{ name: "Helena Foulkes", party: "D" }, { name: "Aaron Guckian", party: "R" }, { name: "Ken Block", party: "I" }] },
      SC: { lean: "R", rating: "safe",   margin: 17.0, candidates: [{ name: "Jermaine Johnson", party: "D" }, { name: "Alan Wilson", party: "R" }] },
      SD: { lean: "R", rating: "safe",   margin: 28.0, candidates: [{ name: "Dan Ahlers", party: "D" }, { name: "Larry Rhoden", party: "R" }] },
      TN: { lean: "R", rating: "safe",   margin: 22.0, candidates: [{ name: "Jerri Green", party: "D" }, { name: "Marsha Blackburn", party: "R" }] },
      TX: { lean: "R", rating: "lean",   margin: 6.0, candidates: [{ name: "Gina Hinojosa", party: "D" }, { name: "Greg Abbott", party: "R" }] },
      VT: { lean: "R", rating: "lean",   margin: 5.0, candidates: [{ name: "Amanda Janoo", party: "D" }, { name: "Phil Scott", party: "R" }] },
      WI: { lean: "D", rating: "lean",   margin: 3.0, candidates: [{ name: "David Crowley", party: "D" }, { name: "Tom Tiffany", party: "R" }] },
      WY: { lean: "R", rating: "safe",   margin: 35.0, candidates: [{ name: "Kenneth Casner", party: "D" }, { name: "Eric Barlow", party: "R" }] }
    }
  }
};
