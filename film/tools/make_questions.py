#!/usr/bin/env python3
"""Writes data/unit1/questions.json and data/unit2/questions.json.

Each "scenario" is an exam section (its stem is the section rubric) and each
question is one essay. Sample-paper stems (Eduqas SAMs) are marked "(sample
paper)"; the rest are written in the same style. Marking is levels-based with
five bands, as in the Eduqas mark schemes: AO1 and AO2 count equally.

Papers: two open mock papers (also in the practice bank) and two sealed
papers that only Pure Past Papers mode uses.
Run:  python tools/make_questions.py   then   python build_inline.py"""
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TWO_FILM = 'If only one film is discussed, the mark scheme halves the band mark.'
HOW_FAR = '“How far / How useful” needs a judgement, argued in every paragraph and stated in the conclusion.'
FORM = 'Every paragraph needs a named scene AND a named technique (your teacher’s target 1).'
NO_I = 'Write impersonally: “the spectator is positioned”, never “I felt”.'

RULE40 = ('Levels-based: five bands, AO1 (knowledge, 20) and AO2 (application, 20) weighted equally. '
          'Pick the band that best fits the whole answer.')
RULE20 = ('Levels-based: five bands, AO1 (10) and AO2 (10) weighted equally. '
          'Pick the band that best fits the whole answer.')


def Q(qid, scen, part, section, code, command, question, focus, indicative, model, marks=40, traps=None):
    return {
        'id': qid, 'scenario': scen, 'part': part, 'section': section, 'code': code,
        'marks': marks, 'commandWord': command, 'context': '', 'question': question, 'slots': 0,
        'traps': traps or [],
        'markScheme': {'type': 'levels', 'rule': RULE40 if marks == 40 else RULE20,
                       'focus': focus, 'indicative': indicative},
        'modelAnswer': model,
    }


# ------------------------------------------------------------------ Component 1
SA = ('Section A: Hollywood 1930–1990 (comparative study). Answer on one film from Group 1 (Classical '
      'Hollywood: Casablanca) and one from Group 2 (New Hollywood: Bonnie and Clyde). Compare the films throughout. [40]')
SB = ('Section B: American film since 2012 (two-film study). Answer on one mainstream film (Joker) and one '
      'contemporary independent film (Get Out). Refer in detail to at least one sequence from each film. [40]')
SC = ('Section C: British film since 1995 (two-film study). Answer on your two British films (Trainspotting '
      'and Shaun of the Dead). [40]')

TA = ['Compare = weave both films into every paragraph (“whereas”, “similarly”), not film 1 then film 2.', TWO_FILM, HOW_FAR]
TB = ['“Refer in detail to at least one sequence from each film” is an instruction: missing it caps the mark.', TWO_FILM, HOW_FAR, NO_I]
TC = ['“How useful … ideological critical approach” = evaluate the APPROACH, not just describe the ideology.', TWO_FILM, FORM]

