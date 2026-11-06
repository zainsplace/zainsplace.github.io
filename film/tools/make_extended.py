#!/usr/bin/env python3
"""Writes data/unit1/extended.json and data/unit2/extended.json.

Extended writing here is timed paragraph practice, aimed at the three habits
that cap marks (no film form, not answering the question, using "I"): write a
thesis introduction plus ONE top-band paragraph in 15 minutes, then compare
with the model. Full essays are practised on the Questions page.
Run:  python tools/make_extended.py   then   python build_inline.py"""
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STRUCT = ['Intro (3–4 lines): answer the command words with a clear judgement; name both films and the lens. No plot summary.',
          'Paragraph point: one claim that answers the focus of the question.',
          'Evidence: one specific scene, with at least two named techniques.',
          'Explain: what the techniques mean and how they position the spectator, linked to the lens (context / auteur / ideology / spectatorship / narrative).',
          'Link: back to “how far / how useful” and, where relevant, across to the other film.']
TIPS = ['No “I”: write “the spectator is positioned…”.',
        'Name the technique precisely (low-key lighting, contrapuntal sound, freeze-frame).',
        'One evaluative sentence per paragraph earns AO2.']
MS40 = ['**Band 5 (33–40):** excellent knowledge and terminology; sophisticated, sustained argument with a clear judgement.',
        '**Band 4 (25–32):** good knowledge; detailed analysis with a developed judgement.',
        '**Band 3 (17–24):** satisfactory knowledge; reasonably coherent analysis; some judgement.',
        '**Band 2 (9–16):** basic knowledge; partial analysis; little sense of “how far”.',
        '**Band 1 (1–8):** limited knowledge and terminology; little relevant analysis.']
MS20 = [m.replace('33–40', '17–20').replace('25–32', '13–16').replace('17–24', '9–12').replace('9–16', '5–8').replace('1–8', '1–4') for m in MS40]


def E(eid, section, title, question, model, marks=40, tips=None):
    return {'id': eid, 'title': title, 'marks': marks, 'time': 900, 'section': section,
            'command': question.split(' ')[0], 'question': question + ' Write the introduction and ONE full paragraph.',
            'structure': STRUCT, 'tips': (tips or []) + TIPS,
            'markScheme': MS40 if marks == 40 else MS20, 'modelAnswer': model}


