// Curated warm-up library — bilingual (EN/FR). No AI generation at runtime.
// Each warm-up is a short 10-20 second mini-challenge: disposable, no score,
// no history, no recording. French content is natural, not word-for-word.

export const warmups = [
  // ─── TYPE A: TONGUE TWISTERS ───
  { id: "tt-red-leather", type: "tongue", timer: 15,
    en: { text: "Red leather, yellow leather.\nRed leather, yellow leather.\nRed leather, yellow leather.", challenge: "Say it 3 times. Keep every word clear." },
    fr: { text: "Trois tortues trottaient sur trois étroits toits.\nTrois tortues trottaient sur trois étroits toits.", challenge: "Dites-le 3 fois. Gardez chaque mot clair." } },
  { id: "tt-seashells", type: "tongue", timer: 20,
    en: { text: "She sells seashells by the seashore.\nThe shells she sells are surely seashells.\nSo if she sells shells on the seashore,\nshe's sure they're seashells.", challenge: "Say it clearly. Focus on the difference between S and SH." },
    fr: { text: "Les chaussettes de l'archiduchesse sont-elles sèches,\narchi-sèches ou en sont-elles chaussettes ?", challenge: "Dites-le clairement. Concentrez-vous sur le son « ch »." } },
  { id: "tt-unique-ny", type: "tongue", timer: 15,
    en: { text: "Unique New York, unique New York.\nYou know you need unique New York.\nUnique New York, unique New York.", challenge: "Repeat it 3 times without getting tangled." },
    fr: { text: "Un chasseur sachant chasser\nsait chasser sans son chien.", challenge: "Répétez-le 3 fois sans vous emmêler." } },
  { id: "tt-betty", type: "tongue", timer: 20,
    en: { text: "Betty Botter bought some butter,\nbut she said the butter's bitter.\nIf I put it in my batter,\nit will make my batter bitter.", challenge: "Keep the B and T sounds crisp." },
    fr: { text: "Didon dîna, dit-on, du dos\nd'un dodu dindon.\nDidon dîna, dit-on, du dos d'un dodu dindon.", challenge: "Gardez les D et T bien nets." } },
  { id: "tt-toy-boat", type: "tongue", timer: 15,
    en: { text: "Toy boat, toy boat, toy boat.\nA tiny toy boat, a blue toy boat.\nToy boat, toy boat, toy boat.", challenge: "Repeat it as quickly as you can while staying clear." },
    fr: { text: "Buvons un bon bock de vin blanc\nbuvons un bon bock de vin blanc.", challenge: "Répétez-le aussi vite que possible en restant clair." } },
  { id: "tt-peter", type: "tongue", timer: 20,
    en: { text: "Peter Piper picked a peck of pickled peppers.\nIf Peter Piper picked a peck of pickled peppers,\nwhere's the peck of pickled peppers Peter Piper picked?", challenge: "Keep the P sounds popping." },
    fr: { text: "Si six scies scient six cyprès,\nsix cent six cyprès se scièrent.", challenge: "Gardez les S bien sifflants." } },
  { id: "tt-woodchuck", type: "tongue", timer: 18,
    en: { text: "How much wood would a woodchuck chuck\nif a woodchuck could chuck wood?\nHe would chuck, he would, as much as he could.", challenge: "Don't rush. Let the W and CH sounds land." },
    fr: { text: "Ton thé t'a-t-il ôté ta toux,\ndisait la tortue au tatou.\nTon thé t'a-t-il ôté ta toux ?", challenge: "Ne précipitez pas. Laissez les T bien résonner." } },

  // ─── TYPE B: 3 UNRELATED WORDS ───
  { id: "uw-1", type: "words", timer: 10, en: { words: ["umbrella", "dinosaur", "elevator"] }, fr: { words: ["parapluie", "dinosaure", "ascenseur"] } },
  { id: "uw-2", type: "words", timer: 10, en: { words: ["toothpaste", "volcano", "violin"] }, fr: { words: ["dentifrice", "volcan", "violon"] } },
  { id: "uw-3", type: "words", timer: 10, en: { words: ["astronaut", "pancake", "library"] }, fr: { words: ["astronaute", "crêpe", "bibliothèque"] } },
  { id: "uw-4", type: "words", timer: 10, en: { words: ["cactus", "submarine", "homework"] }, fr: { words: ["cactus", "sous-marin", "devoirs"] } },
  { id: "uw-5", type: "words", timer: 10, en: { words: ["snowstorm", "piano", "sandwich"] }, fr: { words: ["tempête", "piano", "sandwich"] } },
  { id: "uw-6", type: "words", timer: 10, en: { words: ["detective", "watermelon", "airport"] }, fr: { words: ["détective", "pastèque", "aéroport"] } },
  { id: "uw-7", type: "words", timer: 10, en: { words: ["robot", "garden", "birthday"] }, fr: { words: ["robot", "jardin", "anniversaire"] } },
  { id: "uw-8", type: "words", timer: 10, en: { words: ["telescope", "pizza", "suitcase"] }, fr: { words: ["télescope", "pizza", "valise"] } },
  { id: "uw-9", type: "words", timer: 10, en: { words: ["penguin", "skateboard", "lighthouse"] }, fr: { words: ["pingouin", "skate", "phare"] } },
  { id: "uw-10", type: "words", timer: 10, en: { words: ["anchor", "marshmallow", "parachute"] }, fr: { words: ["ancre", "guimauve", "parachute"] } },

  // ─── TYPE C: VOICE FLIP ───
  { id: "vf-trailer", type: "voice", timer: 15,
    en: { style: "Movie Trailer", instruction: "Say this like you're announcing the greatest movie of the year.", sentence: "The meeting starts at nine tomorrow." },
    fr: { style: "Bande-annonce", instruction: "Dites ça comme si vous annonciez le plus grand film de l'année.", sentence: "La réunion commence à neuf heures demain." } },
  { id: "vf-news", type: "voice", timer: 15,
    en: { style: "Breaking News", instruction: "Deliver this like you just received extremely important breaking news.", sentence: "I left my keys on the kitchen table." },
    fr: { style: "Flash info", instruction: "Dites ça comme si vous veniez de recevoir une info ultra-importante.", sentence: "J'ai laissé mes clés sur la table de la cuisine." } },
  { id: "vf-unimpressed", type: "voice", timer: 15,
    en: { style: "Completely Unimpressed", instruction: "Say this as if absolutely nothing could impress you.", sentence: "The bus should be here in five minutes." },
    fr: { style: "Pas du tout impressionné", instruction: "Dites ça comme si rien ne pouvait vous impressionner.", sentence: "Le bus devrait être là dans cinq minutes." } },
  { id: "vf-confident", type: "voice", timer: 15,
    en: { style: "Extremely Confident", instruction: "Say this like there is no possibility you could be wrong.", sentence: "We need more milk from the store." },
    fr: { style: "Ultra confiant", instruction: "Dites ça comme s'il était impossible que vous ayez tort.", sentence: "Il faut qu'on achète du lait." } },
  { id: "vf-secret", type: "voice", timer: 15,
    en: { style: "Secret Mission", instruction: "Say this as if you're revealing something classified.", sentence: "That movie was longer than I expected." },
    fr: { style: "Mission secrète", instruction: "Dites ça comme si vous révéliez un secret classifié.", sentence: "Ce film était plus long que prévu." } },
  { id: "vf-dramatic", type: "voice", timer: 15,
    en: { style: "Dramatic", instruction: "Make this sound much more dramatic than it needs to be.", sentence: "The weather app says it might rain." },
    fr: { style: "Dramatique", instruction: "Rendez ça bien plus dramatique que nécessaire.", sentence: "L'application dit qu'il va peut-être pleuvoir." } },

  // ─── TYPE D: BAN THE WORD ───
  { id: "bw-food", type: "ban", timer: 15, en: { banned: "because", challenge: "Tell me why you love your favorite food. But you cannot say the word because." }, fr: { banned: "parce que", challenge: "Dites-moi pourquoi vous adorez votre plat préféré. Mais sans dire « parce que »." } },
  { id: "bw-movie", type: "ban", timer: 15, en: { banned: "because", challenge: "Explain why you love your favorite movie without saying because." }, fr: { banned: "parce que", challenge: "Expliquez pourquoi vous adorez votre film préféré sans dire « parce que »." } },
  { id: "bw-hobby", type: "ban", timer: 15, en: { banned: "because", challenge: "Tell me why your favorite hobby matters to you without saying because." }, fr: { banned: "parce que", challenge: "Dites pourquoi votre loisir préféré compte pour vous sans dire « parce que »." } },
  { id: "bw-dest", type: "ban", timer: 15, en: { banned: "because", challenge: "Explain why you would choose your dream destination without saying because." }, fr: { banned: "parce que", challenge: "Expliquez pourquoi vous choisiriez votre destination rêvée sans dire « parce que »." } },
  { id: "bw-song", type: "ban", timer: 15, en: { banned: "I like", challenge: "Tell me why you like your favorite song without using the words I like." }, fr: { banned: "j'aime", challenge: "Dites pourquoi vous aimez votre chanson préférée sans dire « j'aime »." } },
  { id: "bw-subject", type: "ban", timer: 15, en: { banned: "interesting", challenge: "Explain why your favorite school subject is interesting without saying interesting." }, fr: { banned: "intéressant", challenge: "Expliquez pourquoi votre matière préférée est intéressante sans dire « intéressant »." } },
  { id: "bw-snack", type: "ban", timer: 15, en: { banned: "good", challenge: "Convince me that your favorite snack is underrated without using the word good." }, fr: { banned: "bon", challenge: "Convainquez-moi que votre goûter préféré est sous-côté sans dire « bon »." } },
  { id: "bw-friend", type: "ban", timer: 15, en: { banned: "very / really", challenge: "Describe your best friend without using very or really." }, fr: { banned: "très / vraiment", challenge: "Décrivez votre meilleur ami sans dire « très » ni « vraiment »." } },
  { id: "bw-morning", type: "ban", timer: 15, en: { banned: "obviously", challenge: "Explain why mornings are hard without saying obviously." }, fr: { banned: "évidemment", challenge: "Expliquez pourquoi les matins sont difficiles sans dire « évidemment »." } },
  { id: "bw-bad", type: "ban", timer: 15, en: { banned: "bad", challenge: "Tell me about a food you can't stand without saying bad." }, fr: { banned: "mauvais", challenge: "Parlez d'un aliment que vous ne supportez pas sans dire « mauvais »." } },

  // ─── TYPE E: READ IT THREE WAYS ───
  { id: "rt-1", type: "three", timer: 8, en: { sentence: "I thought I knew exactly what would happen next." }, fr: { sentence: "Je croyais savoir exactement ce qui allait se passer." } },
  { id: "rt-2", type: "three", timer: 8, en: { sentence: "The door was open, so I walked right in." }, fr: { sentence: "La porte était ouverte, alors je suis entré." } },
  { id: "rt-3", type: "three", timer: 8, en: { sentence: "Nobody expected it to go this far." }, fr: { sentence: "Personne ne s'attendait à ce que ça aille si loin." } },
  { id: "rt-4", type: "three", timer: 8, en: { sentence: "She found the note on the kitchen counter." }, fr: { sentence: "Elle a trouvé le mot sur le comptoir de la cuisine." } },
  { id: "rt-5", type: "three", timer: 8, en: { sentence: "We have exactly ten minutes to decide." }, fr: { sentence: "On a exactement dix minutes pour décider." } },
  { id: "rt-6", type: "three", timer: 8, en: { sentence: "The rain stopped just as we stepped outside." }, fr: { sentence: "La pluie s'est arrêtée juste quand on est sortis." } },

  // ─── MICRO: ONE-BREATH SENTENCE ───
  { id: "ob-1", type: "onebreath", timer: 10, en: { sentence: "The sun came up and the day began." }, fr: { sentence: "Le soleil s'est levé et la journée a commencé." } },
  { id: "ob-2", type: "onebreath", timer: 10, en: { sentence: "I think we should try that again." }, fr: { sentence: "Je pense qu'on devrait réessayer." } },
  { id: "ob-3", type: "onebreath", timer: 10, en: { sentence: "She opened the window and looked outside." }, fr: { sentence: "Elle a ouvert la fenêtre et regardé dehors." } },
  { id: "ob-4", type: "onebreath", timer: 10, en: { sentence: "We can figure this out together." }, fr: { sentence: "On peut trouver la solution ensemble." } },

  // ─── MICRO: REVERSE ENERGY ───
  { id: "re-1", type: "reverse", timer: 12, en: { sentence: "We have milk in the fridge." }, fr: { sentence: "On a du lait dans le frigo." } },
  { id: "re-2", type: "reverse", timer: 12, en: { sentence: "The train is on time today." }, fr: { sentence: "Le train est à l'heure aujourd'hui." } },
  { id: "re-3", type: "reverse", timer: 12, en: { sentence: "I finished my homework early." }, fr: { sentence: "J'ai fini mes devoirs en avance." } },
  { id: "re-4", type: "reverse", timer: 12, en: { sentence: "It's a Tuesday afternoon." }, fr: { sentence: "C'est un mardi après-midi." } },

  // ─── MICRO: THREE-WORD STORY ───
  { id: "tw-1", type: "threeword", timer: 10, en: { words: ["forest", "key", "whisper"] }, fr: { words: ["forêt", "clé", "murmure"] } },
  { id: "tw-2", type: "threeword", timer: 10, en: { words: ["river", "clock", "stranger"] }, fr: { words: ["rivière", "horloge", "inconnu"] } },
  { id: "tw-3", type: "threeword", timer: 10, en: { words: ["window", "letter", "storm"] }, fr: { words: ["fenêtre", "lettre", "orage"] } },
  { id: "tw-4", type: "threeword", timer: 10, en: { words: ["mirror", "coin", "midnight"] }, fr: { words: ["miroir", "pièce", "minuit"] } },

  // ─── MICRO: INSTANT DEFINITION ───
  { id: "id-1", type: "define", timer: 15, en: { object: "a toothbrush" }, fr: { object: "une brosse à dents" } },
  { id: "id-2", type: "define", timer: 15, en: { object: "an umbrella" }, fr: { object: "un parapluie" } },
  { id: "id-3", type: "define", timer: 15, en: { object: "a refrigerator" }, fr: { object: "un réfrigérateur" } },
  { id: "id-4", type: "define", timer: 15, en: { object: "a pair of scissors" }, fr: { object: "des ciseaux" } },
];

// Pick a random warm-up, avoiding the last id and rotating types when possible.
export function pickWarmUp(list, avoidId, avoidType) {
  let pool = list.filter((w) => w.id !== avoidId);
  if (!pool.length) pool = list;
  if (avoidType) {
    const diffType = pool.filter((w) => w.type !== avoidType);
    if (diffType.length) pool = diffType;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