u1_q = []
# ---- Section A: practice bank
u1_q += [
 Q('a-auteur', 'pa', '1', 'A', 'A3.2.4', 'Compare',
   'Compare how far your chosen films reflect the auteur signature features of their filmmakers. (sample paper)',
   'Auteur signatures (stylistic and thematic) in both films, and how far each film reflects them; the tension between a single auteur and collaboration.',
   ['Curtiz’s stylistic signature: crane and tracking shots, expressive shadows, dense foregrounds (Rick’s entrance, the market crane)',
    'Curtiz’s weak thematic signature: a versatile studio workhorse; Schatz’s “genius of the system” (Wallis, the Epsteins, Steiner, Edeson, Bogart)',
    'Penn’s thematic signature: sympathetic outsiders destroyed by a violent society (The Left Handed Gun, Little Big Man)',
    'Collaborators on Bonnie and Clyde: Beatty as producer-star, Dede Allen’s editing, Benton and Newman’s New Wave script',
    'Judgement on degree: Bonnie and Clyde reflects a stronger personal signature than Casablanca because New Hollywood gave directors more control',
    'Band 5: constraints on the auteur (studio, Production Code, star persona vs director)'],
   'Thesis: Bonnie and Clyde reflects its director’s signature far more than Casablanca, because Penn worked as the studio system collapsed while Curtiz worked inside it.\n\n'
   'P1 Style: Curtiz’s crane into the market and the delayed reveal of Rick show a fluid-camera signature, whereas Penn’s signature lies in performance and sudden violence (the clerk shot through the glass).\n\n'
   'P2 Themes: Penn returns to outsiders destroyed by society; Curtiz moved across genres, so Casablanca’s commitment theme comes from Wallis, the writers and wartime policy as much as from him.\n\n'
   'P3 Collaboration: Casablanca as Schatz’s “genius of the system”; Bonnie and Clyde shaped by Beatty and Dede Allen, so even New Hollywood auteurism was collaborative.\n\n'
   'Conclusion: to a large extent for Penn, to a limited extent for Curtiz; the auteur approach is more useful for New Hollywood than for the studio era.', traps=TA),
 Q('a-production', 'pa', '2', 'A', 'A3.1.2', 'Compare',
   'Compare how far your chosen films reflect their different production contexts. (sample paper)',
   'How the studio system (1942) and its collapse (1967) shaped each film’s style, content and meaning.',
   ['Warner Bros. vertical integration: contract stars, director, composer; studio sets and fog at the airport',
    'Production Code shaping Casablanca’s narrative resolution (Ilsa cannot leave her husband) and the searchlight dissolve',
    '1948 Paramount ruling, TV, and Beatty as independent producer; Warner–Seven Arts as reluctant distributor',
    'Collapse of the Code: graphic violence and sexuality in Bonnie and Clyde; ratings in 1968',
    'Location shooting and New Wave influence vs studio-built exoticism',
    'Judgement: both films are products of their institution, but Bonnie and Clyde ALSO helped change its context'],
   'Thesis: both films reflect their production contexts to a significant extent, but Casablanca is shaped BY its institution, while Bonnie and Clyde helps reshape its own.\n\n'
   'P1 Studio system vs independent producing (Wallis assigning the team vs Beatty buying the script).\n\n'
   'P2 Censorship: the dissolve to the searchlight vs the clerk’s bloodied face.\n\n'
   'P3 Technology and place: studio fog and Edeson’s chiaroscuro vs Guffey’s location light and slow-motion multi-camera ending.\n\n'
   'Conclusion: to a large extent for both; the endings are the clearest proof.', traps=TA),
 Q('a-social', 'pa', '3', 'A', 'A1.1.3', 'Compare',
   'Compare how far your chosen films reflect the social and political contexts in which they were made.',
   'The Second World War and intervention (1942) vs the 1960s counterculture, Vietnam and distrust of authority (1967).',
   ['Rick’s isolationism to commitment mirrors America entering the war; the anthem duel',
    'Refugees, Vichy France, the Vichy water bottle',
    'Bonnie and Clyde: a Depression setting read through 1960s youth rebellion and anti-establishment feeling',
    'Televised Vietnam violence and the realistic, slow-motion ending',
    'Contemporary setting (Casablanca) vs period setting (Bonnie and Clyde): the double layer of context',
    'Judgement on how far context explains meaning versus genre or authorship'],
   'Thesis: both films reflect their contexts closely, but Casablanca speaks about its present directly while Bonnie and Clyde uses the past as an allegory for the present.\n\n'
   'P1 War vs counterculture through the heroes’ final choices.\n\nP2 The anthem duel vs the foreclosed farm.\n\nP3 Violence: Strasser’s clean death vs the bullet-ridden ending.\n\nConclusion: to a large extent; context shapes each film’s idea of heroism.', traps=TA),
 Q('a-collab', 'pa', '4', 'A', 'A1.5.2', 'Compare',
   '“Hollywood films are the product of collaboration, not of a single author.” Compare how far this is true of your chosen films.',
   'Evaluate the auteur approach against collaborative authorship in both films.',
   ['Casablanca: Wallis, the Epsteins and Koch, Steiner, Edeson, Bogart’s persona; the script rewritten during shooting',
    'Bonnie and Clyde: Beatty, Benton and Newman, Robert Towne, Dede Allen, Guffey, Van Runkle',
    'Arguments for a single author: Curtiz’s visual style; Penn’s themes and work with actors',
    'Sarris vs Kael: three circles vs “Circles and Squares”',
    'Stars as authors (Dyer): Bogart and Beatty',
    'Judgement on which film better fits the statement'],
   'Thesis: the statement is largely true of both, and especially of Casablanca, though Penn’s themes give Bonnie and Clyde a stronger single voice.\n\n'
   'P1 Casablanca’s team. P2 Bonnie and Clyde’s team (Allen, Beatty). P3 The case for the director in each. P4 Stars as co-authors.\n\nConclusion: collaboration is the rule; the auteur is at most an orchestrator.', traps=TA),
 Q('a-values', 'pa', '5', 'A', 'A3.1.3', 'Compare',
   'Compare how far the endings of your chosen films reflect the values of their time.',
   'Narrative resolution and film form in both endings, linked to context.',
   ['Casablanca: closure, sacrifice, “beautiful friendship”, La Marseillaise, fog',
    'Production Code requirement that adultery not be rewarded',
    'Bonnie and Clyde: no closure, slow-motion massacre, cut to black, no music',
    'War-effort collectivism vs 1960s individual rebellion and distrust of the state',
    'Classical vs New Hollywood narrative conventions',
    'Judgement: endings as the clearest expression of each era’s values'],
   'Thesis: both endings reflect their era’s values to a great extent: duty and alliance in 1942, rebellion and the violence of authority in 1967.\n\n'
   'P1 Form of each ending. P2 Values: sacrifice vs martyrdom. P3 Institution: Code vs collapse.\n\nConclusion: the endings are the films’ arguments.', traps=TA),
]
# ---- Section B: practice bank
u1_q += [
 Q('b-passive', 'pb', '1', 'B', 'B3.1.2', 'How far',
   'How far do your chosen films demonstrate a constant shift between passive and active spectatorship? Refer in detail to at least one sequence from each film. (sample paper)',
   'Passive identification and active questioning in both films, through specific sequences and techniques.',
   ['Definitions: passive (absorbed, aligned) vs active (questioning, resisting, bringing context)',
    'Joker: subway murders (subjective camera, cello) → guilty identification; Sophie reveal → active doubt',
    'Get Out: Sunken Place (subjective camera, muffled sound) → immersion; auction and police-car ending → active reading',
    'Murray Smith: alignment vs allegiance; Hall’s readings; hooks’ oppositional gaze',
    'Viewing conditions and different spectators (Black and white audiences; fans vs critics)',
    'Judgement on “constant”: is the shift constant, or concentrated at key moments?'],
   'Thesis: both films shift the spectator between passive and active positions to a significant extent, though Joker does so to unsettle sympathy and Get Out to sharpen suspicion.\n\n'
   'P1 Joker’s subway sequence (low-key lighting, claustrophobic framing, cello): passive alignment, then active horror.\n\n'
   'P2 The Sophie reveal: editing replays scenes without her, forcing active re-reading.\n\n'
   'P3 Get Out’s Sunken Place: restricted POV, falling motion, muffled sound = passive immersion; the teacup motif rewards active viewers.\n\n'
   'P4 The police-car ending relies on spectators’ real-world knowledge: active spectatorship.\n\n'
   'Conclusion: constant to a large extent; the shifts ARE each film’s meaning.', traps=TB),
 Q('b-cues', 'pb', '2', 'B', 'B3.1.7', 'How far',
   'How far do your chosen films demonstrate the importance of visual and soundtrack cues in influencing spectator response? Refer in detail to at least one sequence from each film. (sample paper)',
   'Specific visual and sound cues in sequences from both films and how far they determine response.',
   ['Joker: the cello score, Arthur’s laugh, the stairs palette and glam-rock needle-drop',
    'Get Out: the spoon on china, “Run Rabbit Run”, Swahili score, POV framing',
    'Cues can conflict: upbeat music over violence creates unease',
    'Other cues: narrative, performance, genre, auteur (spec list)',
    'Limits: spectators’ identity and context also shape response',
    'Judgement on importance compared with other factors'],
   'Thesis: visual and soundtrack cues are central in both films, but their effect depends on what the spectator brings.\n\n'
   'P1 Joker’s stair dance: palette, slow motion and music. P2 The cello after the subway. P3 Get Out’s teacup and Sunken Place. P4 The police lights at the end.\n\nConclusion: important to a significant extent, but not alone.', traps=TB),
 Q('b-ideology', 'pb', '3', 'B', 'B3.2.1', 'How far',
   'How far is the spectator’s response to your chosen films shaped by their ideology? Refer in detail to at least one sequence from each film.',
   'Ideology (class neglect; liberal racism) and how it shapes response through form.',
   ['Joker: Marxist reading of class neglect; the Murray Franklin show and riot',
    'Get Out: liberal racism and the commodified Black body; the garden-party auction',
    'Preferred and oppositional readings (Hall): Joker’s ambiguity',
    'Genre pleasure can matter as much as ideology',
    'Evaluation of the ideological approach itself',
    'Judgement'],
   'Thesis: ideology shapes response strongly in Get Out, where it is precise, and more ambiguously in Joker, whose ideology divides spectators.\n\nP1 Auction. P2 Murray show. P3 Diverse responses. P4 Limits of ideology.\n\nConclusion.', traps=TB),
 Q('b-identify', 'pb', '4', 'B', 'B3.1.4', 'How far',
   'How far do your chosen films position the spectator to identify with their central characters? Refer in detail to at least one sequence from each film.',
   'Alignment and allegiance with Arthur and Chris, created by film form and narrative.',
   ['Restricted narration in both films', 'Joker: alignment without full allegiance (Murray Smith)',
    'Get Out: alignment and allegiance with a victim', 'Performance cues: Phoenix’s body; Kaluuya’s tear',
    'Moments that break identification: Arthur’s later murders; dramatic irony at the auction', 'Judgement'],
   'Thesis: both align us with their protagonists almost totally, but only Get Out asks for full allegiance.\n\nP1 Opening sequences. P2 Joker’s violence breaking allegiance. P3 Sunken Place. P4 Irony at the auction.\n\nConclusion.', traps=TB),
 Q('b-challenge', 'pb', '5', 'B', 'B3.2.3', 'How far',
   'How far do your chosen films challenge dominant ideologies of American society? Refer in detail to at least one sequence from each film.',
   'Whether each film challenges or reinforces dominant ideas (post-racial America, meritocracy, the comic-book hero).',
   ['Get Out challenges the post-racial myth', 'Joker challenges meritocracy and attacks the indifferent rich',
    'Joker may also reinforce a violent, male grievance fantasy', 'Institutional context: Blumhouse control vs Warner IP',
    'Hegemony (Gramsci) and how mainstream films absorb critique', 'Judgement'],
   'Thesis: Get Out challenges dominant ideology clearly; Joker challenges it but risks glamorising what it critiques.\n\nP1 Liberal racism. P2 Class. P3 Ambiguity. P4 Institution.\n\nConclusion.', traps=TB),
]
# ---- Section C: practice bank
u1_q += [
 Q('c-resolution', 'pc', '1', 'C', 'C3.1.7', 'How useful',
   'How useful has an ideological critical approach been in understanding the narrative resolution of your chosen films? (sample paper)',
   'Apply ideology to each ending and evaluate how much it explains.',
   ['Trainspotting: Renton steals the money; “Choose Life” bookends; individualism over loyalty (Thatcherism)',
    'Shaun: the news montage; zombies as labour; parodied Todorov equilibrium (Marxist)',
    'Film form in the endings: “Born Slippy”, walking to camera; channel-flicking montage',
    'What ideology reveals that a purely narrative reading misses',
    'Limits: irony, comedy and genre pleasure; ambiguous endings',
    'Judgement on usefulness'],
   'Thesis: an ideological approach is highly useful for both resolutions, because each ending exposes how capitalism absorbs rebellion, though comedy and irony limit a single reading.\n\n'
   'P1 Renton’s theft: voiceover returns inverted; Thatcherite individualism.\n\nP2 Shaun’s montage: capitalism absorbs the undead; the new equilibrium = the old.\n\nP3 Comparison: both endings are ironic “happy endings”.\n\nP4 Limits: Renton’s gift to Spud; Shaun keeps Ed out of love, not ideology.\n\nConclusion: very useful, but not sufficient alone.', traps=TC),
 Q('c-binary', 'pc', '2', 'C', 'C3.1.3', 'How useful',
   'How useful has an ideological critical approach been in understanding binary oppositions in the narratives of your chosen films? (sample paper)',
   'Lévi-Strauss oppositions in each film, read ideologically, with evaluation.',
   ['Trainspotting: heroin vs consumer “life”; loyalty vs individualism; Scotland vs England',
    'Shaun: alive vs undead; responsibility vs slacking; pub vs home',
    'Ideology shows the oppositions collapsing: Renton swaps one addiction for another; Shaun is already a zombie',
    'Form: mirrored walks, bookended monologues, colour',
    'Limits of structuralism and ideology', 'Judgement'],
   'Thesis: ideology is very useful because in both films the oppositions are revealed as false.\n\nP1 Heroin vs life. P2 Living vs undead (mirrored walks). P3 Masculine oppositions. P4 Limits.\n\nConclusion.', traps=TC),
 Q('c-masculinity', 'pc', '3', 'C', 'C1.4.3', 'How useful',
   'How useful has an ideological critical approach been in understanding the representation of masculinity in your chosen films?',
   'Feminist/ideological readings of masculinity in crisis in both films.',
   ['Begbie’s toxic violence; Renton’s evasion; Spud’s gentleness', 'Shaun and Ed as man-children; Shaun’s arc to care',
    'Deindustrialisation and Gen-X contexts', 'Women as peripheral or as agents of change (Liz, Diane)',
    'Evaluation of the approach', 'Judgement'], 'Thesis: very useful for both, as masculinity in crisis is central to each film’s critique of British society.\n\nP1 Begbie’s pub brawl. P2 Shaun’s mum. P3 Women. P4 Limits.\n\nConclusion.', traps=TC),
 Q('c-devices', 'pc', '4', 'C', 'C3.1.5', 'How far',
   'How far do narrative devices in your chosen films shape their ideological meaning?',
   'Voiceover, repetition, foreshadowing and structure as carriers of ideology.',
   ['Renton’s unreliable voiceover and bookending', 'Shaun’s foreshadowing and mirrored walks',
    'Episodic vs linear three-act structures', 'Genre parody as narrative device',
    'Todorov’s new equilibria', 'Judgement'], 'Thesis: to a great extent; in both films the ideology lives in the structure.\n\nP1 Voiceover. P2 Repetition. P3 Endings.\n\nConclusion.', traps=TC),
 Q('c-society', 'pc', '5', 'C', 'C1.1.3', 'How useful',
   '“British film offers a critique of its society.” How useful has an ideological critical approach been in exploring this in your chosen films?',
   'Critique of Thatcherite and consumer Britain in both films; evaluation of the approach.',
   ['Trainspotting: “Choose Life”, Tommy’s HIV, “It’s shite being Scottish”', 'Shaun: dead-end jobs, suburban routine, the pub as identity',
    'Representation of place: Edinburgh and suburban London', 'Comedy and style as vehicles of critique',
    'Limits: entertainment and genre', 'Judgement'], 'Thesis: very useful, as both films satirise consumer Britain, though one through heroin and one through zombies.\n\nP1 Consumerism. P2 Place. P3 Endings.\n\nConclusion.', traps=TC),
]
# ---- Mock papers (open)
u1_q += [
 Q('m1-a', 'm1a', '1', 'A', 'A3.1.1', 'Compare',
   'Compare how far key elements of film form in your chosen films reflect their historical contexts.',
   'Film form as evidence of 1942 and 1967 contexts.',
   ['Studio lighting and continuity vs location light and jump cuts', 'Steiner’s patriotic leitmotifs vs bluegrass counterpoint',
    'The Code’s dissolves vs graphic squibs', 'Opening sequences compared', 'Judgement'],
   'Thesis: film form reflects context strongly in both; style itself is historical evidence.\n\nP1 Editing. P2 Sound. P3 Openings.\n\nConclusion.', traps=TA),
 Q('m1-b', 'm1b', '2', 'B', 'B2.4.3', 'How far',
   'How far do your chosen films use genre to shape spectator response? Refer in detail to at least one sequence from each film.',
   'Genre cues (horror, comic-book, character study) and how they position the spectator.',
   ['Get Out: horror tropes flipped (opening abduction); comic release through Rod', 'Joker: comic-book IP vs 1970s character study',
    'Genre expectation as an active-spectator cue', 'Limits', 'Judgement'],
   'Thesis: genre is crucial to both, especially Get Out, which relies on horror literacy.\n\nP1 Opening. P2 Rod. P3 Joker’s genre mix.\n\nConclusion.', traps=TB),
 Q('m1-c', 'm1c', '3', 'C', 'C3.1.6', 'How far',
   'How far do your chosen films use genre conventions in their narratives?',
   'Genre and narrative (spec Area 5) in both films.',
   ['Shaun: zombie-film structure parodied; Romero homage', 'Trainspotting: crime-caper ending; drug-film conventions subverted',
    'Neale’s repetition and difference', 'Ideological effect of genre choices', 'Judgement'],
   'Thesis: Shaun is built on genre; Trainspotting uses genre only at its edges.\n\nP1 Shaun’s three acts. P2 Trainspotting’s episodes. P3 Endings.\n\nConclusion.', traps=TC),
 Q('m2-a', 'm2a', '1', 'A', 'A1.4.2', 'Compare',
   'Compare how far your chosen films reflect changing representations of gender in Hollywood.',
   'Gender representation in 1942 and 1967 linked to context and form.',
   ['Ilsa as object of exchange; glamour lighting; Mulvey', 'Bonnie’s desire; the opening ECU; Clyde’s impotence',
    'Production Code vs its collapse', 'Masculinity: Rick’s sacrifice vs Clyde’s insecurity', 'Judgement'],
   'Thesis: a clear shift from passive to active femininity, though Bonnie still exists through Clyde’s story.\n\nP1 Lighting the women. P2 Masculinity. P3 Censorship.\n\nConclusion.', traps=TA),
 Q('m2-b', 'm2b', '2', 'B', 'B3.1.3', 'How far',
   'How far do different spectators respond differently to your chosen films? Refer in detail to at least one sequence from each film.',
   'Reasons for uniformity or diversity of response: identity, context, viewing conditions.',
   ['Hall’s readings applied to Joker’s riot', 'Black and white spectators and the police-car ending; hooks',
    'Viewing conditions: security at Joker screenings; rewatching Get Out', 'Cues that create uniform response (jump scares)', 'Judgement'],
   'Thesis: response is diverse to a large extent, though both films use strong cues to unify reactions at key moments.\n\nP1 Joker riot. P2 Police car. P3 Shared jump scares.\n\nConclusion.', traps=TB),
 Q('m2-c', 'm2c', '3', 'C', 'C1.3.1', 'How useful',
   'How useful has an ideological critical approach been in understanding the opening sequences of your chosen films?',
   'Openings as ideological statements.',
   ['“Choose Life” chase: anti-consumerism, freeze-frames, “Lust for Life”', 'Shaun’s blank close-up and first walk to the shop',
    'Openings set up later reversals', 'Limits', 'Judgement'],
   'Thesis: very useful; both openings state the ideology the endings resolve.\n\nP1 Choose Life. P2 Zombie Shaun. P3 Links to endings.\n\nConclusion.', traps=TC),
]
# ---- Sealed papers (Pure Past Papers only)
u1_q += [
 Q('s3-a', 'p3a', '1', 'A', 'A2.1.4', 'Compare',
   'Compare how far your chosen films reflect the institutional context of the Hollywood studio system and its decline.',
   'Studio system (1942) vs post-studio New Hollywood (1967).',
   ['Vertical integration and contracts', 'Paramount Decree and TV', 'Beatty as producer', 'Production Code and ratings', 'Judgement'],
   'Thesis: both are defined by their institutions, at opposite ends of the studio era.', traps=TA),
 Q('s3-b', 'p3b', '2', 'B', 'B1.4.2', 'How useful',
   'How useful is an ideological critical approach in understanding the representation of class or race in your chosen films? Refer in detail to at least one sequence from each film.',
   'Class (Joker) and race (Get Out) through an ideological lens.',
   ['Joker: Wayne vs the clowns; subway', 'Get Out: auction; Georgina and Walter', 'Marxist and anti-racist readings', 'Evaluation', 'Judgement'],
   'Thesis: very useful for both, as each film argues that social systems create its horror.', traps=TB),
 Q('s3-c', 'p3c', '3', 'C', 'C1.4.1', 'How far',
   'How far does narrative structure create ideological meaning in your chosen films?',
   'Episodic vs linear structures and their ideology.',
   ['Trainspotting’s bookends', 'Shaun’s mirrored walks and ending', 'Todorov', 'Limits', 'Judgement'],
   'Thesis: to a large extent; both structures turn rebellion into conformity.', traps=TC),
 Q('s4-a', 'p4a', '1', 'A', 'A2.5.1', 'Compare',
   '“A director’s signature is most visible in a film’s style.” Compare how far this is true of your chosen films.',
   'Stylistic vs thematic signatures of Curtiz and Penn.',
   ['Curtiz’s camera and shadows', 'Penn’s violence and performance', 'Collaborators’ style (Edeson, Allen)', 'Thematic signatures', 'Judgement'],
   'Thesis: true of Curtiz, only partly of Penn, whose signature is also thematic.', traps=TA),
 Q('s4-b', 'p4b', '2', 'B', 'B1.2.5', 'How far',
   'How far do the narratives of your chosen films position the spectator? Refer in detail to at least one sequence from each film.',
   'Narrative cues: restricted narration, reveals, endings.',
   ['Sophie reveal', 'Rose’s reveal and the auction irony', 'Endings', 'Alignment', 'Judgement'],
   'Thesis: narrative is the main positioning tool in both films.', traps=TB),
 Q('s4-c', 'p4c', '3', 'C', 'C2.4.3', 'How useful',
   'How useful has an ideological critical approach been in understanding character relationships in your chosen films?',
   'Friendships and families read ideologically.',
   ['Renton’s betrayal of the gang', 'Shaun, Ed, Liz and Philip', 'Masculinity and loyalty', 'Limits', 'Judgement'],
   'Thesis: useful, as both films test loyalty against self-interest and adulthood.', traps=TC),
]