U1 = [
 E('ext-a-auteur', 'A', 'Auteur signatures: intro + Penn paragraph',
   'Compare how far your chosen films reflect the auteur signature features of their filmmakers.',
   'Bonnie and Clyde reflects its director’s signature to a far greater extent than Casablanca. Penn worked as the studio system collapsed and could shape theme as well as style, whereas Curtiz, a Warner contract director, left a visual signature on a film largely authored by Hal Wallis’s studio team.\n\n'
   'Penn’s thematic signature, the sympathetic outsider destroyed by a violent society, is clearest in the final ambush. Rapid cutting between Bonnie’s and Clyde’s faces gives way to multi-camera slow motion as their bodies jerk under gunfire, and the abrupt cut to black denies the spectator any restored order. As in The Left Handed Gun, the outlaws become martyrs of an establishment that answers rebellion with overwhelming force. Yet this signature was realised by collaborators: Dede Allen’s editing creates the rhythm of the massacre and Beatty, as producer, protected the film from Warner Bros. So the ending reflects Penn’s signature to a significant extent, but as an orchestrator of a team rather than a sole author, whereas Casablanca’s airport finale shows the opposite balance: Curtiz’s fog and backlighting, but Wallis’s and the writers’ resolution.'),
 E('ext-a-context', 'A', 'Production context: intro + censorship paragraph',
   'Compare how far your chosen films reflect their different production contexts.',
   'Both films reflect their production contexts to a significant extent, but Casablanca is shaped by its institution, while Bonnie and Clyde helped to reshape its own.\n\n'
   'Censorship shows this most clearly. In Casablanca, the Production Code made it impossible for a married woman to leave her husband for her lover, so when Ilsa confesses her love the scene dissolves to the airport searchlight tower and then to Rick smoking at the window: an ellipsis that implies sex without showing it. By contrast, Bonnie and Clyde, made as the Code was collapsing, opens with an extreme close-up of Bonnie’s lips and her naked body behind the bed rails, and later shows a bank clerk shot in the face through glass. Where Casablanca’s form works around censorship, Bonnie and Clyde’s form exposes what the Code hid, and its success helped bring the 1968 ratings system. Production context therefore explains not only what each film shows but how it shows it.'),
 E('ext-a-ending', 'A', 'Endings and values: intro + comparison paragraph',
   'Compare how far the endings of your chosen films reflect the values of their time.',
   'Both endings reflect the values of their time to a great extent: Casablanca resolves private desire into wartime duty, whereas Bonnie and Clyde ends with the state destroying its young rebels.\n\n'
   'In Casablanca, Rick sends Ilsa away with Laszlo in a studio fog lit with hard backlight, and Steiner’s “La Marseillaise” swells as he walks off with Renault towards “a beautiful friendship”: complete classical closure in which the individual is reintegrated into the collective cause of 1942. Bonnie and Clyde refuses that closure. Birds scatter, the lovers exchange a look in rapid close-ups, and slow-motion gunfire is followed by silence and a cut to black. For a 1967 audience watching Vietnam on television, the ending reads as the establishment’s violence against the counterculture. The contrast is not just of story but of form, as continuity and score give way to elliptical editing and silence.'),
 E('ext-b-passive', 'B', 'Passive and active: intro + Joker paragraph',
   'How far do your chosen films demonstrate a constant shift between passive and active spectatorship?',
   'Both films shift the spectator between passive and active positions to a significant extent, but Joker does so to make sympathy uncomfortable, whereas Get Out does so to sharpen the spectator’s suspicion of “liberal” whiteness.\n\n'
   'Joker’s subway murders show this shift within a single sequence. Low-key, flickering light and claustrophobic framing lock the spectator into the carriage with Arthur as three Wall Street men beat him, and Hildur Guðnadóttir’s cello swells afterwards as he dances, inviting passive identification and even relief. Yet the third shooting becomes an execution, and Murray Smith’s distinction between alignment and allegiance explains the shift: the spectator remains aligned with Arthur’s point of view while allegiance is withdrawn. The later Sophie reveal pushes this further, as editing replays earlier scenes without her and forces an active re-reading of everything. The shift is therefore constant to a large extent, because the film keeps rewarding and then punishing sympathy.'),
 E('ext-b-cues', 'B', 'Visual and soundtrack cues: intro + Get Out paragraph',
   'How far do your chosen films demonstrate the importance of visual and soundtrack cues in influencing spectator response?',
   'Visual and soundtrack cues are central to spectator response in both films, though their effect depends on what different spectators bring to them.\n\n'
   'In Get Out’s hypnosis sequence, the chime of Missy’s spoon against the teacup becomes a sound cue that triggers both Chris’s paralysis and the spectator’s dread. As he sinks into the Sunken Place, subjective camera and slow falling motion show him watching the world through a distant screen while the sound becomes muffled, so the spectator shares his powerlessness through form. Peele has described the Sunken Place as a metaphor for the marginalisation of Black people, and Black spectators may recognise this immediately, an example of hooks’ oppositional gaze. The cues are therefore highly important, but their meaning is completed by the spectator’s identity and context.'),
 E('ext-b-ideology', 'B', 'Ideology and response: intro + comparison paragraph',
   'How far is the spectator’s response to your chosen films shaped by their ideology?',
   'Ideology shapes response strongly in Get Out, whose critique of liberal racism is precise, but more ambiguously in Joker, whose class politics divide spectators.\n\n'
   'Get Out’s garden party turns ideology into image: white guests inspect Chris’s body and praise his physique, and the later silent bingo-card auction, intercut so the spectator understands before Chris, evokes a slave auction. Dramatic irony positions the spectator against the Armitages’ smiling liberalism. Joker’s Murray Franklin sequence is less certain. Cross-cutting between the studio murder and the burning streets presents violence as the product of class neglect, yet the triumphant framing of Arthur on the car bonnet allows a preferred reading of sympathy and an oppositional reading of alarm (Hall). Ideology therefore shapes response in both, but Joker’s ambiguity is itself the reason its spectators respond so differently.'),
 E('ext-c-resolution', 'C', 'Narrative resolution: intro + Trainspotting paragraph',
   'How useful has an ideological critical approach been in understanding the narrative resolution of your chosen films?',
   'An ideological approach is highly useful for both resolutions, because each ending shows consumer capitalism absorbing rebellion, although comedy and irony limit any single reading.\n\n'
   'Trainspotting’s resolution inverts its opening. Renton steals the drug money while his friends sleep and walks towards the camera as “Born Slippy” builds, while his voiceover promises to be “just like you: the job, the family, the big television”. The bookended “Choose Life” monologue, once a rejection of consumer conformity, now becomes its acceptance, so the narrative rewards Thatcherite individualism over collective loyalty. An ideological reading explains why the ending feels both a betrayal and a triumph. However, Renton leaves money for Spud and his tone is ironic, so the approach is very useful but not sufficient alone.'),
 E('ext-c-binary', 'C', 'Binary oppositions: intro + Shaun paragraph',
   'How useful has an ideological critical approach been in understanding binary oppositions in the narratives of your chosen films?',
   'An ideological approach is very useful because, in both films, the central binary oppositions turn out to be false: heroin and consumerism, the living and the undead.\n\n'
   'Shaun of the Dead sets up the opposition of living and undead only to collapse it. Shaun’s two walks to the corner shop are filmed as matching long handheld tracking shots along the same route; the second time zombies and blood fill the street and he notices nothing. Lévi-Strauss’s alive/dead binary seems to structure the genre narrative, but a Marxist reading shows the film’s real point: alienating routine has already made Shaun one of the living dead. The ending confirms this when zombies are absorbed as supermarket labour and daytime-TV entertainment, so ideology explains why the opposition dissolves.'),
 E('ext-c-masc', 'C', 'Masculinity: intro + comparison paragraph',
   'How useful has an ideological critical approach been in understanding the representation of masculinity in your chosen films?',
   'An ideological approach is very useful for both films, which present British masculinity in crisis after deindustrialisation, though they offer opposite resolutions.\n\n'
   'Begbie’s pub brawl shows Trainspotting’s toxic masculinity: he throws a pint glass over a balcony, injures a woman, and starts a brawl to cover his own action, filmed in chaotic close-ups that make his violence absurd as well as frightening. Shaun of the Dead instead presents men as man-children, and Shaun’s arc ends not in toughness but in care, when he must shoot his infected mother in a quiet, held close-up that suspends the comedy. A feminist reading explains both: one film shows masculinity turning destructive, the other shows it growing up. The approach is therefore very useful, though it pays less attention to the films’ genre pleasures.'),
]

