#!/usr/bin/env python3
"""Writes data/unit1/flashcards.json and data/unit2/flashcards.json.
Hand-written recall cards live here as (section, code, front, back) rows.
build_inline.py also adds one card per notes item automatically, so this
file only needs the facts, quotes and names worth drilling on their own.
Run:  python tools/make_flashcards.py   then   python build_inline.py"""
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

U1 = [
 # --- Casablanca ---
 ('A','A1.1.1','Casablanca: director, studio, year?','Michael Curtiz, Warner Bros., 1942 (Classical Hollywood).'),
 ('A','A1.1.5','Who produced Casablanca?','Hal B. Wallis, Warner Bros. head of production.'),
 ('A','A1.1.5','Who wrote Casablanca, and from what source?','Julius and Philip Epstein and Howard Koch, from the unproduced play “Everybody Comes to Rick’s”.'),
 ('A','A1.1.2','When is Casablanca set, and why does it matter?','December 1941, around Pearl Harbor: America is about to enter the war, like Rick.'),
 ('A','A1.1.2','What does Renault throw in the bin at the end?','A bottle of Vichy water: France rejecting collaboration.'),
 ('A','A1.1.3','Rick’s isolationist line?','“I stick my neck out for nobody.”'),
 ('A','A1.3.7','Rick’s line that puts the cause above love?','“The problems of three little people don’t amount to a hill of beans in this crazy world.”'),
 ('A','A1.3.7','Last line of Casablanca?','“Louis, I think this is the beginning of a beautiful friendship.”'),
 ('A','A1.1.6','How does Casablanca imply Rick and Ilsa sleep together?','A dissolve to the airport searchlight tower, then Rick smoking: a Production Code ellipsis.'),
 ('A','A1.2.1','Who shot Casablanca and in what lighting style?','Arthur Edeson: low-key chiaroscuro, shadows like bars.'),
 ('A','A1.2.5','Who composed Casablanca’s score?','Max Steiner, using “As Time Goes By” and “La Marseillaise” as leitmotifs.'),
 ('A','A1.3.5','What happens in the duel of the anthems?','Laszlo has the band play “La Marseillaise” to drown out Nazis singing “Die Wacht am Rhein”.'),
 ('A','A1.3.5','Renault’s hypocritical line when closing the café?','“I’m shocked, shocked to find that gambling is going on in here!”'),
 ('A','A1.1.7','Casablanca’s Oscars?','Best Picture, Best Director and Best Screenplay.'),
 ('A','A1.1.7','Umberto Eco on Casablanca?','“Two clichés make us laugh. A hundred clichés move us.”'),
 ('A','A1.5.2','Who wrote The Genius of the System and what does it argue?','Thomas Schatz (1988): studio films were authored by the whole system, not just directors.'),
 ('A','A1.3.2','How is Rick introduced?','By his hand signing a cheque, then his chess board, then a tilt up to his face.'),
 ('A','A1.4.2','Ilsa’s line that gives Rick her choice?','“You’ll have to think for both of us, for all of us.”'),
 # --- Bonnie and Clyde ---
 ('A','A2.1.1','Bonnie and Clyde: director, year, star-producer?','Arthur Penn, 1967; Warren Beatty produced and starred.'),
 ('A','A2.1.6','Who wrote Bonnie and Clyde and what influenced them?','David Newman and Robert Benton, inspired by the French New Wave (offered to Truffaut and Godard).'),
 ('A','A2.2.2','Who edited Bonnie and Clyde?','Dede Allen: elliptical cutting, jump cuts, the slow-motion ending.'),
 ('A','A2.2.1','Who shot Bonnie and Clyde?','Burnett Guffey, who won the Oscar for Best Cinematography.'),
 ('A','A2.1.7','Bonnie and Clyde’s two Oscars?','Estelle Parsons (Supporting Actress) and Burnett Guffey (Cinematography).'),
 ('A','A2.2.3','What music plays over the getaways?','Flatt and Scruggs’ bluegrass “Foggy Mountain Breakdown”.'),
 ('A','A2.1.7','Which critic attacked Bonnie and Clyde, and who defended it?','Bosley Crowther (New York Times) attacked it; Pauline Kael defended it.'),
 ('A','A2.1.5','What replaced the Production Code, and when?','The MPAA age-ratings system, in November 1968.'),
 ('A','A2.3.3','Clyde’s line to the evicted farmer?','“We rob banks.”'),
 ('A','A2.3.4','What do the gang watch in the cinema after the first killing?','“We’re in the Money” from Gold Diggers of 1933: Depression escapism.'),
 ('A','A2.3.7','How is the ending shot and cut?','Multi-camera slow motion mixed with fast cuts, no music, then a sudden cut to black.'),
 ('A','A2.2.4','Who designed Bonnie’s costumes?','Theadora Van Runkle: the beret and midi skirts started a fashion craze.'),
 ('A','A2.1.4','Which 1948 ruling began the end of the studio system?','The Paramount Decree, which broke up studio ownership of cinemas.'),
 ('A','A2.5.1','Other Arthur Penn films?','The Left Handed Gun (1958), The Miracle Worker (1962), Little Big Man (1970).'),
 # --- auteur theory ---
 ('A','A3.2.1','Who launched la politique des auteurs, where and when?','François Truffaut, Cahiers du Cinéma, 1954 (“A Certain Tendency of French Cinema”).'),
 ('A','A3.2.2','Sarris’s three circles?','Technical competence, distinguishable personality (style) and interior meaning.'),
 ('A','A3.2.3','Kael’s attack on auteur theory?','“Circles and Squares” (1963): filmmaking is collaborative.'),
 ('A','A3.2.4','Barthes’ challenge to authorship?','“The Death of the Author” (1967): meaning is made by the reader.'),
 # --- Joker ---
 ('B','B1.1.1','Joker: director, year, studio?','Todd Phillips, 2019, Warner Bros./DC (the mainstream film).'),
 ('B','B1.1.3','Which films does Joker pay homage to?','Scorsese’s Taxi Driver (1976) and The King of Comedy (1982).'),
 ('B','B1.2.2','Who composed Joker’s score?','Hildur Guðnadóttir: a mournful solo cello. She won the Oscar.'),
 ('B','B1.2.1','Who shot Joker?','Lawrence Sher.'),
 ('B','B1.1.4','Joker’s major awards?','Venice Golden Lion; Oscars for Phoenix (Best Actor) and Guðnadóttir (Score).'),
 ('B','B1.3.3','What does the Sophie reveal show?','Their romance was imagined: an unreliable narrator.'),
 ('B','B1.3.2','Who does Arthur kill on the subway?','Three drunk Wall Street men who harass and beat him.'),
 ('B','B1.3.5','Who plays Murray Franklin, and why does it matter?','Robert De Niro, star of Taxi Driver and The King of Comedy.'),
 ('B','B1.1.2','Line showing welfare cuts in Joker?','His social worker: “They don’t give a shit about people like you, Arthur.”'),
 ('B','B1.4.3','A viewing-conditions fact about Joker?','Fears of copycat violence led to extra security at US screenings.'),
 # --- Get Out ---
 ('B','B2.1.1','Get Out: director, year, producer?','Jordan Peele, 2017, Blumhouse (the independent film).'),
 ('B','B2.1.3','Get Out’s budget and box office?','About $4.5 million budget; about $255 million worldwide.'),
 ('B','B2.1.3','Get Out’s Oscar win?','Best Original Screenplay for Jordan Peele.'),
 ('B','B2.1.1','Dean Armitage’s liberal line?','“I would have voted for Obama a third time if I could.”'),
 ('B','B2.3.2','What triggers Chris’s hypnosis?','Missy stirring a spoon in a teacup.'),
 ('B','B2.3.2','What does the Sunken Place represent?','Black silencing and marginalisation: watching your life, unable to act.'),
 ('B','B2.3.1','Song in the opening abduction?','“Run Rabbit Run”.'),
 ('B','B2.2.3','Swahili phrase in the score and its meaning?','“Sikiliza Kwa Wahenga”: listen to (your) ancestors.'),
 ('B','B2.3.3','What does the bingo auction evoke?','A slave auction: the Black body as commodity.'),
 ('B','B2.3.5','Why does the police car at the end matter?','It plays on the audience’s knowledge of racist policing; it turns out to be Rod.'),
 ('B','B2.2.2','How does Chris free himself in the basement?','Plugging his ears with cotton from the chair: “picking cotton” to escape.'),
 # --- spectatorship / ideology theory ---
 ('B','B3.1.3','Hall’s four readings?','Preferred, negotiated, oppositional and aberrant.'),
 ('B','B3.1.4','Murray Smith’s structure of sympathy?','Recognition, alignment and allegiance.'),
 ('B','B3.1.5','Mulvey’s essay and year?','“Visual Pleasure and Narrative Cinema” (1975): the male gaze.'),
 ('B','B3.1.6','bell hooks’ concept?','The oppositional gaze: Black spectators looking back critically.'),
 ('B','B3.1.7','The six spectator cues in the spec?','Narrative, visual, musical, performance, genre and auteur cues.'),
 ('B','B3.2.2','Gramsci’s hegemony in one line?','How ruling-class values come to seem natural and common sense.'),
 # --- Trainspotting ---
 ('C','C1.1.1','Trainspotting: director, year, source?','Danny Boyle, 1996, from Irvine Welsh’s novel.'),
 ('C','C1.1.4','Trainspotting’s writer, producer and funder?','John Hodge, Andrew Macdonald, Channel 4 Films.'),
 ('C','C1.2.1','Who shot Trainspotting?','Brian Tufano.'),
 ('C','C1.2.3','Three songs and their scenes?','“Lust for Life” (opening chase), “Perfect Day” (overdose), “Born Slippy” (ending).'),
 ('C','C1.3.6','Renton’s final promise?','“I’m going to be just like you”: the job, the family, the big television.'),
 ('C','C1.3.5','Renton’s Highlands rant?','“It’s shite being Scottish!”'),
 ('C','C1.4.3','Who embodies toxic masculinity in Trainspotting?','Begbie (Robert Carlyle).'),
 ('C','C1.3.6','Who does Renton leave money for?','Spud.'),
 ('C','C1.1.2','What happens to Tommy?','He starts using after Allison leaves him, contracts HIV and dies.'),
 # --- Shaun ---
 ('C','C2.1.1','Shaun of the Dead: director, year, co-writer?','Edgar Wright, 2004, co-written with Simon Pegg.'),
 ('C','C2.1.3','Which TV sitcom did Shaun grow out of?','Spaced (Channel 4).'),
 ('C','C2.1.3','Whose films does Shaun pay homage to?','George A. Romero’s, especially Dawn of the Dead (1978).'),
 ('C','C2.3.4','Song during the Winchester fight?','Queen’s “Don’t Stop Me Now”, on the jukebox.'),
 ('C','C2.3.1','What do the two walks to the shop prove?','Routine already made Shaun a zombie: the apocalypse changes nothing.'),
 ('C','C2.3.5','What does the ending montage show?','Zombies used as cheap labour and TV entertainment; Ed in the shed.'),
 ('C','C2.2.4','Very English weapons used in Shaun?','A cricket bat, a spade and vinyl records.'),
 ('C','C2.1.4','Shaun’s production company?','Working Title (with StudioCanal and Universal).'),
 # --- narrative theory ---
 ('C','C3.1.1','Fabula and syuzhet?','Story (events in time order) and plot (how the film presents them).'),
 ('C','C3.1.2','Todorov’s stages?','Equilibrium, disruption, recognition, repair, new equilibrium.'),
 ('C','C3.1.3','Lévi-Strauss’s narrative idea?','Binary oppositions structure meaning.'),
 ('C','C3.1.4','Five of Propp’s character functions?','Hero, villain, donor, helper, princess (also dispatcher, false hero).'),
 ('C','C3.1.6','Steve Neale on genre?','Genres work through repetition and difference.'),
 # --- toolkit ---
 ('K','K1.4.2','Parallel vs contrapuntal sound?','Parallel matches the image’s mood; contrapuntal contrasts with it.'),
 ('K','K1.3.2','The Kuleshov effect?','The same shot of a face reads differently depending on the shot beside it.'),
 ('K','K1.1.6','Three-point lighting?','Key light, fill light and backlight.'),
 ('K','K1.3.1','Four continuity editing rules?','Shot/reverse shot, eyeline match, match on action, the 180° rule.'),
 ('K','K4.1.1','How is a 40-mark answer split?','20 marks AO1 (knowledge), 20 marks AO2 (application), across five bands.'),
 ('K','K4.1.1','What if you only write about one film in a two-film question?','The mark for the band is halved.'),
 ('K','K4.1.5','Component 1 timing?','2h30 for three 40-mark essays: about 50 minutes each, with 5 minutes planning.'),
 ('K','K4.1.2','What does “How far” require?','A judgement, argued throughout and stated in the conclusion.'),
]