u1 = {
 'papers': [
  {'id': 'c1m1', 'title': 'Component 1 Mock Paper 1', 'minutes': 150, 'scenarios': ['m1a', 'm1b', 'm1c']},
  {'id': 'c1m2', 'title': 'Component 1 Mock Paper 2', 'minutes': 150, 'scenarios': ['m2a', 'm2b', 'm2c']},
  {'id': 'c1p3', 'title': 'Paper 3', 'minutes': 150, 'scenarios': ['p3a', 'p3b', 'p3c'], 'sealed': True},
  {'id': 'c1p4', 'title': 'Paper 4', 'minutes': 150, 'scenarios': ['p4a', 'p4b', 'p4c'], 'sealed': True},
 ],
 'scenarios': [
  {'id': 'pa', 'number': 1, 'title': 'Section A practice: Hollywood comparative', 'stem': SA},
  {'id': 'pb', 'number': 2, 'title': 'Section B practice: American film', 'stem': SB},
  {'id': 'pc', 'number': 3, 'title': 'Section C practice: British film', 'stem': SC},
  {'id': 'm1a', 'number': 1, 'title': 'Section A', 'stem': SA}, {'id': 'm1b', 'number': 2, 'title': 'Section B', 'stem': SB},
  {'id': 'm1c', 'number': 3, 'title': 'Section C', 'stem': SC},
  {'id': 'm2a', 'number': 1, 'title': 'Section A', 'stem': SA}, {'id': 'm2b', 'number': 2, 'title': 'Section B', 'stem': SB},
  {'id': 'm2c', 'number': 3, 'title': 'Section C', 'stem': SC},
  {'id': 'p3a', 'number': 1, 'title': 'Section A', 'stem': SA, 'total': 40}, {'id': 'p3b', 'number': 2, 'title': 'Section B', 'stem': SB, 'total': 40},
  {'id': 'p3c', 'number': 3, 'title': 'Section C', 'stem': SC, 'total': 40},
  {'id': 'p4a', 'number': 1, 'title': 'Section A', 'stem': SA, 'total': 40}, {'id': 'p4b', 'number': 2, 'title': 'Section B', 'stem': SB, 'total': 40},
  {'id': 'p4c', 'number': 3, 'title': 'Section C', 'stem': SC, 'total': 40},
 ],
 'questions': u1_q,
}