U2 = [
 E('ext-g-mes', 'A', 'Mise-en-scène: intro + Pan’s Labyrinth paragraph',
   'With close reference to the two films you have studied, explore how mise-en-scène creates meaning.',
   'In both films mise-en-scène turns setting into argument: in Pan’s Labyrinth the fantasy mirrors fascism, while in City of God the changing favela shows a cycle of violence created by state neglect.\n\n'
   'The Pale Man’s lair is the clearest example in Pan’s Labyrinth. A banquet sits untouched before a motionless, eyeless figure, the walls are painted with murals of him devouring children, and a shallow-focus close-up of a pile of small shoes evokes Holocaust imagery. The design deliberately mirrors Vidal’s earlier dinner for the priest and officials, so the monster becomes an image of a Church and state that gorge themselves while crushing the innocent. When Ofelia disobeys and eats two grapes, the mise-en-scène aligns her disobedience with the rebels’ resistance, proving that the fantasy is political rather than escapist.'),
 E('ext-g-edit', 'A', 'Editing: intro + City of God paragraph',
   'With close reference to the two films you have studied, explore how editing creates meaning.',
   'Editing creates the structure of meaning in both films: cycles of violence in City of God and mirrored worlds in Pan’s Labyrinth.\n\n'
   'City of God’s “Story of the Apartment” shows editing as argument. From a fixed camera position, a series of dissolves shows dealers appear, vanish and return as the walls change colour and the light darkens over the years. The static frame, unusual in so restless a film, makes the spectator a detached observer like Rocket, while the dissolves compress time so that the location stays the same as the young dealers are replaced. Editing therefore delivers the film’s thesis that favela violence is systemic and cyclical, not the fault of individuals alone.'),
 E('ext-g-aesth', 'A', 'Aesthetics: intro + critical-view paragraph',
   'With close reference to the two films you have studied, explore how far their aesthetic qualities contribute to their meaning.',
   'Aesthetics carry meaning in both films, though City of God’s glossy energy risks glamorising the violence it condemns.\n\n'
   'City of God’s opening chicken chase establishes its aesthetic: frantic handheld camera, saturated sunlight, flash-cuts of a knife on stone and pounding percussion, ending in a 360° spin that carries Rocket back in time. The style makes the favela thrilling, which is the point: the spectator feels the seductive pull of gang life. Yet Ivana Bentes called this a “cosmetics of hunger”, poverty made slick. The aesthetic contributes to meaning to a great extent, then, but that meaning is contested.'),
 E('ext-d-theory', 'B', 'Filmmaker’s theory: intro + Longinotto paragraph',
   'Apply one filmmaker’s theory of documentary film you have studied to your chosen documentary. How far does this increase your understanding?',
   'Kim Longinotto’s theory increases understanding of Amy to a large extent, because Kapadia shares her invisibility and her aim of fiction-like identification, although Amy’s editing reaches conclusions Longinotto would avoid.\n\n'
   'Longinotto stays invisible, avoids voiceover and captions, and wants viewers to “jump into someone else’s experience”. Amy follows this closely: Kapadia never appears, and interviewees are heard only as audio over footage of Amy, so the screen stays with her from the opening camcorder video of a teenager singing “Happy Birthday”. The handwritten lyrics that appear as she sings make her seem the author of her story. However, Antonio Pinto’s score and the juxtaposition of “Rehab” with Mitch’s interview imply blame, a conclusion Longinotto would refuse.', marks=20),
 E('ext-d-digital', 'B', 'Digital debate: intro + footage paragraph',
   'How far has digital technology had an impact on your chosen documentary?',
   'Digital technology has had a very significant impact on Amy, which could not exist without digital recording, although its tragic storytelling is traditional.\n\n'
   'Most of Amy is made from footage that only digital technology made possible: camcorder and phone clips shot by friends, and digital paparazzi images. In the paparazzi sequences, strobing flashes white out the frame and shutter noise fills the soundtrack as Amy tries to get home, so the form makes the spectator feel the surveillance of digital-age celebrity, and implicates the spectator who consumed those images. Counter-argument: archive compilation films existed long before digital.', marks=20),
 E('ext-d-construct', 'B', 'Construction of reality: intro + ending paragraph',
   'How far is it true that your chosen documentary constructs rather than records reality?',
   'This is largely true of Amy: Kapadia shot almost none of its images, so its reality is constructed entirely through selection and arrangement, Grierson’s “creative treatment of actuality”.\n\n'
   'The ending shows this construction. After Amy is booed in Belgrade, the film cuts to overhead press footage of her body being carried from her Camden home, then returns to images of the young Amy. The press footage records a real event, but its placement makes a circular, mournful structure and a final indictment of the media gaze. Meaning is made in the edit, so the documentary constructs reality to a large extent.', marks=20),
]

for folder, data in (('unit1', U1), ('unit2', U2)):
    with open(os.path.join(HERE, 'data', folder, 'extended.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(folder, len(data), 'extended prompts')
