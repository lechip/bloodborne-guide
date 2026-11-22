/**
 * Bloodborne Interactive Progression Map Data
 * Based on the Fextralife Bloodborne Game Progress Route (Base Game + The Old Hunters DLC).
 * Spoiler-light descriptions designed for navigation without spoiling story reveals.
 *
 * Overlay Note:
 * All node coordinates (x, y) live in world-space (worldBounds).
 * To overlay a game map image later, set overlayConfig.imageUrl or use the
 * built-in "Map Overlay" tool in the toolbar.
 */

const BLOODBORNE_MAP_DATA = {
  worldBounds: {
    width: 2760,
    height: 1460
  },

  overlayConfig: {
    enabled: false,
    imageUrl: "",
    opacity: 0.35,
    x: 0,
    y: 0,
    scale: 1
  },

  phases: [
    {
      id: "dusk",
      label: "I. DUSK — EARLY HUNT",
      x: 40,
      y: 45,
      width: 1050,
      height: 970
    },
    {
      id: "night",
      label: "II. NIGHT — DEEPENING MYSTERY",
      x: 1110,
      y: 45,
      width: 540,
      height: 970
    },
    {
      id: "bloodmoon",
      label: "III. BLOOD MOON — LATE GAME",
      x: 1670,
      y: 45,
      width: 1030,
      height: 970
    },
    {
      id: "dlc",
      label: "THE OLD HUNTERS — DLC NIGHTMARE (RECOMMENDED BEFORE FINALE)",
      x: 1030,
      y: 1045,
      width: 1320,
      height: 365,
      isDlc: true
    }
  ],

  nodes: [
    // --- EARLY GAME ---
    {
      id: "central_yharnam",
      code: "01",
      order: 1,
      title: "Central Yharnam",
      subtitle: "Iosefka's Clinic & Streets",
      type: "area",
      category: "main",
      phase: "dusk",
      x: 160,
      y: 480,
      summary: "Starting streets of Yharnam. Unlock the central lamp shortcuts and explore the sewers and bridge.",
      keyItem: "None (Starting Area)",
      bosses: ["Cleric Beast (Optional)", "Father Gascoigne"],
      recommendedLevel: "10–15"
    },
    {
      id: "cleric_beast",
      code: "01a",
      order: 2,
      title: "Cleric Beast",
      subtitle: "Great Bridge · Optional Boss",
      type: "boss",
      category: "optional",
      phase: "dusk",
      x: 420,
      y: 220,
      summary: "Optional early boss on the Great Bridge. Defeating it unlocks the Hunter Chief Emblem for purchase in the Dream.",
      keyItem: "Drops: Sword Hunter Badge",
      bosses: ["Cleric Beast"],
      recommendedLevel: "10–15"
    },
    {
      id: "father_gascoigne",
      code: "02",
      order: 3,
      title: "Father Gascoigne",
      subtitle: "Tomb of Oedon · Main Boss",
      type: "boss",
      category: "main",
      phase: "dusk",
      x: 420,
      y: 480,
      summary: "Mandatory early boss guarding the exit from Central Yharnam. Grants the key to Cathedral Ward.",
      keyItem: "Drops: Oedon Tomb Key",
      bosses: ["Father Gascoigne"],
      recommendedLevel: "15–20"
    },
    {
      id: "cathedral_ward",
      code: "03",
      order: 4,
      title: "Cathedral Ward",
      subtitle: "Oedon Chapel · Central Hub",
      type: "hub",
      category: "main",
      phase: "dusk",
      x: 680,
      y: 480,
      summary: "Central crossroads of Yharnam. Branches to Old Yharnam, Grand Cathedral, Hemwick, Forbidden Woods, and later the DLC.",
      keyItem: "Oedon Tomb Key (to enter)",
      bosses: ["Hub Area"],
      recommendedLevel: "20–30"
    },
    {
      id: "old_yharnam",
      code: "04",
      order: 5,
      title: "Old Yharnam",
      subtitle: "Blood-Starved Beast",
      type: "boss",
      category: "optional",
      phase: "dusk",
      x: 680,
      y: 780,
      summary: "Burned lower district. Defeating its boss opens a locked door inside Oedon Chapel and unlocks Chalice Dungeons.",
      keyItem: "Drops: Pthumeru Chalice",
      bosses: ["Blood-Starved Beast"],
      recommendedLevel: "25–30"
    },
    {
      id: "chalice_dungeons",
      code: "04c",
      order: 6,
      title: "Chalice Dungeons",
      subtitle: "Hunter's Dream Altars",
      type: "area",
      category: "optional",
      phase: "dusk",
      x: 440,
      y: 920,
      summary: "Optional underground labyrinths accessed via rituals in the Hunter's Dream. Progresses independently of the main story.",
      keyItem: "Requires: Pthumeru Chalice",
      bosses: ["Various Dungeon Bosses"],
      recommendedLevel: "30+"
    },
    {
      id: "healing_church_workshop",
      code: "04a",
      order: 7,
      title: "Healing Church Workshop",
      subtitle: "Tower & Abandoned Workshop",
      type: "area",
      category: "optional",
      phase: "dusk",
      x: 950,
      y: 740,
      summary: "Unlocked inside Oedon Chapel after Old Yharnam. Descend the tower to bypass the main Cathedral Ward gate.",
      keyItem: "Opened after Blood-Starved Beast",
      bosses: ["No Boss (Shortcut & Secret)"],
      recommendedLevel: "25–30"
    },
    {
      id: "hypogean_gaol",
      code: "04b",
      order: 8,
      title: "Hypogean Gaol",
      subtitle: "Darkbeast Paarl · Pre-Blood Moon",
      type: "boss",
      category: "optional",
      phase: "dusk",
      x: 780,
      y: 930,
      summary: "Early secret visit reached by letting a tall cloaked Snatcher defeat you. Boss opens a back gate to Old Yharnam.",
      keyItem: "Available after Blood-Starved Beast",
      bosses: ["Darkbeast Paarl"],
      recommendedLevel: "35–45"
    },
    {
      id: "hemwick_charnel_lane",
      code: "06",
      order: 9,
      title: "Hemwick Charnel Lane",
      subtitle: "Witch of Hemwick · Recommended",
      type: "boss",
      category: "optional",
      phase: "dusk",
      x: 950,
      y: 220,
      summary: "Path to the left of the Grand Cathedral. Strongly recommended to unlock Caryll Rune equipping.",
      keyItem: "Grants: Rune Workshop Tool",
      bosses: ["Witch of Hemwick"],
      recommendedLevel: "30–35"
    },
    {
      id: "vicar_amelia",
      code: "05",
      order: 10,
      title: "Vicar Amelia",
      subtitle: "Grand Cathedral · Main Boss",
      type: "boss",
      category: "main",
      phase: "dusk",
      x: 950,
      y: 480,
      summary: "Main boss of Cathedral Ward. Inspect the altar afterward to advance the night, learn the password, and unlock the DLC item.",
      keyItem: "Unlocks: Password & DLC Eye",
      bosses: ["Vicar Amelia"],
      recommendedLevel: "30–40"
    },

    // --- MID GAME ---
    {
      id: "forbidden_woods",
      code: "07",
      order: 11,
      title: "Forbidden Woods",
      subtitle: "Shadows of Yharnam",
      type: "boss",
      category: "main",
      phase: "night",
      x: 1230,
      y: 480,
      summary: "Sprawling woodland past the password door. Contains a hidden cave route back to Yharnam and leads to Byrgenwerth.",
      keyItem: "Requires: Altar Password",
      bosses: ["Shadows of Yharnam"],
      recommendedLevel: "40–50"
    },
    {
      id: "iosefka_backdoor",
      code: "07b",
      order: 12,
      title: "Iosefka's Clinic (Back)",
      subtitle: "Hidden Cave Route",
      type: "area",
      category: "optional",
      phase: "night",
      x: 1230,
      y: 300,
      summary: "Reached via a poison cavern in the Forbidden Woods. Holds an invitation item needed for an optional castle.",
      keyItem: "Item: Cainhurst Summons",
      bosses: ["Optional Encounter"],
      recommendedLevel: "45–50"
    },
    {
      id: "cainhurst_castle",
      code: "07a",
      order: 13,
      title: "Forsaken Cainhurst",
      subtitle: "Martyr Logarius · Optional",
      type: "boss",
      category: "optional",
      phase: "night",
      x: 1230,
      y: 135,
      summary: "Snowbound optional castle reached from the monument in Hemwick Charnel Lane while holding the Summons.",
      keyItem: "Requires: Cainhurst Summons",
      bosses: ["Martyr Logarius"],
      recommendedLevel: "55–65"
    },
    {
      id: "byrgenwerth",
      code: "08",
      order: 14,
      title: "Byrgenwerth",
      subtitle: "Rom, the Vacuous Spider",
      type: "boss",
      category: "main",
      phase: "night",
      x: 1510,
      y: 480,
      summary: "Lakeside academy. Defeating this boss triggers the Blood Moon—a major world shift that closes earlier side quests.",
      keyItem: "Triggers: Blood Moon World Shift",
      bosses: ["Rom, the Vacuous Spider"],
      recommendedLevel: "50–60"
    },
    {
      id: "nightmare_frontier",
      code: "09a",
      order: 15,
      title: "Lecture 1F & Frontier",
      subtitle: "Amygdala · Optional Nightmare",
      type: "boss",
      category: "optional",
      phase: "night",
      x: 1510,
      y: 780,
      summary: "Optional nightmare realm. Reached early with the Tonsil Stone (right of Grand Cathedral) or later via Lecture Building 2F.",
      keyItem: "Tonsil Stone OR Lecture 2F Ladder",
      bosses: ["Amygdala"],
      recommendedLevel: "55–65"
    },

    // --- LATE GAME ---
    {
      id: "yahargul",
      code: "09",
      order: 16,
      title: "Yahar'gul, Unseen Village",
      subtitle: "The One Reborn",
      type: "boss",
      category: "main",
      phase: "bloodmoon",
      x: 1790,
      y: 480,
      summary: "Full Blood Moon village. Find the Upper Cathedral Key here, then inspect the mummy beyond the boss arena.",
      keyItem: "Item: Upper Cathedral Key",
      bosses: ["The One Reborn"],
      recommendedLevel: "60–70"
    },
    {
      id: "upper_cathedral_ward",
      code: "11a",
      order: 17,
      title: "Upper Cathedral Ward",
      subtitle: "Celestial Emissary & Ebrietas",
      type: "boss",
      category: "optional",
      phase: "bloodmoon",
      x: 1790,
      y: 220,
      summary: "Locked door at the top of the Healing Church Workshop. Houses two optional bosses behind a breakable window.",
      keyItem: "Requires: Upper Cathedral Key",
      bosses: ["Celestial Emissary", "Ebrietas, Daughter of the Cosmos"],
      recommendedLevel: "65–75"
    },
    {
      id: "lecture_building_2f",
      code: "10",
      order: 18,
      title: "Lecture Building 2F",
      subtitle: "Nightmare Crossroads",
      type: "area",
      category: "main",
      phase: "bloodmoon",
      x: 2050,
      y: 480,
      summary: "Brief transition floor. Step through the glowing doorway to Mensis, or descend the ladder to reach 1F & Frontier.",
      keyItem: "Reached after The One Reborn",
      bosses: ["Transition Area"],
      recommendedLevel: "65–75"
    },
    {
      id: "nightmare_of_mensis",
      code: "11",
      order: 19,
      title: "Nightmare of Mensis",
      subtitle: "Micolash & Mergo's Wet Nurse",
      type: "boss",
      category: "main",
      phase: "bloodmoon",
      x: 2310,
      y: 480,
      summary: "Final main nightmare. Defeating Mergo's Wet Nurse opens the endgame in Hunter's Dream—finish DLC & optional areas before the finale.",
      keyItem: "Prepares Endgame State",
      bosses: ["Micolash", "Mergo's Wet Nurse"],
      recommendedLevel: "70–85"
    },
    {
      id: "hunters_dream_finale",
      code: "12",
      order: 25,
      title: "Hunter's Dream Finale",
      subtitle: "Final Confrontation · NG+",
      type: "ending",
      category: "main",
      phase: "bloodmoon",
      x: 2570,
      y: 480,
      summary: "Point of no return. Completing the final encounter immediately starts New Game+. Three Umbilical Cords unlock a hidden final phase.",
      keyItem: "Optional: 3× Third Umbilical Cord",
      bosses: ["Gehrman", "Hidden Final Boss"],
      recommendedLevel: "75–90+"
    },

    // --- THE OLD HUNTERS DLC ---
    {
      id: "hunters_nightmare",
      code: "D1",
      order: 20,
      title: "Hunter's Nightmare",
      subtitle: "Ludwig · DLC Entry",
      type: "dlc",
      category: "dlc",
      phase: "dlc",
      x: 1180,
      y: 1165,
      summary: "Grab the Eye of a Blood-Drunk Hunter in the Dream after Vicar Amelia, then let the entity outside Oedon Chapel grab you.",
      keyItem: "Requires: Eye of a Blood-Drunk Hunter",
      bosses: ["Ludwig, the Holy Blade"],
      recommendedLevel: "65–80"
    },
    {
      id: "research_hall",
      code: "D2",
      order: 21,
      title: "Research Hall",
      subtitle: "Living Failures · DLC",
      type: "dlc",
      category: "dlc",
      phase: "dlc",
      x: 1500,
      y: 1165,
      summary: "Vertical asylum reached via the Surgery Altar. Rotate the staircase to explore upper tiers and check beneath the main elevator.",
      keyItem: "Item: Laurence's Skull (Optional)",
      bosses: ["Living Failures"],
      recommendedLevel: "70–85"
    },
    {
      id: "laurence",
      code: "D3a",
      order: 22,
      title: "Laurence, the First Vicar",
      subtitle: "Nightmare Cathedral · DLC Optional",
      type: "dlc",
      category: "dlc",
      phase: "dlc",
      x: 1500,
      y: 1320,
      summary: "Optional DLC boss. Bring Laurence's Skull back to the fiery figure in the Hunter's Nightmare Grand Cathedral.",
      keyItem: "Requires: Laurence's Skull",
      bosses: ["Laurence, the First Vicar"],
      recommendedLevel: "80–95"
    },
    {
      id: "astral_clocktower",
      code: "D3",
      order: 23,
      title: "Astral Clocktower",
      subtitle: "Lady Maria · DLC",
      type: "dlc",
      category: "dlc",
      phase: "dlc",
      x: 1820,
      y: 1165,
      summary: "Immediately follows the Research Hall garden. Defeating the guardian grants the dial needed to open the clockface.",
      keyItem: "Drops: Celestial Dial",
      bosses: ["Lady Maria of the Astral Clocktower"],
      recommendedLevel: "75–85"
    },
    {
      id: "fishing_hamlet",
      code: "D4",
      order: 24,
      title: "Fishing Hamlet",
      subtitle: "Orphan of Kos · DLC Finale",
      type: "dlc",
      category: "dlc",
      phase: "dlc",
      x: 2140,
      y: 1165,
      summary: "Rain-soaked coastal village beyond the clocktower. Culminates in the final DLC boss on the shore.",
      keyItem: "Requires: Celestial Dial",
      bosses: ["Orphan of Kos"],
      recommendedLevel: "80–95+"
    }
  ],

  edges: [
    // Early game
    { id: "P01", from: "central_yharnam", to: "cleric_beast", type: "optional", label: "Great Bridge" },
    { id: "P02", from: "central_yharnam", to: "father_gascoigne", type: "main", label: "Sewers & Aqueduct" },
    { id: "P03", from: "cleric_beast", to: "father_gascoigne", type: "optional", label: "Continue Hunt" },
    { id: "P04", from: "father_gascoigne", to: "cathedral_ward", type: "main", label: "Oedon Tomb Key" },

    // Cathedral Ward hub branches
    { id: "P05", from: "cathedral_ward", to: "old_yharnam", type: "optional", label: "Lower Chapel Path" },
    { id: "P06", from: "cathedral_ward", to: "vicar_amelia", type: "main", label: "Emblem OR Workshop Gate" },
    { id: "P07", from: "cathedral_ward", to: "hemwick_charnel_lane", type: "optional", label: "Left of Grand Cathedral" },

    // Old Yharnam & Workshop branches
    { id: "P08", from: "old_yharnam", to: "healing_church_workshop", type: "optional", label: "Opens Oedon Chapel Door" },
    { id: "P09", from: "old_yharnam", to: "hypogean_gaol", type: "secret", label: "Defeated by Snatcher" },
    { id: "P10", from: "old_yharnam", to: "chalice_dungeons", type: "optional", label: "Pthumeru Chalice" },
    { id: "P11", from: "healing_church_workshop", to: "vicar_amelia", type: "optional", label: "Descend Tower Shortcut" },

    // Vicar Amelia branches
    { id: "P12", from: "vicar_amelia", to: "hemwick_charnel_lane", type: "optional", label: "Before Woods (Rec.)" },
    { id: "P13", from: "vicar_amelia", to: "forbidden_woods", type: "main", label: "Altar Password" },
    { id: "P14", from: "vicar_amelia", to: "nightmare_frontier", type: "secret", label: "Tonsil Stone (Right Path)", curveOffset: 90 },
    { id: "P15", from: "vicar_amelia", to: "hunters_nightmare", type: "dlc", label: "Eye of a Blood-Drunk Hunter", curveOffset: -60 },

    // Mid game
    { id: "P16", from: "hemwick_charnel_lane", to: "cainhurst_castle", type: "secret", label: "Obelisk + Summons" },
    { id: "P17", from: "forbidden_woods", to: "iosefka_backdoor", type: "secret", label: "Hidden Poison Cave" },
    { id: "P18", from: "iosefka_backdoor", to: "cainhurst_castle", type: "secret", label: "Take Summons to Hemwick" },
    { id: "P19", from: "forbidden_woods", to: "byrgenwerth", type: "main", label: "Beyond Boss Arena" },

    // Blood Moon & Late game
    { id: "P20", from: "byrgenwerth", to: "yahargul", type: "main", label: "Blood Moon Shift" },
    { id: "P21", from: "yahargul", to: "upper_cathedral_ward", type: "optional", label: "Upper Key → Workshop Top" },
    { id: "P22", from: "yahargul", to: "lecture_building_2f", type: "main", label: "Inspect Mummy" },
    { id: "P23", from: "lecture_building_2f", to: "nightmare_frontier", type: "optional", label: "Ladder Down to 1F", curveOffset: 70 },
    { id: "P24", from: "lecture_building_2f", to: "nightmare_of_mensis", type: "main", label: "Glowing Double Doors" },
    { id: "P25", from: "nightmare_of_mensis", to: "hunters_dream_finale", type: "main", label: "Endgame (Point of No Return)" },

    // DLC Route
    { id: "PD1", from: "hunters_nightmare", to: "research_hall", type: "dlc", label: "Eye Pendant on Altar" },
    { id: "PD2", from: "research_hall", to: "astral_clocktower", type: "dlc", label: "Garden Doorway" },
    { id: "PD3", from: "research_hall", to: "laurence", type: "dlc", label: "Laurence's Skull" },
    { id: "PD4", from: "astral_clocktower", to: "fishing_hamlet", type: "dlc", label: "Celestial Dial" },
    { id: "PD5", from: "fishing_hamlet", to: "hunters_dream_finale", type: "dlc", label: "Return for Endgame", curveOffset: 80 }
  ]
};