# ------------------------------------------------------------------ Component 2
GA = ('Section A: Global film (two-film study). Answer with close reference to the two films you have studied: '
      'one European film (Pan’s Labyrinth) and one from outside Europe (City of God). Comparison is not assessed. [40]')
DB = 'Section B: Documentary film. Answer on the documentary you have studied (Amy). [20]'
TG = ['“With close reference to the two films” = both films, in depth. Comparison earns no extra marks.', TWO_FILM, FORM]
TD = [HOW_FAR, 'Name the filmmaker’s theory precisely and explain its central ideas before applying it.', FORM]

u2_q = [
 Q('g-perf', 'ga', '1', 'A', 'A1.2.2', 'Explore',
   'With close reference to the two films you have studied, explore how either performance or mise-en-scène create meaning. (sample paper)',
   'Choose ONE element and analyse how it creates meaning in both films.',
   ['Mise-en-scène: Vidal’s watch and uniform; the Pale Man’s banquet and shoes; the labyrinth motif',
    'City of God: the favela growing cramped; the apartment; guns and gold',
    'Performance: López’s chilling precision; Baquero’s stillness; City of God’s non-professional cast',
    'Meaning linked to context: fascism; state neglect',
    'Aesthetic dimension: gothic fairytale vs kinetic realism'],
   'Thesis (mise-en-scène): in both films mise-en-scène turns setting into argument: the fantasy mirrors fascism, the favela shows the cycle of neglect.\n\n'
   'P1 Vidal’s watch and the mirror. P2 The Pale Man’s feast and shoes. P3 The Story of the Apartment. P4 The favela closing in over the decades.\n\nConclusion: mise-en-scène is where each film’s politics becomes visible.', traps=TG),
 Q('g-edit', 'ga', '2', 'A', 'A2.2.2', 'Explore',
   'With close reference to the two films you have studied, explore how either editing or sound create meaning. (sample paper)',
   'Choose ONE element and analyse how it creates meaning in both films.',
   ['Editing: City of God’s freeze-frames, 360° spin, apartment dissolves', 'Pan’s Labyrinth’s wipes between worlds; cross-cutting at the climax',
    'Sound: the lullaby motif; sweetened violence; Rocket’s voiceover; ironic funk and samba',
    'Meaning: cycles of violence; fantasy as resistance', 'Spectator response to rhythm and sound'],
   'Thesis (editing): editing creates each film’s structure of meaning: cycles in City of God, mirrored worlds in Pan’s Labyrinth.\n\nP1 Chicken chase. P2 Apartment. P3 Wipes. P4 Final cross-cutting.\n\nConclusion.', traps=TG),
 Q('g-cine', 'ga', '3', 'A', 'A1.2.1', 'Explore',
   'With close reference to the two films you have studied, explore how cinematography, including lighting, creates meaning.',
   'Camera, colour and lighting in both films.',
   ['Blue reality vs amber fantasy', 'Canted opening and the eye', 'Handheld chaos; warm past vs cold present',
    'Low-key lighting in the bottle murder', 'Shallow focus on the shoes'],
   'Thesis: colour and camera build each film’s argument.\n\nP1 Palettes. P2 Openings. P3 Violence. P4 Endings.\n\nConclusion.', traps=TG),
 Q('g-rep', 'ga', '4', 'A', 'A2.4.1', 'Explore',
   'With close reference to the two films you have studied, explore how film form constructs representations of identity and place.',
   'Identity (gender, age, class, ethnicity) and place through film form.',
   ['Patriarchy in Vidal’s mill; Mercedes and Carmen', 'Children in danger in both films', 'The favela as character; race and class',
    '1944 rural Spain as a place of occupation', 'Ideological nature of representation'],
   'Thesis: both films represent places that crush the young, through distinctive form.\n\nP1 Place. P2 Gender. P3 Childhood.\n\nConclusion.', traps=TG),
 Q('g-aesth', 'ga', '5', 'A', 'A1.4.2', 'Explore',
   'With close reference to the two films you have studied, explore how far their aesthetic qualities contribute to their meaning.',
   'Aesthetics and meaning; spectacle vs narrative; critical views.',
   ['Del Toro’s gothic fairytale; practical creatures', 'City of God’s kinetic sun-drenched style',
    'Bentes’ “cosmetics of hunger” critique', 'Spectacle vs narrative resolution', 'Judgement'],
   'Thesis: aesthetics carry meaning in both, though City of God’s style risks glamorising what it condemns.\n\nP1 Pale Man. P2 Chicken chase. P3 Critique. P4 Endings.\n\nConclusion.', traps=TG),
 Q('d-theory', 'db', '1', 'B', 'B3.1.3', 'How far',
   'Apply one filmmaker’s theory of documentary film you have studied to your chosen documentary. How far does this increase your understanding of the film? (sample paper)',
   'Clarify one theory (Longinotto, Broomfield, Moore or Watkins), apply it to Amy, judge how far it helps.',
   ['Longinotto: invisible filmmaker, fiction-like identification, no conclusions', 'Amy: invisible Kapadia, audio-only interviews, identification with Amy',
    'Differences: Amy uses captions, music and an implied conclusion about blame', 'Techniques conveying the real: home video, on-screen lyrics',
    'Band 5: documentaries can only give an ideological representation of their subject'],
   'Thesis: Longinotto’s theory increases understanding to a large extent, because Amy shares her invisibility and identification, but its implied blame shows where Kapadia departs.\n\n'
   'P1 Invisibility: no talking heads; audio over footage. P2 Identification: the birthday video and lyrics. P3 Departures: score, edit-driven blame, paparazzi sequences.\n\nConclusion.', marks=20, traps=TD),
 Q('d-digital', 'db', '2', 'B', 'B2.1.1', 'How far',
   '“Portable digital cameras, digital sound recording and non-linear digital editing have had a very significant impact on documentary film.” How far has digital technology had an impact on your chosen documentary? (sample paper)',
   'Both sides of the digital debate, applied to Amy.',
   ['Digital-era footage: camcorders, phones, paparazzi', 'Non-linear editing of vast archive; reframing low-res images',
    'Digital distribution and celebrity websites', 'Counter: compilation films and tragic narratives pre-date digital', 'Judgement'],
   'Thesis: very significant: Amy could not exist without digital recording, though its storytelling is traditional.\n\nP1 Footage. P2 Editing. P3 Counter-argument.\n\nConclusion.', marks=20, traps=TD),
 Q('d-fact', 'db', '3', 'B', 'B4.1.3', 'How far',
   'How far does your chosen documentary blur the boundary between fact and fiction?',
   'Fiction-like techniques in a factual film.',
   ['Tragic three-act shape', 'Pinto’s score', 'Selective editing and Mitch’s objections', 'Real footage as authenticating', 'Judgement'],
   'Thesis: to a significant extent in form, though not in content.', marks=20, traps=TD),
 Q('d-construct', 'db', '4', 'B', 'B4.1.1', 'How far',
   '“Documentary filmmakers construct rather than record reality.” How far is this true of your chosen documentary?',
   'Grierson’s creative treatment of actuality applied to Amy.',
   ['Kapadia did not shoot the footage but selected it', 'Audio-only interviews shape interpretation', 'On-screen lyrics', 'Ending with press footage', 'Judgement'],
   'Thesis: largely true: Amy records nothing itself and constructs everything through selection.', marks=20, traps=TD),
 Q('d-presence', 'db', '5', 'B', 'B3.1.2', 'How far',
   'How far is the filmmaker’s presence visible in your chosen documentary? Refer to at least one filmmaker’s theory.',
   'Visible (Broomfield, Moore) vs invisible (Longinotto) presence.',
   ['Kapadia never appears', 'Presence felt through editing and juxtaposition', 'Contrast with Broomfield’s Whitney', 'Moore’s polemic vs Amy’s implied blame', 'Judgement'],
   'Thesis: invisible on screen but highly visible in the edit.', marks=20, traps=TD),
 Q('m1-ga', 'gm1', '1', 'A', 'A1.1.2', 'Explore',
   'With close reference to the two films you have studied, explore how their contexts are reflected in their film form.',
   'Contexts (Franco’s Spain; Rio favelas) through form.', ['Fascist brutality and the bottle murder', 'State neglect and the apartment', 'Practical effects; non-professional casting', 'Colour', 'Judgement'],
   'Thesis: both films build their political context into their style.', traps=TG),
 Q('m1-db', 'dm1', '2', 'B', 'B1.4.1', 'How far',
   'How far does a filmmaker’s theory help to explain the representation of the subject in your chosen documentary?',
   'Representation of Amy through a chosen theory.', ['Longinotto and identification', 'Watkins and media spectacle', 'Selective portrait', 'Judgement'],
   'Thesis: Longinotto explains the sympathy; Watkins explains the critique of media.', marks=20, traps=TD),
 Q('m2-ga', 'gm2', '1', 'A', 'A3.1.1', 'Explore',
   'With close reference to the two films you have studied, explore how they create meaning through the representation of childhood.',
   'Children in violent worlds.', ['Ofelia’s disobedience', 'The Runts', 'Observer children: Ofelia and Rocket', 'Form in key scenes', 'Judgement'],
   'Thesis: both use children to measure the cruelty of adult systems.', traps=TG),
 Q('m2-db', 'dm2', '2', 'B', 'B2.1.3', 'How far',
   'How far has digital editing shaped the meaning of your chosen documentary?',
   'Non-linear editing and meaning.', ['Juxtaposition and blame', 'Paparazzi rhythm', 'Reframing footage', 'Counter-arguments', 'Judgement'],
   'Thesis: editing is where Amy’s meaning is made.', marks=20, traps=TD),
 Q('s3-ga', 'gp3', '1', 'A', 'A2.4.2', 'Explore',
   'With close reference to the two films you have studied, explore how mise-en-scène and cinematography contribute to their aesthetics.',
   'Aesthetics through two elements.', ['Gothic design', 'Kinetic handheld', 'Colour grading', 'Critical views'], 'Thesis: two distinct aesthetics, both political.', traps=TG),
 Q('s3-db', 'dp3', '2', 'B', 'B3.1.1', 'How far',
   'Apply Peter Watkins’ idea of the “monoform” to your chosen documentary. How far does this increase your understanding of the film?',
   'Watkins applied critically to Amy.', ['Monoform defined', 'Amy critiques tabloid media', 'Amy’s own fast, emotive style', 'Judgement'],
   'Thesis: useful, because Amy both attacks and uses the monoform.', marks=20, traps=TD),
 Q('s4-ga', 'gp4', '1', 'A', 'A2.3.2', 'Explore',
   'With close reference to the two films you have studied, explore how editing and sound shape spectator response.',
   'Editing and sound as cues.', ['Lullaby and sweetened sound', 'Voiceover and freeze-frames', 'Pace and shock', 'Judgement'], 'Thesis: both films guide response through rhythm and sound.', traps=TG),
 Q('s4-db', 'dp4', '2', 'B', 'B2.1.2', 'How far',
   'How far has digital archive footage affected the way the spectator responds to your chosen documentary?',
   'Digital footage and response.', ['Intimacy of home video', 'Invasive paparazzi images', 'Spectator complicity', 'Judgement'],
   'Thesis: very far: the footage’s source shapes each response.', marks=20, traps=TD),
]