U2 = [
 # --- Pan's Labyrinth ---
 ('A','A1.1.1','Pan’s Labyrinth: director, year, country?','Guillermo del Toro, 2006, Spain/Mexico co-production.'),
 ('A','A1.1.2','When and where is Pan’s Labyrinth set?','1944, northern Spain, five years after the Civil War, as Franco’s forces hunt guerrillas.'),
 ('A','A1.2.1','Who shot Pan’s Labyrinth?','Guillermo Navarro, who won the Oscar for Best Cinematography.'),
 ('A','A1.1.4','Pan’s Labyrinth’s three Oscars?','Cinematography, Art Direction and Makeup.'),
 ('A','A1.1.4','Budget and gross of Pan’s Labyrinth?','About $19 million budget; about $83 million worldwide.'),
 ('A','A1.2.4','Who composed the lullaby score?','Javier Navarrete.'),
 ('A','A1.1.5','Who plays the Faun and the Pale Man?','Doug Jones, in prosthetics.'),
 ('A','A1.3.4','What does the pile of shoes in the Pale Man’s lair evoke?','The Holocaust: victims of a devouring elite.'),
 ('A','A1.3.2','What does Vidal’s watch symbolise?','Order, control and his dead father’s macho legacy.'),
 ('A','A1.3.5','What does Mercedes tell Vidal before he dies?','His son will not even know his name.'),
 ('A','A1.3.5','What blooms at the end?','A flower on a dead branch: imagination and innocence survive.'),
 ('A','A1.4.1','Vidal’s line dismissing women?','“She is just a woman.”'),
 ('A','A1.4.2','Del Toro’s companion piece?','The Devil’s Backbone (2001), also set in the Spanish Civil War.'),
 ('A','A1.2.1','Pan’s Labyrinth colour scheme?','Cold blue-grey for the fascist reality; warm amber-gold for the fantasy.'),
 ('A','A1.3.3','Three techniques in the bottle murder?','Low-key lighting, no musical build-up, exaggerated (sweetened) sound.'),
 # --- City of God ---
 ('A','A2.1.1','City of God: directors, year, country?','Fernando Meirelles and Kátia Lund, 2002, Brazil.'),
 ('A','A2.1.2','What is City of God based on?','Paulo Lins’ novel about the real Cidade de Deus housing project.'),
 ('A','A2.2.1','Who shot City of God?','César Charlone.'),
 ('A','A2.2.2','Who edited City of God?','Daniel Rezende.'),
 ('A','A2.1.4','How many Oscar nominations did City of God receive?','Four, including Best Director and Best Cinematography.'),
 ('A','A2.1.3','Bentes’ critique of City of God?','A “cosmetics of hunger”: poverty made slick and glossy.'),
 ('A','A2.1.3','Glauber Rocha’s Cinema Novo manifesto?','“An Aesthetic of Hunger” (1965).'),
 ('A','A2.2.3','Rocket’s line about the favela trap?','“If you run, the beast gets you; if you stay, the beast eats you.”'),
 ('A','A2.3.1','Three techniques in the chicken chase?','Handheld camera, rapid editing, a 360° spin back in time.'),
 ('A','A2.3.2','What does the Story of the Apartment show?','The cycle: the flat stays, the dealers keep dying and being replaced.'),
 ('A','A2.3.5','Which photo does Rocket choose to publish?','The dead Li’l Zé, not the corrupt police: his career over the truth.'),
 ('A','A2.2.1','How does City of God’s colour change over time?','Warm golden 1960s; colder, darker 1980s.'),
 # --- Amy ---
 ('B','B1.1.3','Amy: director, producer, year?','Asif Kapadia, produced by James Gay-Rees, 2015.'),
 ('B','B1.1.3','Amy’s major awards?','Oscar and BAFTA for Best Documentary; also a Grammy for Best Music Film.'),
 ('B','B1.1.4','Kapadia’s earlier archive documentary?','Senna (2010), about the F1 driver Ayrton Senna.'),
 ('B','B1.1.4','How were Amy’s interviews used?','Audio only, laid over archive footage: no talking heads.'),
 ('B','B1.2.4','Who edited Amy and who composed its score?','Chris King (editor), Antonio Pinto (score).'),
 ('B','B1.1.5','Who objected to Amy and why?','Mitch Winehouse: he said it was misleading about him.'),
 ('B','B1.2.3','What distinctive text appears on screen?','Amy’s handwritten lyrics as she sings.'),
 ('B','B1.3.5','Which duet does Amy record with Tony Bennett?','“Body and Soul”.'),
 ('B','B1.3.6','Where is Amy booed in 2011?','Belgrade, weeks before her death.'),
 ('B','B1.1.2','When and how did Amy Winehouse die?','July 2011, aged 27, from alcohol poisoning.'),
 ('B','B2.1.2','Why is Amy a digital-era documentary?','Its footage comes from camcorders, phones and digital press cameras.'),
 ('B','B2.1.5','Counter-argument in the digital debate?','Compilation documentary and rise-and-fall structure existed long before digital.'),
 ('B','B3.1.1','Watkins’ key term?','The “monoform”: mainstream media’s fast, fragmented, single-voice style.'),
 ('B','B3.1.1','Two Peter Watkins films?','Culloden (1964) and The War Game (1965).'),
 ('B','B3.1.2','Two Broomfield films?','Kurt and Courtney (1998); Whitney: Can I Be Me (2017).'),
 ('B','B3.1.3','Longinotto’s style in one line?','Invisible filmmaker, no voiceover or captions, fiction-like identification, no conclusions.'),
 ('B','B3.1.4','Two Michael Moore films?','Bowling for Columbine (2002) and Fahrenheit 9/11 (2004).'),
 ('B','B4.1.1','Grierson’s definition of documentary?','“The creative treatment of actuality.”'),
 ('B','B4.1.2','Nichols’ six documentary modes?','Poetic, expository, observational, participatory, reflexive, performative.'),
 # --- toolkit ---
 ('K','K1.4.1','Diegetic vs non-diegetic?','Diegetic exists in the story world; non-diegetic is heard only by the audience.'),
 ('K','K1.1.4','Deep vs shallow focus?','Deep keeps all planes sharp; shallow isolates one plane.'),
 ('K','K4.1.5','Component 2 timing?','2h30: Global (40) about 60 min; each 20-mark section about 30 min.'),
 ('K','K4.1.1','How is a 20-mark answer split?','10 marks AO1 and 10 marks AO2, across five bands.'),
]


def write(folder, rows, prefix):
    cards = []
    counts = {}
    for sec, code, front, back in rows:
        counts[sec] = counts.get(sec, 0) + 1
        cards.append({'id': '%s%s%d' % (prefix, sec.lower(), counts[sec]), 'section': sec,
                      'code': code, 'front': front, 'back': back})
    path = os.path.join(HERE, 'data', folder, 'flashcards.json')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'cards': cards}, f, ensure_ascii=False, indent=2)
    print(folder, len(cards), 'hand-written cards')


write('unit1', U1, 'h')
write('unit2', U2, 'h')