u2 = {
 'papers': [
  {'id': 'c2m1', 'title': 'Component 2 Mock Paper 1 (Sections A and B)', 'minutes': 90, 'scenarios': ['gm1', 'dm1']},
  {'id': 'c2m2', 'title': 'Component 2 Mock Paper 2 (Sections A and B)', 'minutes': 90, 'scenarios': ['gm2', 'dm2']},
  {'id': 'c2p3', 'title': 'Paper 3', 'minutes': 90, 'scenarios': ['gp3', 'dp3'], 'sealed': True},
  {'id': 'c2p4', 'title': 'Paper 4', 'minutes': 90, 'scenarios': ['gp4', 'dp4'], 'sealed': True},
 ],
 'scenarios': [
  {'id': 'ga', 'number': 1, 'title': 'Section A practice: Global film', 'stem': GA},
  {'id': 'db', 'number': 2, 'title': 'Section B practice: Documentary', 'stem': DB},
  {'id': 'gm1', 'number': 1, 'title': 'Section A', 'stem': GA}, {'id': 'dm1', 'number': 2, 'title': 'Section B', 'stem': DB},
  {'id': 'gm2', 'number': 1, 'title': 'Section A', 'stem': GA}, {'id': 'dm2', 'number': 2, 'title': 'Section B', 'stem': DB},
  {'id': 'gp3', 'number': 1, 'title': 'Section A', 'stem': GA, 'total': 40}, {'id': 'dp3', 'number': 2, 'title': 'Section B', 'stem': DB, 'total': 20},
  {'id': 'gp4', 'number': 1, 'title': 'Section A', 'stem': GA, 'total': 40}, {'id': 'dp4', 'number': 2, 'title': 'Section B', 'stem': DB, 'total': 20},
 ],
 'questions': u2_q,
}

for folder, data in (('unit1', u1), ('unit2', u2)):
    with open(os.path.join(HERE, 'data', folder, 'questions.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(folder, len(data['questions']), 'questions')
