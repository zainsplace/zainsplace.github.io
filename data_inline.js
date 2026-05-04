/* AUTO-GENERATED — edit data/*.json then re-run inline script */

const INLINE_A = {
  "section": "A",
  "title": "IT Systems and Devices",
  "tier": 2,
  "colour": "#3182ce",
  "topics": [
    {
      "code": "A1",
      "title": "Functions and Use of Digital Devices, and Notation",
      "subtopics": [
        {
          "code": "A1.1",
          "title": "Features of Digital Devices",
          "items": [
            {
              "code": "A1.1.1",
              "term": "Personal Computers (PCs)",
              "definition": "General-purpose computing devices designed for individual use. Includes desktop PCs (tower units with separate monitor) and laptops (portable, integrated screen and battery).",
              "examples": "A desktop workstation used by a graphic designer; a laptop used by a student; an all-in-one PC used in a school office.",
              "examTip": "PCs = general purpose, upgradeable, wide software compatibility. Desktop: more powerful, upgradeable, not portable. Laptop: portable, battery-powered, less upgradeable, slightly less powerful per £.",
              "keyFacts": [
                "CPU, RAM, storage, GPU are key performance components",
                "Desktop: more powerful for the price, easily upgraded, not portable",
                "Laptop: portable, battery powered, generally less upgradeable",
                "Running full desktop OS (Windows, macOS, Linux) — broad software compatibility",
                "Used for: office work, development, gaming, content creation, education"
              ]
            },
            {
              "code": "A1.1.2",
              "term": "Multifunctional Devices (MFDs)",
              "definition": "Devices that combine multiple functions into one unit — typically combining a printer, scanner, copier, and sometimes fax into a single device.",
              "examples": "An office printer/scanner/copier; a home all-in-one inkjet printer; a photocopier with email/scan-to-folder functions.",
              "examTip": "MFD = multiple functions in one device. Benefits: saves space, reduces cost of owning separate machines. Limitation: if it breaks, all functions are lost simultaneously.",
              "keyFacts": [
                "Combines printer + scanner + copier (+ fax) in one device",
                "Space saving and cost effective compared to separate devices",
                "Single point of failure: breakdown affects all functions",
                "Common in offices to reduce per-function hardware costs",
                "Modern MFDs often network-connected — send scan to email directly"
              ]
            },
            {
              "code": "A1.1.3",
              "term": "Mobile Devices",
              "definition": "Portable, battery-powered computing devices designed for use on the move — including smartphones, tablets, and smartwatches. Run mobile operating systems and use touchscreen interfaces.",
              "examples": "iPhone (smartphone); iPad (tablet); Apple Watch (smartwatch); Amazon Kindle (e-reader).",
              "examTip": "Mobile devices = touchscreen, battery, mobile OS, always connected (Wi-Fi/cellular). Key limitations: smaller screen, less processing power than desktop, battery life, security risks from app stores and public Wi-Fi.",
              "keyFacts": [
                "Always-connected: Wi-Fi and cellular (4G/5G) connectivity",
                "Touch interface: touchscreen graphical user interface",
                "Mobile OS: iOS or Android — different ecosystem to desktop OS",
                "Battery-powered: limited by charge — needs regular recharging",
                "Sensors: GPS, accelerometer, camera, NFC, biometric authentication",
                "App ecosystem: software distributed through controlled app stores (App Store, Google Play)"
              ]
            },
            {
              "code": "A1.1.4",
              "term": "Servers (File, Application, Web)",
              "definition": "Powerful computers that provide services, data, or resources to other computers (clients) on a network. Designed for continuous operation, high reliability, and handling multiple simultaneous requests.",
              "examples": "A file server storing shared documents for an organisation; a web server hosting a company website; an application server running a database-backed ERP system.",
              "examTip": "Know the three server types: file server (stores/shares files), application server (runs software applications for clients), web server (hosts websites and delivers web pages via HTTP/HTTPS).",
              "keyFacts": [
                "File server: central storage for shared files — manages access permissions",
                "Application server: hosts and runs software applications — clients connect remotely",
                "Web server: stores website files, processes HTTP/HTTPS requests, delivers pages to browsers",
                "24/7 operation: servers must be highly reliable — RAID storage, redundant power supplies",
                "Rack-mounted: typically installed in temperature-controlled server rooms/data centres",
                "Virtualisation: one physical server can run multiple virtual servers simultaneously"
              ],
              "comparisonTable": {
                "title": "Server Types Compared",
                "headers": ["Type", "Primary function", "Who connects", "Example use"],
                "rows": [
                  ["File server", "Stores and manages access to shared files/folders", "Internal network users", "Company shared drive (H: drive in Windows domain)"],
                  ["Application server", "Hosts and runs software applications for network clients", "Internal clients running client-side of the application", "ERP system, database server, email server (Exchange)"],
                  ["Web server", "Hosts website files, handles HTTP/HTTPS requests from browsers", "Anyone on the internet (or intranet)", "Apache/Nginx hosting company website; IIS hosting intranet"]
                ]
              }
            },
            {
              "code": "A1.1.5",
              "term": "Entertainment Systems",
              "definition": "Consumer electronics designed primarily for leisure and entertainment — including games consoles, smart TVs, set-top boxes, and streaming devices.",
              "examples": "PlayStation 5 (games console); Samsung Smart TV; Amazon Fire TV Stick; Sky Q box (set-top box).",
              "examTip": "Entertainment systems are increasingly internet-connected and run embedded OSes. They overlap with IoT and streaming — link to E1.1.5 (online entertainment) in exam scenarios.",
              "keyFacts": [
                "Games consoles: powerful GPUs, dedicated gaming OS, online multiplayer via PSN/Xbox Live",
                "Smart TVs: run apps (Netflix, YouTube), browser, connected to internet",
                "Set-top boxes: receive digital broadcast, decode signal, may have recording capability",
                "Streaming sticks (Chromecast, Fire Stick): add smart TV functionality to any screen",
                "All increasingly internet-connected — security and privacy concerns apply"
              ]
            },
            {
              "code": "A1.1.6",
              "term": "Digital Cameras (Still and Video)",
              "definition": "Devices that capture still images or video in digital format. Range from dedicated professional cameras to integrated smartphone cameras.",
              "examples": "DSLR camera for professional photography; GoPro action camera; CCTV cameras; drone camera; built-in smartphone camera.",
              "examTip": "Digital cameras produce large raw files. Relevant to file formats (A3.7.1 images, A3.7.3 videos), storage capacity (A2.3.1), and bandwidth when transmitting high-resolution images/video.",
              "keyFacts": [
                "DSLR/mirrorless: interchangeable lenses, large sensors, professional quality — large RAW files",
                "Compact/bridge: fixed lens, lighter, more accessible",
                "Action cameras: rugged, waterproof, wide-angle — GoPro for sports/adventure",
                "Video cameras: dedicated video capture — 4K/8K recording requires significant storage",
                "Sensor resolution (megapixels) affects image quality and file size",
                "CCTV cameras: security surveillance — generate continuous video data requiring large storage"
              ]
            },
            {
              "code": "A1.1.7",
              "term": "Navigation Systems",
              "definition": "Devices or software that determine a user's location and provide route guidance using GPS (Global Positioning System) signals from satellites.",
              "examples": "Dedicated sat-nav (TomTom, Garmin); Google Maps on a smartphone; in-car navigation systems; GPS trackers in delivery vehicles.",
              "examTip": "Navigation systems = GPS + mapping software + real-time data. Modern navigation integrates live traffic data, requiring internet connectivity. GPS itself is a receive-only signal — no mobile data needed for basic position.",
              "keyFacts": [
                "GPS: receives signals from multiple satellites to calculate position (latitude/longitude)",
                "Dedicated sat-nav: standalone device, pre-loaded maps, no mobile data needed",
                "Smartphone navigation: uses GPS + internet for live maps and traffic — more up to date",
                "Fleet management: organisations track delivery vehicles in real time for efficiency",
                "Privacy concern: GPS data reveals user movements — location data is personal data under GDPR"
              ]
            },
            {
              "code": "A1.1.8",
              "term": "Communication Devices and Systems",
              "definition": "Hardware and systems designed primarily for transmitting and receiving information between people or machines — including phones, radios, modems, and network infrastructure.",
              "examples": "Mobile phones (voice + data); VoIP phones; routers and modems; walkie-talkies/two-way radios; satellite communication systems.",
              "examTip": "Communication devices are the hardware layer of networks (B section). Routers and modems appear here as devices — link them to network protocols and topologies when discussing how data is transmitted.",
              "keyFacts": [
                "Modems: convert digital data to/from analogue signals for transmission over phone lines/cable",
                "Routers: direct data packets between networks — connect LAN to internet",
                "VoIP phones: voice calls over internet protocol — cheaper than traditional landlines",
                "4G/5G base stations: provide cellular mobile network coverage",
                "Communication devices are the physical layer enabling the networks covered in Section B"
              ]
            },
            {
              "code": "A1.1.9",
              "term": "Embedded Systems (Sensors and Internet of Things)",
              "definition": "Computing systems built into a larger device to perform a specific dedicated function — typically with no user-facing interface. IoT devices are embedded systems connected to the internet to send/receive data.",
              "examples": "Washing machine control system; ABS brakes controller; smart thermostat (Nest); smart meter; industrial sensor monitoring temperature in a factory; traffic light controller.",
              "examTip": "Embedded systems = built-in, dedicated function, minimal user interface. IoT = embedded + internet connected + data transmission. Exam may ask about security risks of IoT — many IoT devices have poor security and become targets for botnets.",
              "keyFacts": [
                "Single-purpose: designed to perform one specific task — not general purpose",
                "Minimal or no user interface — operates autonomously",
                "IoT: internet-connected embedded systems that collect and transmit data to servers/cloud",
                "Examples of IoT: smart meters, connected CCTV, smart home devices, industrial sensors",
                "Security concern: IoT devices often have weak default passwords, infrequent firmware updates",
                "Data generated by IoT sensors is often processed via data logging systems (A4.2.2)"
              ]
            }
          ]
        },
        {
          "code": "A1.2",
          "title": "Function and Use of Digital Devices by Context",
          "items": [
            {
              "code": "A1.2.1",
              "term": "Personal Use of Digital Devices",
              "definition": "Using digital devices for individual everyday tasks including communication, entertainment, online shopping, banking, and personal organisation.",
              "examTip": "Personal use covers the widest range of devices — smartphone, laptop, smart TV, games console. Consider privacy implications when discussing personal device use.",
              "keyFacts": ["Smartphones for communication, social media, navigation, entertainment", "Laptops/tablets for browsing, email, personal finance, shopping", "Smart home devices (IoT): smart speakers, thermostats, security cameras"]
            },
            {
              "code": "A1.2.2",
              "term": "Education and Training Use of Digital Devices",
              "definition": "Using digital devices to support learning, teaching, assessment, and professional development.",
              "examTip": "Link to E1.1.3 (online education). VLEs, interactive whiteboards, tablets, and e-readers are all relevant. Consider the digital divide — unequal access creates disadvantage.",
              "keyFacts": ["Interactive whiteboards in classrooms", "Tablets and laptops for student research and assignments", "VLEs (Google Classroom, Moodle) for remote/hybrid learning", "Simulation software for training (flight simulators, medical training)"]
            },
            {
              "code": "A1.2.3",
              "term": "Social Use of Digital Devices",
              "definition": "Using devices to communicate, build relationships, and interact with communities online.",
              "examTip": "Social use links to Section C (online communities), F1 (ethical issues, privacy, netiquette). Consider both benefits (connection, support communities) and risks (cyberbullying, addiction, privacy loss).",
              "keyFacts": ["Social media platforms: Instagram, X, TikTok, Facebook", "Messaging apps: WhatsApp, iMessage, Snapchat", "Online gaming communities: multiplayer games, Discord", "Ethical concerns: cyberbullying, data privacy, digital addiction, netiquette"]
            },
            {
              "code": "A1.2.4",
              "term": "Retail Use of Digital Devices",
              "definition": "Using digital devices and systems to support buying and selling — from point-of-sale systems to online retail and stock management.",
              "examTip": "Retail uses span many device types: EPOS terminals, barcode scanners, self-checkout kiosks, mobile payment readers. Link to E1.1.1 (online retail) and A4.2.1 (stock control).",
              "keyFacts": ["EPOS (Electronic Point of Sale) systems: process transactions, update stock automatically", "Barcode scanners and RFID: track inventory", "Self-checkout kiosks: reduce staff costs", "Mobile payment readers: contactless payment via tablet/phone"]
            },
            {
              "code": "A1.2.5",
              "term": "Manufacturing Use of Digital Devices",
              "definition": "Using digital devices, robotics, and computer-controlled systems to automate and optimise manufacturing processes.",
              "examTip": "Manufacturing links to A4.2.7 (manufacturing IT systems) and A1.2.8 (automation/robotics). Key themes: CNC machines, industrial robots, IoT sensors for quality control.",
              "keyFacts": ["CNC (Computer Numerical Control) machines: precision manufacture controlled by computer programs", "Industrial robots: automated assembly, welding, painting", "IoT sensors: monitor temperature, pressure, machine performance in real time", "CAD/CAM software: design and manufacture integration"]
            },
            {
              "code": "A1.2.6",
              "term": "Healthcare Use of Digital Devices",
              "definition": "Using digital devices to support diagnosis, treatment, monitoring, and administration in healthcare settings.",
              "examTip": "Healthcare devices must be highly reliable — failures can be life-threatening. Data accuracy is critical (E2.4). Privacy of patient data is particularly sensitive under GDPR.",
              "keyFacts": ["MRI/CT scanners: medical imaging — produce very large data files", "Patient monitoring systems: real-time vital signs tracking (IoT embedded systems)", "Electronic Patient Records (EPR): digitised health records accessible to authorised clinicians", "Robotic surgery systems: precision-controlled surgical tools", "Telemedicine: video consultations with GPs — links to E1.1.3 and remote working"]
            },
            {
              "code": "A1.2.7",
              "term": "Creative Use of Digital Devices",
              "definition": "Using digital devices for artistic and creative work — including graphic design, music production, video editing, animation, and photography.",
              "examTip": "Creative tasks require high-performance hardware: powerful CPU/GPU, large RAM, high-resolution display, fast storage. Large file sizes created — link to storage (A2.3) and file formats (A3.7).",
              "keyFacts": ["High-spec workstations or creative laptops (MacBook Pro, Dell XPS)", "Graphics tablets: precise pen input for illustration and design", "Digital audio workstations (DAW): music production software (Logic Pro, Ableton)", "Video editing software: Final Cut Pro, Adobe Premiere — demands high RAM and GPU", "Large file formats (RAW images, 4K video) require large, fast storage"]
            },
            {
              "code": "A1.2.8",
              "term": "Automation and Robotics",
              "definition": "Using programmed machines and AI systems to perform repetitive or complex tasks with minimal human intervention — across manufacturing, logistics, agriculture, and service industries.",
              "examples": "Amazon warehouse robots sorting parcels; automated car assembly line robots; self-checkout systems; chatbots handling customer queries.",
              "examTip": "Link to A5 (AI/emerging tech) and F1.1 (ethical implications — job displacement). Automation increases efficiency but raises concerns about unemployment and the need for re-training.",
              "keyFacts": [
                "Industrial robots: perform repetitive manufacturing tasks with high precision",
                "Automated guided vehicles (AGVs): self-driving warehouse vehicles",
                "Benefits: 24/7 operation, consistent quality, reduced labour cost, dangerous task automation",
                "Concerns: job displacement — workers replaced by machines; digital skills gap",
                "AI-powered automation: systems learn from data and improve over time"
              ]
            }
          ]
        },
        {
          "code": "A1.3",
          "title": "Forms of Notation for IT System Design",
          "items": [
            {
              "code": "A1.3.1",
              "term": "System Diagrams",
              "definition": "Visual representations showing the components of an IT system and how they are connected — including hardware, software, networks, data flows, and users.",
              "examples": "A network diagram showing servers, switches, workstations and their connections; a diagram showing how a web application connects to a database and CDN.",
              "examTip": "System diagrams appear in Q3 of the exam (6 marks) — you will likely be asked to draw or annotate one. Practice drawing: user device → router → internet → server. Use correct shapes: rectangle (device), cloud (internet), cylinder (database), diamond (decision).",
              "keyFacts": [
                "Shows hardware components, connections, and data flow",
                "Standard shapes: rectangle/box (device/process), cylinder (database/storage), cloud shape (internet/cloud), arrow (data flow direction)",
                "Must show direction of data flow with arrows",
                "Labels all components and connections",
                "Can show physical layout OR logical architecture",
                "Often includes: client devices, router, firewall, server, internet cloud, database"
              ]
            },
            {
              "code": "A1.3.2",
              "term": "Flowcharts",
              "definition": "Diagrams that represent a process or algorithm as a sequence of steps using standardised symbols — showing decisions, actions, and the flow of control.",
              "examples": "A flowchart for a login process showing password validation; a flowchart for an order fulfilment system; a flowchart for a thermostat control algorithm.",
              "examTip": "Standard flowchart symbols must be memorised: oval/rounded rectangle = Start/End; rectangle = Process; diamond = Decision (Yes/No); parallelogram = Input/Output. Q3 may ask you to complete or draw a flowchart.",
              "keyFacts": [
                "Oval/terminal: Start and End points",
                "Rectangle/process box: an action or process step",
                "Diamond/decision: a Yes/No question — always has two exit paths",
                "Parallelogram/input-output: data entering or leaving the process",
                "Arrow: shows direction of flow",
                "Loops: decision diamond looping back to an earlier step"
              ],
              "comparisonTable": {
                "title": "System Diagram vs Flowchart",
                "headers": ["Feature", "System Diagram", "Flowchart"],
                "rows": [
                  ["Shows", "Components of an IT system and their connections", "Steps in a process or algorithm and their sequence"],
                  ["Main focus", "Hardware, devices, networks, architecture", "Logic, decisions, data flow through a process"],
                  ["Key symbols", "Boxes (devices), cylinders (databases), clouds (internet), arrows (connections)", "Ovals (start/end), rectangles (process), diamonds (decision), parallelograms (I/O)"],
                  ["When used", "Designing or documenting IT infrastructure", "Designing or documenting processes, algorithms, programs"],
                  ["Exam context", "Draw a network/system showing how components connect", "Complete or draw a process showing steps and decisions"]
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "code": "A2",
      "title": "Peripheral Devices and Media",
      "subtopics": [
        {
          "code": "A2.1",
          "title": "Features and Uses of Peripheral Devices",
          "items": [
            {
              "code": "A2.1.1",
              "term": "Input Devices",
              "definition": "Hardware that allows users or systems to enter data into a computer. Input devices convert real-world actions or data into digital signals the computer can process.",
              "examples": "Keyboard (text input); mouse (pointer control); microphone (audio input); webcam (video input); barcode scanner (data input); touchscreen (touch input); graphics tablet (precision drawing).",
              "examTip": "Input = data going INTO the system. Categorise inputs: manual (keyboard, mouse), automatic (barcode scanner, sensor). Link to data processing (A2.4).",
              "keyFacts": [
                "Manual input: keyboard, mouse, trackpad, touchscreen, graphics tablet, joystick",
                "Optical input: scanner, barcode reader, QR code reader, camera",
                "Audio input: microphone (voice recognition, recording)",
                "Automatic input: sensors, RFID readers, biometric scanners, barcode scanners",
                "Choice of input device depends on type of data being entered and context"
              ]
            },
            {
              "code": "A2.1.2",
              "term": "Output Devices",
              "definition": "Hardware that presents processed data from a computer to users or the environment in a human-perceivable or machine-readable form.",
              "examples": "Monitor (visual output); printer (printed documents); speakers/headphones (audio output); projector (display); actuators in control systems (physical output); braille display (tactile output).",
              "examTip": "Output = data coming OUT of the system. Visual (monitor, printer, projector), audio (speakers), tactile (braille display, vibration motor). Printers produce hard copy; monitors soft copy.",
              "keyFacts": [
                "Visual: monitor (soft copy — temporary), printer (hard copy — permanent), projector",
                "Audio: speakers, headphones — output of processed audio",
                "Tactile: braille display (assistive technology), vibration feedback on phones",
                "Hard copy: physical output (printed document) — permanent",
                "Soft copy: digital/screen output — temporary unless saved",
                "Plotters: specialist output for large-format technical drawings (architects, engineers)"
              ]
            },
            {
              "code": "A2.1.3",
              "term": "Storage Devices",
              "definition": "Hardware that permanently or semi-permanently stores digital data so it can be retrieved later. Includes primary storage (RAM — temporary) and secondary storage (hard drives, SSDs, optical discs — persistent).",
              "examples": "SSD internal drive in a laptop; external HDD for backup; USB flash drive for data transport; Blu-ray disc for media distribution.",
              "examTip": "Storage devices are a common exam topic — compare HDD vs SSD by speed, cost, reliability. Link to A2.3 (storage media characteristics: capacity, cost, speed, compatibility).",
              "keyFacts": [
                "Internal secondary storage: HDD (spinning disk, mechanical) or SSD (flash memory, no moving parts)",
                "External storage: portable HDDs, USB flash drives, external SSDs for backup and transfer",
                "Optical: CD/DVD/Blu-ray — read/write discs for media distribution and archiving",
                "Cloud storage: remote server storage accessed via internet (not a physical peripheral but increasingly dominant)",
                "Network Attached Storage (NAS): shared storage device accessible over a network"
              ]
            }
          ]
        },
        {
          "code": "A2.2",
          "title": "Assistive Technologies",
          "items": [
            {
              "code": "A2.2.1",
              "term": "Adaptive Keyboards",
              "definition": "Specialised keyboards designed for users with physical or cognitive disabilities — including larger keys, different layouts, key guards, or on-screen keyboards controlled by alternative input methods.",
              "examples": "A keyboard with large keys and high-contrast labels for users with low vision; a one-handed keyboard layout; a soft silicone keyboard for users with limited dexterity.",
              "examTip": "Adaptive keyboards help users who cannot use a standard keyboard due to motor impairment, visual impairment, or cognitive difficulties. Link to F1.1.4 (access to assistive technology as an ethical issue).",
              "keyFacts": ["Large key keyboards: for users with visual impairment or motor difficulties", "Key guards: physical overlay preventing accidental key presses", "One-handed keyboards: split or angled layout for users with one functional hand", "On-screen keyboards: controlled via mouse, eye tracking, or switch input"]
            },
            {
              "code": "A2.2.2",
              "term": "Screen Readers",
              "definition": "Software that reads aloud the text displayed on a screen, allowing users who are blind or have severe visual impairment to navigate and use a computer by listening.",
              "examples": "JAWS (Job Access With Speech); NVDA (NonVisual Desktop Access); VoiceOver built into macOS and iOS; TalkBack on Android.",
              "examTip": "Screen readers are essential for blind users. They depend on websites and applications being coded with accessibility in mind — alt text on images, proper heading structure, labelled form fields.",
              "keyFacts": ["Converts on-screen text to synthesised speech output", "Reads menus, buttons, form fields, and document content aloud", "User navigates by keyboard or braille display rather than mouse", "Requires websites/apps to follow accessibility standards (WCAG)"]
            },
            {
              "code": "A2.2.3",
              "term": "Braille Displays",
              "definition": "A hardware device that converts digital text into braille by raising and lowering pins to form braille characters — allowing blind users to read screen content tactilely.",
              "examples": "A refreshable braille display connected via USB to a computer; a combined braille display and screen reader setup for a blind office worker.",
              "examTip": "Braille display = tactile output device for blind users. 'Refreshable' means the braille characters update dynamically as screen content changes — unlike printed braille.",
              "keyFacts": ["Refreshable braille: pins rise/lower to form braille characters in real time", "Usually works alongside screen reader software", "Allows silent reading — useful in quiet environments", "Expensive compared to audio-based assistive tech"]
            },
            {
              "code": "A2.2.4",
              "term": "Screen Magnifiers",
              "definition": "Software (or hardware) that enlarges a portion or all of the screen display, allowing users with low vision to see content more clearly.",
              "examples": "Windows Magnifier; ZoomText; macOS built-in zoom feature; hardware magnification devices placed over screens.",
              "examTip": "Screen magnifiers help users who have some vision but cannot read standard-size text. Different from screen readers — magnifiers enlarge visually rather than converting to audio.",
              "keyFacts": ["Software magnifiers: built into most modern OS (Windows, macOS, iOS, Android)", "Magnification levels: typically 2× to 16×", "Different modes: full-screen, lens (magnified area follows cursor), docked (split screen)", "High DPI/retina displays improve effectiveness of magnification"]
            },
            {
              "code": "A2.2.5",
              "term": "Head Pointers",
              "definition": "A device worn on the head (typically a mounted stick or pointer) that allows users with limited or no hand/arm mobility to interact with a keyboard or touchscreen using head movements.",
              "examples": "A mouth stick or head stick used by a user with quadriplegia to press keyboard keys; an infrared head pointer that moves the cursor using head movement.",
              "examTip": "Head pointers enable computer use for users with severe upper limb impairment. They are physical devices — distinct from head-tracking software (which uses a camera).",
              "keyFacts": ["Physical stick worn on head — presses keys or screen directly", "Used by users with limited/no hand function (e.g. spinal cord injury)", "Head tracking cameras: electronic equivalent — tracks head movement to control cursor without physical contact"]
            },
            {
              "code": "A2.2.6",
              "term": "Single Switch Entry Devices",
              "definition": "Input devices reduced to a single button/switch, allowing users with very limited motor control to access computers using only one movement — through scanning interfaces or Morse code.",
              "examples": "A large button switch connected to a PC for a user with cerebral palsy; a cheek switch activated by facial muscle movement.",
              "examTip": "Single switch = minimal physical movement required. The computer cycles through options (scanning) and the user activates the switch to select. Very slow but enables computer use for users with minimal mobility.",
              "keyFacts": ["Scanning: computer highlights each option in sequence; user activates switch to select", "Any reliable voluntary movement can activate a switch: hand, foot, cheek, eyebrow", "Used for on-screen keyboards, AAC (Augmentative and Alternative Communication) devices"]
            },
            {
              "code": "A2.2.7",
              "term": "Foot Switches",
              "definition": "Input devices operated by foot movement — typically a pedal that can be pressed to trigger an action, freeing the user's hands for other tasks.",
              "examples": "A transcriptionist using a foot pedal to pause/play audio while typing; a user with upper limb impairment using foot pedals to control cursor movement; a hands-free page-turner for a musician.",
              "examTip": "Foot switches are useful both as assistive technology (for users who cannot use hands) and as productivity tools (e.g. transcriptionists, radiographers reviewing scans).",
              "keyFacts": ["Can be single action (press/release) or multi-pedal (different actions)", "Useful for users with upper limb impairment", "Also used as productivity tools by able-bodied users to reduce hand strain"]
            },
            {
              "code": "A2.2.8",
              "term": "Sip-and-Puff Switches",
              "definition": "Input devices that detect breath — a 'sip' (inhale) or 'puff' (exhale) into a tube triggers a switch input, enabling computer control for users with very limited or no limb mobility.",
              "examples": "A user with quadriplegia controlling a power wheelchair and computer using a sip-and-puff device; a user navigating an on-screen keyboard by breath patterns.",
              "examTip": "Sip-and-puff = breath-controlled input. This is one of the most minimal physical requirements for input — suitable for users who can only reliably control their breathing.",
              "keyFacts": ["Detects pressure difference between sip (inhale) and puff (exhale)", "Can be mapped to different inputs: sip = left click, puff = right click, etc.", "Often combined with head tracking or scanning for full computer access"]
            },
            {
              "code": "A2.2.9",
              "term": "Eye-Tracking Software",
              "definition": "Technology that uses a camera and infrared light to track the movement of a user's eyes, allowing them to control a cursor or select items by looking at them — enabling hands-free computer control.",
              "examples": "Tobii eye tracker for users with ALS (motor neurone disease); gaze-based AAC devices; eye-tracking for UX research; gaze-controlled gaming.",
              "examTip": "Eye tracking = camera watches where eyes look → moves cursor there. Dwell time (looking at a target for a fixed period) acts as a click. Increasingly accurate and affordable — one of the most capable assistive input technologies.",
              "keyFacts": ["Infrared camera tracks eye movement in real time", "Cursor follows gaze — dwell click (holding gaze) triggers selection", "High accuracy required — sensitive to ambient light and glasses", "Used in assistive tech AND in UX research to understand how users scan pages"]
            },
            {
              "code": "A2.2.10",
              "term": "Text-to-Speech Software",
              "definition": "Software that converts written text into synthesised spoken audio output — either reading on-screen text aloud (like a screen reader) or reading typed text aloud for communication.",
              "examples": "Speak selection feature on iOS reading a web article aloud; an AAC (Augmentative and Alternative Communication) app speaking for a non-verbal user; Natural Reader; read-aloud features in Microsoft Word.",
              "examTip": "Text-to-speech is both an assistive technology (for users who cannot read or cannot speak) and a productivity tool. Distinct from screen reader (A2.2.2) — TTS focuses on audio output of text; screen readers provide full navigation assistance.",
              "keyFacts": [
                "Converts text to synthesised or natural-sounding speech",
                "Helps users with dyslexia, visual impairments, or reading difficulties",
                "AAC devices: allow non-verbal users to communicate by typing/selecting text that is then spoken",
                "Modern TTS uses AI voice synthesis — increasingly natural sounding",
                "Available built-in on all major OS and mobile platforms"
              ]
            }
          ]
        },
        {
          "code": "A2.3",
          "title": "Characteristics and Implications of Storage Media",
          "items": [
            {
              "code": "A2.3.1",
              "term": "Capacity",
              "definition": "The maximum amount of data a storage medium can hold, measured in gigabytes (GB) or terabytes (TB).",
              "examTip": "Capacity requirements depend on use case. Video editors need TB-scale storage; USB drives for document transport only need GB. Cloud storage is essentially unlimited (but subscription costs scale with usage).",
              "keyFacts": ["USB flash drives: 8 GB – 256 GB typical", "HDD: 500 GB – 20 TB for consumer drives", "SSD: 256 GB – 8 TB (consumer); smaller capacities at lower prices", "Optical (Blu-ray): up to 100 GB per disc — fixed capacity", "Capacity vs cost: HDDs cheapest per GB; SSDs more expensive but falling in price"]
            },
            {
              "code": "A2.3.2",
              "term": "Cost",
              "definition": "The price of the storage medium, both the unit cost and the cost per gigabyte of storage — which affects which type of storage is appropriate for an organisation or individual.",
              "examTip": "Cost comparison: HDD = cheapest per GB (bulk storage). SSD = more expensive per GB but prices falling. Optical disc = low per-disc cost but slow and limited capacity. Cloud = subscription ongoing cost.",
              "keyFacts": [
                "HDD: ~£15–£30 per TB — most cost-effective for large bulk storage",
                "SSD: ~£60–£100 per TB consumer — falling rapidly; worth premium for OS drive",
                "USB flash drive: moderate cost per GB — convenience premium over HDD",
                "Cloud: subscription per month/year — cost scales with storage used",
                "Total cost of ownership: consider lifespan and replacement costs, not just purchase price"
              ],
              "comparisonTable": {
                "title": "Storage Media Compared: HDD vs SSD vs USB vs Optical",
                "headers": ["Feature", "HDD", "SSD", "USB Flash Drive", "Optical (BD/DVD)"],
                "rows": [
                  ["Technology", "Spinning magnetic platters + read/write heads", "NAND flash memory (no moving parts)", "NAND flash memory", "Laser reads/writes to reflective disc"],
                  ["Typical capacity", "500 GB – 20 TB", "256 GB – 8 TB", "8 GB – 256 GB", "4.7 GB (DVD) / 25–100 GB (Blu-ray)"],
                  ["Speed (read)", "80–200 MB/s (typical)", "500 MB/s – 7,000 MB/s (NVMe SSD)", "50–200 MB/s", "1–72 MB/s"],
                  ["Cost per GB", "Lowest (~£0.02/GB)", "Higher (~£0.05–0.10/GB)", "Moderate", "Very low per disc; slow"],
                  ["Durability", "Fragile — moving parts, vulnerable to drops", "Very durable — no moving parts", "Durable — no moving parts", "Fragile — scratches destroy data"],
                  ["Portability", "Moderate (external HDDs)", "High (external SSDs)", "Very high — pocket-sized", "Moderate — bulky cases"],
                  ["Noise", "Audible (spinning and head movement)", "Silent", "Silent", "Audible (drive motor)"],
                  ["Best use", "Mass storage, backup, archiving", "OS drive, fast access, laptops", "Data transport, small portability", "Software distribution, archiving, media"]
                ]
              }
            },
            {
              "code": "A2.3.3",
              "term": "Speed",
              "definition": "How quickly data can be read from or written to the storage medium — measured in MB/s or GB/s. Affects how fast the system starts up, how quickly files open, and overall system responsiveness.",
              "examTip": "SSD >> HDD for speed. This is the single biggest performance upgrade for most computers. NVMe SSDs (PCIe interface) are significantly faster than SATA SSDs.",
              "keyFacts": [
                "HDD: 80–200 MB/s sequential read — limited by spinning speed (5400 or 7200 RPM)",
                "SATA SSD: 500–600 MB/s — limited by SATA interface",
                "NVMe SSD: 3,000–7,000 MB/s — uses PCIe lanes, dramatically faster",
                "USB 3.1 flash drives: up to 400 MB/s for fast models",
                "Optical: very slow (1–72 MB/s) — irrelevant for system use; mainly for one-time reads",
                "Random access speed: HDDs very slow (milliseconds of seek time); SSDs near-instant"
              ]
            },
            {
              "code": "A2.3.4",
              "term": "Compatibility",
              "definition": "Whether the storage medium works with the available interfaces, operating systems, and hardware of the target device.",
              "examTip": "Compatibility issues arise when connecting older storage to newer systems (or vice versa). Check: physical interface (USB-A vs USB-C, SATA vs NVMe), file system (NTFS vs exFAT vs FAT32), and OS support.",
              "keyFacts": [
                "Interface compatibility: USB-A vs USB-C, SATA vs NVMe/PCIe, Thunderbolt",
                "File system compatibility: NTFS (Windows); HFS+/APFS (macOS); exFAT (cross-platform); FAT32 (universal but 4 GB file limit)",
                "Optical compatibility: newer drives may not read older disc formats",
                "Legacy hardware: some older devices only support smaller capacity drives or older interfaces"
              ]
            }
          ]
        },
        {
          "code": "A2.4",
          "title": "Data Processing",
          "items": [
            {
              "code": "A2.4.1",
              "term": "Manual Data Processing",
              "definition": "Data is entered, processed, or managed by humans without automated computer assistance — relying on human judgement and action at each step.",
              "examples": "A receptionist writing appointment times in a paper diary; manually entering customer order details from a phone call into a spreadsheet; counting stock items by hand.",
              "examTip": "Manual processing = humans do the work. Slower, more error-prone, but sometimes necessary where automated processing isn't practical or where judgement is needed. Compare with A2.4.2.",
              "keyFacts": [
                "Human input at every stage — higher error rate than automated",
                "Slower than automated processing",
                "Flexible — humans can handle unexpected situations",
                "Still used where automated systems are unavailable or uneconomical",
                "GDPR: humans handling personal data manually must still comply with data protection obligations"
              ]
            },
            {
              "code": "A2.4.2",
              "term": "Automatic Data Processing",
              "definition": "Data is collected, processed, and managed by computer systems with minimal or no human intervention — using sensors, barcode readers, or batch processing systems.",
              "examples": "A supermarket EPOS system automatically updating stock levels when items are sold; a bank automatically processing overnight transactions in batch; a weather station automatically logging sensor readings every minute.",
              "examTip": "Automatic processing = faster, more consistent, less prone to human error. Links to A3.1.1 (batch OS) and data logging (A4.2.2). Consider: what happens when the automated system fails?",
              "keyFacts": [
                "Faster and more consistent than manual processing",
                "Batch processing: large volumes of transactions processed together at scheduled intervals",
                "Real-time processing: transactions processed immediately as they occur (e.g. bank card payment authorisation)",
                "Data logging: automatic recording of sensor/system data over time",
                "Reduced human error — but errors in the system/algorithm can affect all records identically"
              ],
              "comparisonTable": {
                "title": "Manual vs Automatic Data Processing",
                "headers": ["Feature", "Manual Processing", "Automatic Processing"],
                "rows": [
                  ["Who does the work", "Humans at each stage", "Computer systems with minimal human input"],
                  ["Speed", "Slow — limited by human working speed", "Fast — computer processing speed"],
                  ["Accuracy", "Prone to human error (transcription, calculation)", "Consistent — but systematic errors if algorithm is wrong"],
                  ["Cost", "High ongoing staffing cost", "High initial setup; lower ongoing cost"],
                  ["Flexibility", "High — humans handle unexpected situations", "Lower — may struggle with exceptions to normal rules"],
                  ["Volume capacity", "Limited by workforce size", "Can scale to process millions of transactions"],
                  ["Example", "Receptionist writing appointments in paper diary", "EPOS system auto-updating stock when items are scanned"]
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "code": "A3",
      "title": "Computer Software in an IT System",
      "subtopics": [
        {
          "code": "A3.1",
          "title": "Types of Operating Systems",
          "items": [
            {
              "code": "A3.1.1",
              "term": "Batch Operating System",
              "definition": "An OS that groups similar jobs together and processes them automatically in sequence without user interaction — typically used for large-volume repetitive processing tasks run at scheduled times.",
              "examples": "A bank processing all overnight standing orders and direct debits in a nightly batch run; a payroll system processing all employee pay calculations at month end.",
              "examTip": "Batch OS = no user interaction, jobs queued and processed in groups, often overnight. Key advantage: efficient use of computer time. Key limitation: delayed results — cannot get immediate output.",
              "keyFacts": ["Jobs queued and processed sequentially without user interaction", "Efficient for large volumes of identical transactions", "Results not available until batch completes — no real-time output", "Still widely used in banking (overnight settlement), payroll, utility billing"]
            },
            {
              "code": "A3.1.2",
              "term": "Distributed Operating System",
              "definition": "An OS that manages a collection of independent computers, making them appear as a single unified system to users — distributing processing tasks across multiple machines.",
              "examples": "Google's search infrastructure processing queries across thousands of servers; a scientific computing cluster running simulations across hundreds of nodes.",
              "examTip": "Distributed OS = many computers acting as one. Benefits: fault tolerance (if one node fails, others continue), scalability (add more nodes to increase capacity).",
              "keyFacts": ["Coordinates multiple computers to work as a single system", "Load balancing: distributes tasks across available nodes for efficiency", "Fault tolerant: individual node failure does not bring down the whole system", "Examples: cloud computing infrastructure, scientific computing grids, CDNs"]
            },
            {
              "code": "A3.1.3",
              "term": "Multitasking Operating System",
              "definition": "An OS that allows multiple programs to run concurrently by rapidly switching CPU time between them — giving the appearance that all programs run simultaneously.",
              "examples": "Windows 11 running a browser, music player, and word processor simultaneously; macOS allowing background downloads while the user edits a document.",
              "examTip": "Most modern desktop and mobile OSes are multitasking. The CPU doesn't actually run all programs at once — it switches between them so fast (thousands of times per second) it feels simultaneous.",
              "keyFacts": ["CPU switches rapidly between processes — context switching", "Pre-emptive multitasking: OS controls how long each process runs (modern OSes)", "Cooperative multitasking: programs voluntarily yield CPU (older, less reliable)", "RAM must be sufficient to hold all running programs' data simultaneously"]
            },
            {
              "code": "A3.1.4",
              "term": "Network Operating System",
              "definition": "An OS designed to manage network resources and services — providing file sharing, printer sharing, user authentication, and network administration for connected client devices.",
              "examples": "Windows Server; Linux server distributions (Ubuntu Server, CentOS); Novell NetWare (legacy).",
              "examTip": "Network OS runs on servers and manages centralised resources for the network. Clients connect to it to access shared files, printers, and authentication services.",
              "keyFacts": ["Manages centralised file storage, printer queues, and user accounts", "Provides authentication: users log in to the domain, not just the local machine", "Active Directory (Windows Server): centralised management of users, permissions, and devices", "Handles concurrent connections from multiple client devices"]
            },
            {
              "code": "A3.1.5",
              "term": "Real-Time Operating System (RTOS)",
              "definition": "An OS designed to process data and respond to inputs within a guaranteed, very short time frame — critical where delayed responses could cause failure or harm.",
              "examples": "Antilock braking system (ABS) controller; aircraft flight control system; industrial robot control; pacemaker software; missile guidance system.",
              "examTip": "RTOS = guaranteed response within a set time. Not about being fast — about being predictable and reliable. Used where delay is dangerous (medical, transport, industrial control).",
              "keyFacts": ["Hard real-time: response MUST occur within deadline — failure is catastrophic (aircraft, pacemaker)", "Soft real-time: response should occur within deadline — failure degrades but doesn't catastrophically fail (video streaming)", "Deterministic: same input always produces same output in same time", "Minimal OS — prioritises reliability over features"]
            },
            {
              "code": "A3.1.6",
              "term": "Mobile Operating System",
              "definition": "An OS designed specifically for smartphones, tablets, and wearables — optimised for touch input, battery efficiency, sensor integration, and app-store software distribution.",
              "examples": "iOS (Apple); Android (Google); watchOS (Apple Watch); Wear OS (Android wearables).",
              "examTip": "Mobile OS is optimised for touch, battery, and connectivity. Key differences from desktop OS: app sandboxing for security, app store distribution model, power management.",
              "keyFacts": ["Touch-first interface — no mouse/keyboard assumed", "Battery optimisation: aggressive background process management", "Sensor integration: GPS, accelerometer, camera, NFC all managed by OS", "App sandboxing: each app runs in isolated environment for security", "App store model: centralised distribution with security vetting"]
            },
            {
              "code": "A3.1.7",
              "term": "Single-Use Operating System",
              "definition": "An OS designed to perform one specific function, with all unnecessary components removed. The system does exactly one thing, consistently and reliably.",
              "examples": "ATM software running a dedicated banking transaction OS; a digital signage system; a point-of-sale terminal; a games console.",
              "examTip": "Single-use OS = purpose-built, stripped down. Benefits: reliability, security (smaller attack surface), speed. Not flexible — cannot run other software.",
              "keyFacts": ["Dedicated to one function — all other capabilities removed", "More secure: smaller codebase = fewer vulnerabilities", "More reliable: cannot be disrupted by other software", "Cannot be repurposed without replacement", "Examples: kiosk systems, ATMs, smart appliance firmware"]
            },
            {
              "code": "A3.1.8",
              "term": "Multi-User Operating System",
              "definition": "An OS that allows multiple users to access and use the same computer or system simultaneously — each with their own profile, permissions, and isolated environment.",
              "examples": "Linux server supporting dozens of simultaneous SSH (remote terminal) users; Windows Server with Remote Desktop Services; mainframe computers in banking.",
              "examTip": "Multi-user OS must manage access control carefully — users must not be able to access each other's files or disrupt each other's sessions. Links to A3.2.6 (user accounts).",
              "keyFacts": [
                "Each user has isolated session — cannot access other users' data",
                "User authentication required to log in and access their profile",
                "OS manages resource allocation between users",
                "Linux is inherently multi-user — designed for server use with multiple concurrent logins",
                "Links to network OS: many users connecting to a server"
              ],
              "comparisonTable": {
                "title": "Operating System Types Compared",
                "headers": ["OS Type", "Key characteristic", "Best for", "Example"],
                "rows": [
                  ["Batch", "Processes jobs in groups without user interaction", "High-volume routine processing", "Bank overnight payment runs"],
                  ["Distributed", "Multiple computers act as one", "Cloud computing, large-scale processing", "Google Search infrastructure"],
                  ["Multitasking", "Multiple programs appear to run simultaneously", "General-purpose desktop and laptop use", "Windows 11, macOS"],
                  ["Network OS", "Manages shared network resources", "Office server managing files and users", "Windows Server, Linux Server"],
                  ["Real-time (RTOS)", "Guaranteed response within fixed time", "Safety-critical embedded systems", "ABS controller, pacemaker"],
                  ["Mobile OS", "Touch-optimised, battery-efficient", "Smartphones and tablets", "iOS, Android"],
                  ["Single-use", "One dedicated function only", "Kiosks, ATMs, appliances", "ATM software, POS terminal"],
                  ["Multi-user", "Multiple simultaneous users with isolated sessions", "Servers accessed by many users", "Linux server, mainframe"]
                ]
              }
            }
          ]
        },
        {
          "code": "A3.2",
          "title": "Role of the Operating System in Managing",
          "items": [
            {
              "code": "A3.2.1",
              "term": "Networking",
              "definition": "The OS manages network connectivity — implementing protocols, establishing and maintaining connections, transmitting and receiving data, and monitoring and allocating network resources.",
              "examTip": "OS networking functions: protocols (TCP/IP), connections (establishing/dropping), data transmission (sending/receiving packets), resource monitoring (checking bandwidth usage). All four parts of the spec definition are examinable.",
              "keyFacts": ["Implements network protocols (TCP/IP, DNS, DHCP)", "Manages NIC (Network Interface Card) — establishes and tears down connections", "Transmits data by packaging it into packets; receives and reassembles incoming packets", "Monitors network resource usage — bandwidth allocation between applications", "Configures IP addresses, subnet masks, and gateway settings"]
            },
            {
              "code": "A3.2.2",
              "term": "Security",
              "definition": "The OS enforces security by controlling who can access the system and its resources — through access control, malware protection, encryption, and firewall management.",
              "examTip": "OS security covers four areas the spec names: access control, malware protection, encryption, firewall. Know what each does and why it's the OS's responsibility.",
              "keyFacts": ["Access control: user authentication (login) and authorisation (what each user can do)", "Malware protection: OS may include built-in antivirus (Windows Defender); manages AV software", "Encryption: OS can encrypt the hard drive (BitLocker on Windows) and manage certificates", "Firewall: OS-level firewall controls inbound/outbound network traffic"]
            },
            {
              "code": "A3.2.3",
              "term": "Memory Management",
              "definition": "The OS allocates RAM to running processes, ensures processes don't interfere with each other's memory, and uses virtual memory when physical RAM is exhausted.",
              "examTip": "The spec explicitly names: allocation/deallocation, memory protection, virtual memory, swapping and paging. Virtual memory uses hard disk space as overflow RAM — much slower, but prevents crashes.",
              "keyFacts": [
                "Allocation: assigns RAM blocks to processes when they start",
                "Deallocation: frees RAM when processes end",
                "Memory protection: processes cannot read/write each other's memory — prevents crashes and security breaches",
                "Virtual memory: uses part of hard disk/SSD as if it were RAM when physical RAM is full",
                "Swapping: moves entire process from RAM to disk (swap space) when RAM is needed",
                "Paging: divides memory into fixed-size pages; swaps individual pages (more efficient than full process swapping)"
              ]
            },
            {
              "code": "A3.2.4",
              "term": "Multi-Tasking",
              "definition": "The OS manages the execution of multiple processes simultaneously by scheduling CPU time, managing processor time fairly, and switching context between processes.",
              "examTip": "The spec names: process scheduling, CPU time management, context switching. Process scheduling algorithms (Round Robin, Priority) determine which process runs next.",
              "keyFacts": [
                "Process scheduling: decides which process gets CPU time and for how long",
                "Round robin scheduling: each process gets a fixed time slice in turn",
                "Priority scheduling: higher-priority processes (e.g. OS itself, real-time tasks) run before lower-priority ones",
                "Context switching: saves the state of one process and loads the state of another — enables switching",
                "CPU time management: ensures no single process monopolises the CPU",
                "More processes/threads than CPU cores = more context switching = more overhead"
              ]
            },
            {
              "code": "A3.2.5",
              "term": "Device Drivers",
              "definition": "Software that enables the OS to communicate with hardware devices — acting as a translator between the standardised OS commands and the specific hardware's interface.",
              "examTip": "Device drivers = translator between OS and hardware. Without the correct driver, the OS cannot use a device. The spec names: installation/loading, communication, management/updates, error handling, resource allocation.",
              "keyFacts": [
                "Installation: driver installed when new hardware is connected; OS may find it automatically",
                "Loading: OS loads driver into memory when device is detected",
                "Communication: driver translates OS requests into device-specific commands",
                "Error handling: driver detects and reports device errors to the OS",
                "Resource allocation: driver manages IRQs, memory addresses, and I/O ports for the device",
                "Updates: outdated drivers can cause instability or security vulnerabilities — must be kept updated"
              ]
            },
            {
              "code": "A3.2.6",
              "term": "User Accounts",
              "definition": "The OS manages user identities — verifying who users are (authentication), storing their preferences and settings (profiles), and providing tools to create, modify, and delete accounts.",
              "examTip": "The spec names: user authentication, user profiles, account management tools. Authentication verifies identity; authorisation (covered in A3.2.2 and D2.1.2) controls what authenticated users can do.",
              "keyFacts": [
                "User authentication: verifies identity via password, PIN, biometric, or MFA",
                "User profiles: each user has personalised settings, desktop, files, and permissions stored separately",
                "Account types: administrator (full access), standard user (limited access), guest (minimal access)",
                "Account management tools: add/remove users, reset passwords, set expiry dates, assign groups",
                "Single Sign-On (SSO): one login grants access to multiple connected systems"
              ]
            }
          ]
        },
        {
          "code": "A3.3",
          "title": "Types, Uses and Features of Software",
          "items": [
            {
              "code": "A3.3.1",
              "term": "Utility Software",
              "definition": "Programs designed to help manage, maintain, and optimise a computer system's hardware and software — performing housekeeping and maintenance tasks.",
              "examples": "Disk defragmenter; antivirus software; backup software; file compression tools (WinZip); disk cleanup; system monitoring tools; screen capture utilities.",
              "examTip": "Utility software = system maintenance and management. It doesn't create user content — it looks after the system. Contrast with application software (which is used to create content or perform productive work).",
              "keyFacts": [
                "Antivirus: scans for and removes malware",
                "Disk defragmenter: reorganises fragmented files on HDDs for faster access",
                "Backup software: automates creation of data backups",
                "File compression: reduces file sizes for storage or transmission (ZIP, RAR)",
                "System monitor: shows CPU, RAM, disk usage in real time",
                "Task manager: views and ends running processes"
              ]
            },
            {
              "code": "A3.3.2",
              "term": "Application Software",
              "definition": "Programs designed to help users perform specific productive tasks — creating content, processing data, communicating, or accessing information.",
              "examples": "Microsoft Word (word processing); Excel (spreadsheet); Adobe Photoshop (image editing); Chrome (web browser); Slack (communication); Xero (accounting).",
              "examTip": "Application software = software users run to DO things and CREATE output. Contrast with utility software (which maintains the system) and the OS (which manages hardware/software).",
              "keyFacts": [
                "Word processors: create/edit text documents",
                "Spreadsheets: numerical data, calculations, charts",
                "Database software: store and query structured data",
                "Web browsers: access and display web content",
                "Email clients: send and receive email",
                "Graphics software: image/video editing",
                "Can be general purpose (Office) or specialist (CAD for architects)"
              ]
            }
          ]
        },
        {
          "code": "A3.4",
          "title": "Factors Impacting Choice of OS and Application Software",
          "items": [
            {
              "code": "A3.4.1",
              "term": "Cost",
              "definition": "The financial outlay for purchasing, licensing, and maintaining software — including one-off purchase cost, subscription fees, and support costs.",
              "examTip": "Compare: open source (free/low cost, community support) vs proprietary (licence cost, vendor support). Also consider total cost of ownership — training, migration, and ongoing subscriptions.",
              "keyFacts": ["One-off licence vs subscription model (SaaS)", "Open source alternatives often free (LibreOffice vs Microsoft Office)", "Enterprise licences: bulk pricing for organisations", "Hidden costs: training, support, migration from current system"]
            },
            {
              "code": "A3.4.2",
              "term": "Security",
              "definition": "How well the software protects data and systems — including frequency of security updates, known vulnerabilities, and built-in security features.",
              "examTip": "Security is a critical factor — especially for OS choice. Less popular OSes may have fewer targeted attacks; proprietary vendors may respond faster to vulnerabilities than open-source communities.",
              "keyFacts": ["Regular security patches required — must be applied promptly", "Market share effect: Windows is the most targeted OS because it has the most users", "Some proprietary vendors have dedicated security response teams", "Open source: code is visible — both security researchers AND attackers can examine it"]
            },
            {
              "code": "A3.4.3",
              "term": "Hardware and Software Compatibility",
              "definition": "Whether the software works with the existing hardware and other software already in use by the organisation.",
              "examTip": "Compatibility failures make software unusable regardless of other advantages. Check: minimum hardware specs, driver availability for peripherals, file format compatibility with existing data.",
              "keyFacts": ["Minimum hardware requirements: RAM, CPU, storage must meet thresholds", "Peripheral drivers: does new OS have drivers for all existing printers, scanners, etc.?", "File format compatibility: can new software open/edit existing files?", "API compatibility: does new software integrate with existing systems?"]
            },
            {
              "code": "A3.4.4",
              "term": "Features",
              "definition": "Whether the software offers all the functionality required by the organisation or user — including specialist tools, customisation options, and supported workflows.",
              "examTip": "Features must match the specific use case. A powerful feature set the user doesn't need adds cost and complexity without benefit.",
              "keyFacts": ["Must meet specific user/business requirements", "Excess features: increase complexity, cost, and learning curve", "Specialist features may only exist in proprietary software (e.g. specific CAD tools)", "Customisability: can it be adapted to specific workflows?"]
            },
            {
              "code": "A3.4.5",
              "term": "Business and/or User Needs",
              "definition": "Whether the software aligns with the specific operational requirements of the organisation and the practical needs of the people who will use it.",
              "examTip": "Always start with user and business needs when justifying software choices in exam scenarios. What tasks must it perform? Who will use it? What is their technical skill level?",
              "keyFacts": ["Must perform all required business functions without excessive workarounds", "User skill level affects which interface is appropriate (CLI vs GUI)", "Industry-standard software may be required for compatibility with clients/suppliers", "Scalability: will it still meet needs as the organisation grows?"]
            },
            {
              "code": "A3.4.6",
              "term": "Performance",
              "definition": "How efficiently the software runs on available hardware — including speed, reliability, and resource consumption (CPU, RAM, disk).",
              "examTip": "Performance links to hardware requirements (A3.4.3). Heavy software on underpowered hardware = poor performance = reduced productivity. Always consider whether current hardware can run new software adequately.",
              "keyFacts": ["Response time: how quickly does the software react to user input?", "Resource usage: does it consume excessive RAM/CPU that slows down other processes?", "Stability: does it crash or become unresponsive under load?", "Scalability: does performance degrade as data volume or users increase?"]
            }
          ]
        },
        {
          "code": "A3.5",
          "title": "Types of User Interface",
          "items": [
            {
              "code": "A3.5.1",
              "term": "Command Line Interface (CLI)",
              "definition": "A text-based interface where the user types commands directly to interact with the operating system or software. No graphics — purely text input and output.",
              "examples": "Windows Command Prompt; Linux/macOS Terminal; PowerShell; FTP command-line client.",
              "examTip": "CLI = fast for experts, powerful, scriptable. But steep learning curve — must memorise commands. Used by IT professionals, developers, and system administrators.",
              "keyFacts": ["User types commands as text — no mouse needed", "Fast and powerful for experienced users", "Scriptable: sequences of commands saved as scripts for automation", "Minimal resources: runs on very low-spec hardware", "No help or guidance — user must know the correct syntax"]
            },
            {
              "code": "A3.5.2",
              "term": "Menu-Driven Interface",
              "definition": "An interface where users select from a list of predefined options — navigating through menus to reach the desired function. No need to remember commands.",
              "examples": "ATM machine menus; DVD/Blu-ray player menus; phone IVR systems ('press 1 for sales, press 2 for support'); early text-adventure game interfaces.",
              "examTip": "Menu-driven = limited options, user guided through choices. Cannot do anything not listed in the menus. Good for non-technical users and kiosk/dedicated systems.",
              "keyFacts": ["User selects from limited set of options — cannot go 'off-script'", "No prior knowledge required — self-explanatory", "Slow for expert users — must navigate menus each time", "Used in kiosks, ATMs, medical equipment, set-top boxes"]
            },
            {
              "code": "A3.5.3",
              "term": "Graphical User Interface (GUI)",
              "definition": "An interface using visual elements — windows, icons, menus, and a pointer (WIMP) controlled by a mouse or keyboard — allowing intuitive interaction with software and files.",
              "examples": "Windows 11 desktop; macOS Finder; web browser with visual tabs; Microsoft Word with ribbon toolbar.",
              "examTip": "GUI = WIMP (Windows, Icons, Menus, Pointer). Most accessible to non-technical users. Requires more hardware resources than CLI. Drag-and-drop, right-click menus, and toolbar buttons are all GUI features.",
              "keyFacts": ["WIMP: Windows, Icons, Menus, Pointer", "Intuitive — visual metaphors (trash can = delete)", "Requires mouse or pointing device (or keyboard shortcuts)", "More hardware resources than CLI", "Less efficient for expert users than CLI for repetitive tasks", "Standard for desktop and laptop computers"]
            },
            {
              "code": "A3.5.4",
              "term": "Touchscreen Graphical User Interface",
              "definition": "A GUI adapted for direct finger or stylus interaction on a touchscreen — replacing the mouse pointer with touch gestures (tap, swipe, pinch-to-zoom).",
              "examples": "iOS on iPhone; Android on a smartphone; iPad interface; self-service supermarket checkout; interactive museum display.",
              "examTip": "Touchscreen GUI = GUI adapted for touch. Same visual elements as GUI but designed for larger touch targets, no hover states, and gesture-based navigation. Ideal for mobile and kiosk devices.",
              "keyFacts": ["No mouse required — direct finger/stylus interaction", "Gestures: tap (click), double-tap (double-click), swipe (scroll/navigate), pinch (zoom)", "Touch targets must be larger than mouse click targets — affects design", "Suitable for mobile devices, kiosks, point-of-sale terminals", "Can be combined with keyboard/mouse (e.g. Microsoft Surface, hybrid laptops)"]
            }
          ]
        },
        {
          "code": "A3.6",
          "title": "Principles and Implications of Open Source and Proprietary Software",
          "items": [
            {
              "code": "A3.6.1",
              "term": "Open Source vs Proprietary Operating Systems",
              "definition": "Open source OS: source code is publicly available, can be modified and redistributed (e.g. Linux). Proprietary OS: source code is closed, owned by a company, cannot be modified (e.g. Windows, macOS).",
              "examples": "Linux (open source) vs Windows 11 (proprietary); Android (open source, modified by manufacturers) vs iOS (proprietary, Apple-controlled).",
              "examTip": "Both sides of the open source vs proprietary debate appear in exam questions. For max marks: give balanced advantages AND disadvantages of each, not just one side.",
              "keyFacts": [
                "Open source OS examples: Linux (Ubuntu, Fedora, Debian), Android",
                "Proprietary OS examples: Windows (Microsoft), macOS/iOS (Apple)",
                "Open source: free to use, modify, distribute; community-developed and maintained",
                "Open source risk: support relies on community; less polished UI; driver compatibility can be patchy",
                "Proprietary: vendor-controlled, consistent experience, dedicated support",
                "Proprietary risk: licence cost; vendor dependency (vendor lock-in); closed code = users must trust vendor"
              ],
              "comparisonTable": {
                "title": "Open Source vs Proprietary Software",
                "headers": ["Feature", "Open Source", "Proprietary"],
                "rows": [
                  ["Source code", "Publicly available — can be viewed, modified, redistributed", "Closed — only vendor can access and modify"],
                  ["Cost", "Usually free (or very low cost)", "Licence fee required (one-off or subscription)"],
                  ["Support", "Community forums, documentation, optional paid support", "Vendor provides dedicated support (often included or paid)"],
                  ["Security", "Many eyes on the code — bugs found quickly; also visible to attackers", "Vendor controls patches; smaller attack surface visibility; faster coordinated response"],
                  ["Customisation", "Highly customisable — modify code for specific needs", "Limited customisation — only features vendor provides"],
                  ["Compatibility", "May have driver/compatibility issues with some hardware or proprietary formats", "Designed to work with mainstream hardware; vendor-controlled ecosystem"],
                  ["Updates", "Community-driven — frequency varies", "Vendor-controlled — regular scheduled updates"],
                  ["Vendor lock-in", "Low — can switch, fork, or modify freely", "High — difficult/expensive to migrate away"],
                  ["OS examples", "Linux (Ubuntu, Fedora), Android", "Windows, macOS, iOS"],
                  ["Software examples", "LibreOffice, Firefox, VLC, WordPress", "Microsoft Office, Adobe Photoshop, Windows"]
                ]
              }
            },
            {
              "code": "A3.6.2",
              "term": "Open Source vs Proprietary Application Software",
              "definition": "The same open source vs proprietary distinction applied to application software — covering productivity tools, media players, development tools, and specialist applications.",
              "examples": "LibreOffice (open source) vs Microsoft Office 365 (proprietary); GIMP (open source) vs Adobe Photoshop (proprietary); Firefox (open source) vs Safari (proprietary).",
              "examTip": "Same principles as A3.6.1 but applied to applications. Key addition: file format compatibility — proprietary apps often use proprietary formats that may not open correctly in open source alternatives.",
              "keyFacts": [
                "File format compatibility: Microsoft Word .docx files may have minor formatting issues in LibreOffice Writer",
                "Feature parity: open source alternatives may lack some advanced features of premium proprietary software",
                "Professional tooling: some industries require specific proprietary tools (e.g. Adobe Creative Suite in media)",
                "TCO (Total Cost of Ownership): open source saves licence fees but may cost more in support and integration"
              ]
            }
          ]
        },
        {
          "code": "A3.7",
          "title": "Features of Common File Types and Formats",
          "items": [
            {
              "code": "A3.7.1",
              "term": "Image File Formats",
              "definition": "Digital image formats vary in how they compress and store pixel data — affecting file size, quality, and compatibility with different applications and devices.",
              "examples": "JPEG for web photos; PNG for logos; GIF for simple animations; SVG for scalable icons; RAW for professional photography.",
              "examTip": "This overlaps with B3.4.1 — same content. Exam tip: JPEG = lossy (photos); PNG = lossless (transparency); SVG = vector (infinitely scalable); RAW = unprocessed (largest, highest quality).",
              "keyFacts": ["JPEG: lossy, 24-bit colour, small files — web photos, digital cameras", "PNG: lossless, transparency support — logos, web graphics", "GIF: lossless, 256 colours max, animation support", "SVG: vector format, XML-based — scalable without quality loss", "RAW: uncompressed camera sensor data — editing master file"]
            },
            {
              "code": "A3.7.2",
              "term": "Audio File Formats",
              "definition": "Digital audio formats use different compression schemes, affecting file size and audio quality.",
              "examples": "MP3 for music streaming; WAV for professional studio recording; AAC for Apple devices; FLAC for lossless music archiving.",
              "examTip": "Same as B3.4.2. MP3/AAC = lossy streaming. WAV/FLAC = lossless production/archiving. Bit rate determines quality — higher bit rate = better sound but larger file.",
              "keyFacts": ["MP3: lossy — small file, widely compatible", "AAC: lossy — better quality than MP3 at same bit rate; used by Apple", "WAV: uncompressed — professional quality, large files", "FLAC: lossless — smaller than WAV but identical quality; for audiophiles"]
            },
            {
              "code": "A3.7.3",
              "term": "Video File Formats",
              "definition": "Digital video formats combine a container format (which holds the file) and a codec (which compresses the video and audio streams).",
              "examples": "MP4 (H.264) for online video; MKV for high-quality with multiple subtitle tracks; MOV for Apple editing; AVI as a legacy format.",
              "examTip": "Same as B3.4.3. Container (MP4, MKV) + codec (H.264, H.265) = video file. H.265 = half the file size of H.264 at same quality — critical for 4K.",
              "keyFacts": ["MP4 + H.264: most compatible — web, social media, streaming", "MP4 + H.265: 50% smaller — 4K streaming, modern devices", "MKV: flexible container, multiple audio/subtitle tracks", "Bitrate controls quality — higher bitrate needs more storage and bandwidth"]
            },
            {
              "code": "A3.7.4",
              "term": "Application Software File Formats",
              "definition": "Executable and installer formats specific to each operating system, used for distributing and installing software applications.",
              "examples": "EXE/MSI for Windows; DMG/PKG for macOS; APK for Android; DEB/RPM for Linux distributions.",
              "examTip": "Same as B3.4.4. Each OS uses different formats for software distribution. Security note: only download software from trusted sources and verify digital signatures to avoid malware.",
              "keyFacts": ["EXE (Windows executable): runs programs directly", "MSI (Windows Installer): managed installation with uninstall support", "APK (Android): Android app package — used for sideloading", "DMG (macOS): disk image containing application", "ZIP/RAR: common wrapper for distributing multiple files — must be extracted first"]
            }
          ]
        }
      ]
    },
    {
      "code": "A4",
      "title": "Choosing IT Systems",
      "subtopics": [
        {
          "code": "A4.1",
          "title": "Factors Affecting the Choice of IT Systems",
          "items": [
            {
              "code": "A4.1.1",
              "term": "User Needs",
              "definition": "The specific requirements of the people who will use the IT system — what tasks they need to perform, their technical skill level, their mobility needs, and their accessibility requirements.",
              "examTip": "User needs always come first in system selection. Identify the primary users: are they technical staff, shop floor workers, office workers, customers? Each has very different needs.",
              "keyFacts": ["Primary users must be identified before system selection begins", "Skill level affects interface choice (GUI vs CLI, complexity)", "Accessibility needs may mandate specific assistive technology compatibility", "Mobile vs fixed: do users need to move around or stay at one desk?"]
            },
            {
              "code": "A4.1.2",
              "term": "Specifications",
              "definition": "The technical requirements the IT system must meet — minimum hardware performance, software capabilities, storage capacity, and connectivity requirements.",
              "keyFacts": ["Defines minimum acceptable performance thresholds", "Must be based on actual user/business needs — not assumed", "Includes: CPU speed, RAM, storage capacity, screen resolution, connectivity ports", "Used to shortlist and evaluate candidate systems objectively"]
            },
            {
              "code": "A4.1.3",
              "term": "Compatibility",
              "definition": "Whether the new IT system works with existing systems, software, file formats, and hardware already in use.",
              "keyFacts": ["Must work with existing peripherals, software, and data formats", "Operating system compatibility: does existing software run on the new OS?", "Network compatibility: does it support the organisation's network protocols and infrastructure?", "Migration: can existing data be imported without loss or corruption?"]
            },
            {
              "code": "A4.1.4",
              "term": "Connectivity",
              "definition": "The types of network and peripheral connections the IT system supports — ensuring it can connect to the internet, the organisation's network, and all required devices.",
              "keyFacts": ["Network connectivity: Ethernet, Wi-Fi, Bluetooth — which are present and at what speed?", "Peripheral ports: USB-A, USB-C, Thunderbolt, HDMI — must match required peripherals", "Mobile connectivity: 4G/5G for systems used outside of fixed network coverage", "Remote access capability: VPN support, remote desktop"]
            },
            {
              "code": "A4.1.5",
              "term": "Cost",
              "definition": "The total financial cost of procuring, deploying, and running the IT system — including purchase/lease, setup, training, maintenance, and eventual replacement.",
              "examTip": "Always consider total cost of ownership (TCO), not just purchase price. Hidden costs: training, maintenance, support contracts, software licences, power consumption.",
              "keyFacts": ["Capital cost: upfront purchase or leasing cost", "Operational cost: maintenance, support, power, licences, upgrades", "Training cost: staff time and materials to reach competency", "Disposal cost: responsible hardware disposal at end of life", "ROI: does the system generate sufficient value to justify the cost?"]
            },
            {
              "code": "A4.1.6",
              "term": "Efficiency",
              "definition": "How well the IT system uses resources (time, money, hardware) to deliver its required functions — balancing performance output against resource consumption.",
              "keyFacts": ["Energy efficiency: lower power consumption reduces running costs and environmental impact", "Processing efficiency: faster processing completes tasks in less time", "Storage efficiency: compression and deduplication reduce storage costs", "Workflow efficiency: reduces manual steps and automates repetitive processes"]
            },
            {
              "code": "A4.1.7",
              "term": "Implementation (Timescales, Testing, Migration, Downtime)",
              "definition": "The practical considerations of deploying the new IT system — including how long it will take, how it will be tested, how existing data will be migrated, and how much disruption will occur.",
              "examTip": "The spec explicitly names four sub-considerations: timescales, testing, migration, downtime. Include all four in extended responses about system implementation.",
              "keyFacts": [
                "Timescales: realistic project planning — deployment often takes weeks or months",
                "Testing: acceptance testing, user acceptance testing (UAT), performance testing before go-live",
                "Migration: moving existing data to new system — risk of data corruption or loss",
                "Downtime: old system taken offline while new system comes online — disrupts business operations",
                "Phased rollout: gradual deployment to reduce risk of full system failure",
                "Parallel running: old and new systems run simultaneously to validate new system before switching over"
              ]
            },
            {
              "code": "A4.1.8",
              "term": "Productivity",
              "definition": "The impact of the new IT system on the efficiency and output of employees — whether it enables them to work faster, more accurately, or with less effort.",
              "keyFacts": ["New system should improve on existing performance once fully adopted", "Short-term productivity dip during transition as users learn new system", "Automation: new system may automate tasks currently done manually", "Collaboration: improved collaboration tools can increase team productivity"]
            },
            {
              "code": "A4.1.9",
              "term": "Security",
              "definition": "The security features of the new IT system — including built-in protections, update frequency, compliance with security standards, and compatibility with existing security infrastructure.",
              "keyFacts": ["Does the system receive regular security updates from the vendor?", "Is it compatible with existing security tools (antivirus, firewall, SIEM)?", "Does it support required authentication methods (MFA, SSO, biometrics)?", "Compliance: does it meet industry security standards (ISO 27001, PCI DSS, GDPR requirements)?"]
            }
          ]
        },
        {
          "code": "A4.2",
          "title": "IT System Uses in Organisations",
          "items": [
            {
              "code": "A4.2.1",
              "term": "Stock Control",
              "definition": "IT systems that track inventory levels in real time, automatically reorder stock when it falls below threshold levels, and provide reports on stock movement and value.",
              "examples": "A supermarket's EPOS system decrementing stock counts when items are scanned at checkout; an Amazon warehouse management system tracking millions of SKUs; a pharmacy system flagging low medicine stock for reorder.",
              "examTip": "Stock control systems link to EPOS (input), databases (storage), and automated purchasing (output). Benefits: prevents stockouts, reduces overstock, improves cash flow. Risk: if system fails, stock visibility is lost.",
              "keyFacts": ["Barcode/RFID scanning updates stock levels automatically at point of sale", "Minimum stock level triggers automatic reorder to supplier", "Reduces manual stock counting — saves time and labour cost", "Real-time visibility: managers see current stock levels from any location", "Links to just-in-time (JIT) supply chain management"]
            },
            {
              "code": "A4.2.2",
              "term": "Data Logging",
              "definition": "Automated, continuous recording of sensor readings or system events over time — creating a time-stamped log for analysis, monitoring, or compliance purposes.",
              "examples": "A weather station recording temperature, humidity, and wind speed every minute; factory sensors logging machine temperature and pressure; a server logging all access attempts with timestamps.",
              "examTip": "Data logging = automated, continuous, time-stamped. Key exam use cases: environmental monitoring, security audit trails, scientific experiments, industrial process control. Link to IoT sensors (A1.1.9).",
              "keyFacts": ["Continuous or interval-based automatic recording — no human intervention needed", "Timestamp on each record: essential for analysis of trends over time", "Used in: weather monitoring, factory process control, security systems, scientific research", "Large volumes of data generated — requires appropriate storage and database", "Analysed after collection to identify trends, anomalies, or compliance evidence"]
            },
            {
              "code": "A4.2.3",
              "term": "Data Analysis",
              "definition": "Using IT systems to process and interpret large datasets to identify patterns, trends, and insights that inform business decisions.",
              "examples": "A retailer analysing sales data to identify which products to promote; a healthcare organisation analysing patient outcomes to improve treatment protocols; a bank detecting fraud patterns in transaction data.",
              "examTip": "Data analysis converts raw data into actionable insights. Link to big data, business intelligence (BI) tools, and AI-driven analytics (A5).",
              "keyFacts": ["BI (Business Intelligence) tools: dashboards and reports from databases (e.g. Tableau, Power BI)", "Predictive analytics: uses historical data to forecast future trends", "Big data: analysis of extremely large datasets that traditional databases cannot handle", "Supports evidence-based decision making — replaces gut instinct with data"]
            },
            {
              "code": "A4.2.4",
              "term": "General Office Tasks",
              "definition": "IT systems used for everyday administrative and business functions — word processing, spreadsheets, email, scheduling, and document management.",
              "examples": "Microsoft 365 for documents, email, and calendar; SharePoint for document management; Teams for communication; Zoom for video meetings.",
              "keyFacts": ["Productivity suites: Word, Excel, PowerPoint, Outlook — standard in most organisations", "Cloud-based versions (Microsoft 365, Google Workspace) enable collaboration from anywhere", "Email and calendar management critical for coordination", "Document management systems (DMS) ensure version control and access management"]
            },
            {
              "code": "A4.2.5",
              "term": "Creative Tasks",
              "definition": "IT systems used for design, media production, animation, and other creative outputs.",
              "examples": "Adobe Creative Cloud (Photoshop, Premiere, After Effects) for media production; AutoCAD for architectural drawings; Blender for 3D animation.",
              "keyFacts": ["Requires high-specification hardware: powerful GPU, large RAM, colour-accurate display", "Software subscription models now common (Adobe Creative Cloud)", "Large file sizes: video and high-resolution images require fast storage and significant capacity", "Collaboration tools for creative teams: version control for assets, shared project files"]
            },
            {
              "code": "A4.2.6",
              "term": "Advertising",
              "definition": "IT systems used to create, target, deliver, and measure the effectiveness of advertising campaigns.",
              "examples": "Google Ads targeting users based on search terms; Facebook Ads Manager for demographic targeting; digital signage in retail stores; programmatic advertising platforms.",
              "keyFacts": ["Digital advertising: precisely targeted using demographic and behavioural data", "Analytics: real-time measurement of ad performance (click-through rates, conversions)", "Links to targeted marketing (E1.2.2) and data ethics (F1.1)", "Programmatic advertising: automated buying and placement of adverts using algorithms"]
            },
            {
              "code": "A4.2.7",
              "term": "Manufacturing",
              "definition": "IT systems that control, monitor, and optimise manufacturing processes — from design (CAD/CAM) through production (CNC, robotics) to quality control.",
              "examples": "CAD software designing components; CAM converting CAD designs to machine instructions; CNC machines cutting parts to precise specifications; quality control sensors detecting defects.",
              "keyFacts": ["CAD (Computer-Aided Design): digital design of products", "CAM (Computer-Aided Manufacturing): converts design into machine instructions", "CNC (Computer Numerical Control): machines executing precise manufacturing programs", "SCADA systems: supervisory control monitoring large industrial processes", "IoT sensors on production line: real-time quality monitoring"]
            },
            {
              "code": "A4.2.8",
              "term": "Security",
              "definition": "IT systems used for physical and logical security — including CCTV, access control systems, intrusion detection, and cybersecurity monitoring.",
              "examples": "IP CCTV system monitoring a warehouse; biometric access control on a server room; SIEM (Security Information and Event Management) system monitoring network traffic for threats.",
              "keyFacts": ["IP CCTV: networked cameras with remote viewing, motion detection, cloud recording", "Access control systems: swipe cards, biometrics controlling physical entry", "SIEM: aggregates security logs from across the network to detect threats", "Generates large amounts of data (video, logs) requiring significant storage"]
            },
            {
              "code": "A4.2.9",
              "term": "Automation",
              "definition": "Using IT systems to perform tasks with minimal or no human intervention — through programmed rules, robotic process automation (RPA), or AI-driven decision making.",
              "examples": "Automated payroll processing; robotic arms assembling products; chatbots handling customer service; automated invoice processing using OCR.",
              "keyFacts": ["RPA (Robotic Process Automation): software bots mimic human actions in digital systems", "Reduces labour cost for repetitive rule-based tasks", "Consistency: automation produces identical output every time — no human variation", "Ethical consideration: job displacement — automation replaces human workers"]
            }
          ]
        },
        {
          "code": "A4.3",
          "title": "Impact and Implications of IT Systems on Organisations",
          "items": [
            {
              "code": "A4.3.1",
              "term": "User Experience (Ease of Use, Performance, Availability, Accessibility)",
              "definition": "The overall quality of the experience employees and customers have when using an IT system — encompassing how intuitive it is, how quickly it responds, how reliably it is available, and whether all users can access it.",
              "examTip": "UX has four spec-named dimensions: ease of use, performance, availability, accessibility. Cover all four in extended responses about IT system impact.",
              "keyFacts": ["Ease of use: intuitive design reduces errors and training time", "Performance: slow systems reduce productivity and frustrate users", "Availability: downtime directly costs the business (lost sales, idle workers)", "Accessibility: systems must be usable by employees/customers with disabilities"]
            },
            {
              "code": "A4.3.2",
              "term": "Employee and Customer Needs",
              "definition": "Whether the IT system genuinely meets the requirements of both the people who operate it (employees) and the people who interact with it or its outputs (customers).",
              "keyFacts": ["Employees: must have the features they need, be intuitive, and not create extra work", "Customers: must be reliable, fast, and easy to use — negative customer experience costs the business", "Conflicting needs: what works for back-office staff may not work for customer-facing systems", "Feedback loops: ongoing collection of user feedback should drive system improvements"]
            },
            {
              "code": "A4.3.3",
              "term": "Cost",
              "definition": "The financial impact of implementing and running an IT system on the organisation — covering initial investment, ongoing operational costs, and expected return on investment.",
              "keyFacts": ["Capital expenditure: hardware, software licences, installation, infrastructure", "Ongoing costs: support, maintenance, licences, training refreshers, power", "ROI: measured in productivity gains, cost savings, revenue increase", "Hidden costs often underestimated: data migration, integration, change management"]
            },
            {
              "code": "A4.3.4",
              "term": "Implementation (Timescales, Testing, Migration, Downtime)",
              "definition": "The practical challenges of deploying a new IT system — including realistic project timelines, thorough testing, moving existing data safely, and managing disruption.",
              "examTip": "Same four sub-points as A4.1.7. Exam context here is about IMPACT on the organisation during and after implementation — not just planning considerations.",
              "keyFacts": ["Realistic timescales prevent rushed deployment that causes problems", "Testing must include user acceptance testing (UAT) with real users", "Data migration risk: data lost or corrupted in transition", "Downtime: business cannot operate normally — plan for off-peak or phased rollout"]
            },
            {
              "code": "A4.3.5",
              "term": "Replacement or Integration with Current Systems",
              "definition": "Whether the new IT system completely replaces existing systems or integrates alongside them — each approach has different risks, costs, and implications.",
              "examTip": "Full replacement: clean break, no legacy compatibility issues, but high risk and cost. Integration: lower risk, leverages existing investment, but creates complexity and potential data inconsistency.",
              "keyFacts": ["Full replacement: clean break — higher risk, higher cost, significant downtime", "Integration: new system works alongside existing — lower risk but added complexity", "Legacy system support: may need to maintain old system for years during transition", "API integration: new system connects to existing via APIs — enables data sharing without full replacement"]
            },
            {
              "code": "A4.3.6",
              "term": "Productivity",
              "definition": "The effect of the new IT system on the output and efficiency of the organisation's workforce — both during the transition period and once fully adopted.",
              "keyFacts": ["Initial productivity dip: users learning new system are slower", "Long-term gain: well-chosen system should outperform what it replaced", "Automation: removing manual steps frees staff for higher-value tasks", "Poorly implemented systems can permanently reduce productivity"]
            },
            {
              "code": "A4.3.7",
              "term": "Working Practices",
              "definition": "How the new IT system changes the way employees perform their jobs — including shifts to remote working, new workflows, changed roles, and altered communication patterns.",
              "keyFacts": ["Cloud systems enable remote and flexible working", "Collaborative tools change communication from email to real-time messaging", "Some job roles may become obsolete; new roles emerge", "Employees may resist change — change management is essential"]
            },
            {
              "code": "A4.3.8",
              "term": "Staff Training Needs (Initial and Ongoing)",
              "definition": "The training required to ensure employees can use the new IT system effectively — both when it is first introduced and as updates and new features are added.",
              "examTip": "Training has both a cost (time and money) and a duration — initial training gets users started, but ongoing training is needed as systems evolve. Insufficient training → errors, poor adoption, wasted investment.",
              "keyFacts": ["Initial training: must cover all staff before go-live — time and cost", "Ongoing training: as system updates, staff need refresher training", "Different training needs: power users vs occasional users vs administrators", "Training formats: in-person, e-learning, documentation, video tutorials"]
            },
            {
              "code": "A4.3.9",
              "term": "User Support",
              "definition": "The ongoing help and assistance provided to employees using the IT system — through internal helpdesks, vendor support contracts, online documentation, and self-service resources.",
              "keyFacts": ["Internal IT helpdesk: first line of support for most organisations", "Vendor support contracts: defined response times for critical issues", "Self-service: knowledge base, FAQs, video tutorials reduce helpdesk load", "Support costs should be budgeted as part of total cost of ownership"]
            },
            {
              "code": "A4.3.10",
              "term": "Security",
              "definition": "The security implications of deploying a new IT system — including new vulnerabilities introduced, security configuration required, and how the system interacts with existing security controls.",
              "keyFacts": [
                "New attack surface: any new system introduces potential new vulnerabilities",
                "Configuration: default settings are often insecure — must be hardened at deployment",
                "Patch management: ongoing security updates must be applied promptly",
                "Integration security: APIs connecting systems create additional security considerations",
                "User access: new system requires careful permissions configuration from day one"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "A5",
      "title": "Emerging Technologies",
      "subtopics": [
        {
          "title": "Emerging Technologies and AI",
          "items": [
            {
              "code": "A5.1",
              "term": "How Emerging Technologies and AI Affect IT System Performance",
              "definition": "Advances in artificial intelligence, quantum computing, edge computing, and 5G are changing what IT systems can do and how fast they can do it — enabling tasks that were previously impossible or impractically slow.",
              "examples": "AI-accelerated processors (Apple M-series, NVIDIA GPUs) dramatically speeding up machine learning tasks; edge computing reducing latency by processing data near its source; 5G enabling real-time communication for autonomous vehicles.",
              "examTip": "AI improves performance through: faster pattern recognition than rule-based systems, predictive optimisation (e.g. caching likely-needed data), hardware acceleration (dedicated AI chips). Emerging tech can also strain infrastructure — 5G requires new antenna networks; AI needs significant compute.",
              "keyFacts": [
                "AI chips (NPUs, TPUs, GPUs): process AI/ML workloads far faster than general-purpose CPUs",
                "Edge computing: processing data at/near the source reduces latency and bandwidth — critical for IoT and autonomous systems",
                "5G: up to 10 Gbps, sub-1ms latency — enables new real-time applications (autonomous vehicles, remote surgery)",
                "Quantum computing: theoretically solves certain problems exponentially faster than classical computers — currently limited to research",
                "AI optimisation: machine learning improves system performance over time by learning from usage patterns"
              ]
            },
            {
              "code": "A5.2",
              "term": "Implications of Emerging Technologies and AI on Personal Use of IT Systems",
              "definition": "How AI and emerging technologies are changing everyday personal use of devices and digital services — from smart assistants to personalised recommendations to AI-generated content.",
              "examples": "Siri/Alexa/Google Assistant using natural language processing to answer questions; Netflix/Spotify AI recommendation engines; deepfake tools generating convincing fake videos; AI writing assistants (ChatGPT).",
              "examTip": "Exam questions on personal AI implications often focus on benefits (convenience, accessibility) vs ethical concerns (privacy, job displacement, misinformation via deepfakes, dependency). Cover both sides.",
              "keyFacts": [
                "Smart assistants: NLP allows voice-based interaction with devices — improves accessibility",
                "Personalisation: AI tailors content, product recommendations, and search results to individual behaviour",
                "Deepfakes: AI-generated fake images/videos that appear real — major misinformation risk",
                "Privacy: AI systems require large amounts of personal data to function — raises GDPR concerns",
                "Dependency: increasing reliance on AI for decisions reduces critical thinking and autonomy",
                "AI in healthcare: diagnostic tools analysing medical images can detect conditions with high accuracy"
              ]
            },
            {
              "code": "A5.3",
              "term": "Implications of Emerging Technologies and AI on Organisations",
              "definition": "How AI and emerging technologies are reshaping how businesses operate — affecting processes, employment, competitive advantage, decision-making, and ethical responsibilities.",
              "examples": "Amazon using machine learning for demand forecasting and automated warehouses; banks using AI for fraud detection and credit scoring; HR departments using AI to screen CVs.",
              "examTip": "For organisation-level AI questions: cover efficiency gains, cost reduction, better decisions — AND job displacement, bias in AI systems, ethical concerns, and cybersecurity risks (AI also used by attackers). Both sides needed for Level 3.",
              "keyFacts": [
                "Automation of cognitive tasks: AI can now perform tasks previously requiring human intelligence (writing, image recognition, legal review)",
                "Improved decision making: data-driven AI insights replace slower, biased human intuition",
                "Competitive advantage: organisations using AI effectively can outpace competitors",
                "Job displacement: AI threatens white-collar as well as blue-collar roles — accountants, lawyers, radiologists",
                "Bias in AI: if training data reflects historical biases, AI perpetuates them (e.g. biased CV screening)",
                "Cybersecurity: AI used by attackers for sophisticated phishing, automated vulnerability scanning",
                "AI governance: organisations must ensure AI decisions are explainable and auditable"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_B = {
  "section": "B",
  "title": "Transmitting Data",
  "tier": 1,
  "colour": "#d69e2e",
  "topics": [
    {
      "code": "B1",
      "title": "Connectivity",
      "subtopics": [
        {
          "code": "B1.1",
          "title": "Wireless and Wired Connection Methods",
          "items": [
            {
              "code": "B1.1.1",
              "term": "Bluetooth",
              "definition": "A short-range wireless communication standard using radio waves in the 2.4 GHz band. Designed for low-power, device-to-device connections over short distances (typically up to 10 metres, up to 100 m for Bluetooth 5.x).",
              "examples": "Connecting wireless headphones to a phone; pairing a keyboard or mouse to a laptop; transferring files between phones; connecting a smartwatch to a mobile device.",
              "examTip": "Bluetooth = short-range, low-power, device pairing. Key limitation: short range and lower speed than Wi-Fi. Security risk: bluejacking (sending unsolicited messages) and bluesnarfing (unauthorised data access).",
              "keyFacts": [
                "Range: typically 10 m (Class 2); up to 100 m (Class 1 / Bluetooth 5.x)",
                "Speed: up to ~50 Mbps (Bluetooth 5.x); much lower in practice for most uses",
                "Low power consumption — suitable for wearables, IoT sensors, peripherals",
                "Point-to-point or small piconet (up to 7 active devices)",
                "Security risks: bluejacking (unsolicited messages), bluesnarfing (unauthorised data access)",
                "Pairing process required before data can be exchanged"
              ]
            },
            {
              "code": "B1.1.2",
              "term": "USB (Universal Serial Bus)",
              "definition": "A wired connection standard for transferring data and power between devices. Connects peripherals (keyboards, mice, storage devices, cameras) to computers via a physical cable.",
              "examples": "Connecting a USB flash drive to a laptop; charging a phone via USB-C; connecting a printer or external hard drive; transferring photos from a camera.",
              "examTip": "USB = wired, direct device-to-device, high speed, no network required. USB 3.x is significantly faster than USB 2.0. USB-C is the current universal standard.",
              "keyFacts": [
                "USB 2.0: up to 480 Mbps (High Speed)",
                "USB 3.0/3.1: up to 5–10 Gbps (SuperSpeed)",
                "USB 4 / Thunderbolt 4: up to 40 Gbps",
                "Also transfers power — charges devices while connecting",
                "No configuration required — plug and play",
                "Security risk: infected USB drives can introduce malware (see D1.2.4)"
              ]
            },
            {
              "code": "B1.1.3",
              "term": "Wi-Fi",
              "definition": "A wireless networking standard (IEEE 802.11) that uses radio waves to provide network and internet access. Devices connect to a wireless access point (WAP) or router, which manages network traffic.",
              "examples": "Connecting a laptop to a home or office network; a school providing Wi-Fi across campus; a coffee shop offering public guest Wi-Fi.",
              "examTip": "Wi-Fi = wireless network access, not device-to-device like Bluetooth. Key trade-offs vs Ethernet: mobility vs reliability/speed/security. Public Wi-Fi is a major security risk — data can be intercepted.",
              "keyFacts": [
                "Wi-Fi 5 (802.11ac): up to ~3.5 Gbps theoretical; Wi-Fi 6 (802.11ax): up to ~9.6 Gbps",
                "Range: typically 30–50 m indoors (reduced by walls, interference)",
                "2.4 GHz band: longer range, more congested, slower; 5 GHz: shorter range, faster, less congested",
                "Signal strength decreases with distance and physical obstacles",
                "Security: WPA3 is current standard; WEP is obsolete and insecure",
                "Public Wi-Fi risk: unencrypted hotspots allow man-in-the-middle attacks",
                "Supports multiple simultaneous devices — suitable for LANs"
              ]
            },
            {
              "code": "B1.1.4",
              "term": "Ethernet",
              "definition": "A wired networking standard (IEEE 802.3) that connects devices using physical cables — typically Cat5e/Cat6 twisted pair copper cables or fibre optic. Used in LANs and as the backbone of larger networks.",
              "examples": "Connecting a desktop PC to an office network via a RJ-45 cable; fibre optic Ethernet between buildings in a campus network; a gaming PC using Ethernet for low-latency online play.",
              "examTip": "Ethernet = reliable, fast, secure wired connection. Always faster and more reliable than Wi-Fi for a fixed device. Fibre optic Ethernet offers vastly higher speeds over longer distances than copper.",
              "keyFacts": [
                "Speeds: 100 Mbps (Fast Ethernet) → 1 Gbps (Gigabit) → 10 Gbps+ (10GbE)",
                "Copper (Cat6): up to 10 Gbps over 55 m; fibre optic: up to 100 Gbps over many km",
                "Lower latency than Wi-Fi — important for VoIP, video conferencing, gaming",
                "More secure than Wi-Fi — physically harder to intercept; no broadcast signal",
                "Not susceptible to radio interference",
                "Requires physical cable infrastructure — less flexible than wireless"
              ],
              "comparisonTable": {
                "title": "Connection Methods Compared: Bluetooth vs USB vs Wi-Fi vs Ethernet",
                "headers": ["Feature", "Bluetooth", "USB", "Wi-Fi", "Ethernet"],
                "rows": [
                  ["Type", "Wireless", "Wired", "Wireless", "Wired"],
                  ["Typical speed", "Up to 50 Mbps", "Up to 10 Gbps (USB 3.1)", "Up to 9.6 Gbps (Wi-Fi 6)", "Up to 10 Gbps+ (10GbE)"],
                  ["Range", "~10 m (up to 100 m)", "Length of cable only", "30–50 m indoors", "Up to 100 m (copper); km (fibre)"],
                  ["Mobility", "High — no cables", "None — physically tethered", "High — within coverage area", "None — physically tethered"],
                  ["Reliability", "Good; affected by interference", "Excellent — direct connection", "Good; affected by interference/walls", "Excellent — consistent"],
                  ["Security", "Moderate — pairing required; bluejacking risk", "High — physical access needed", "Lower — signal can be intercepted; WPA3 helps", "High — physically hard to intercept"],
                  ["Power supplied", "No (separate charging needed)", "Yes — powers/charges devices", "No", "Yes (PoE — Power over Ethernet)"],
                  ["Best use case", "Peripherals, wearables, short-range device pairing", "Direct device connection, storage, charging", "Mobile devices, multi-device networks", "Fixed workstations, servers, high-reliability needs"],
                  ["Setup required", "Pairing", "Plug and play", "Network config / password", "Physical cable + network config"]
                ]
              }
            }
          ]
        },
        {
          "code": "B1.2",
          "title": "How Connection Types Meet User/Organisation Needs",
          "items": [
            {
              "code": "B1.2",
              "term": "Matching Connection Types to User and Organisation Needs",
              "definition": "Different connection types suit different use cases. The right choice depends on what the user or organisation needs in terms of speed, mobility, range, cost, security, and the number of devices involved.",
              "examples": "A hospital choosing Ethernet for medical equipment needing reliable connections; a café offering Wi-Fi for customers; a warehouse using Bluetooth for handheld scanners; a data centre using fibre optic Ethernet between servers.",
              "examTip": "Exam scenarios often give you a situation and ask you to justify a connection choice. Always link technical features (speed, range, security) to the specific need in the scenario.",
              "keyFacts": [
                "Mobile workers / hotdesking → Wi-Fi (flexibility over speed)",
                "Fixed workstations needing high reliability → Ethernet",
                "Short-range peripherals (headset, mouse) → Bluetooth",
                "Direct file transfer or device charging → USB",
                "Public-facing access points → Wi-Fi with WPA3 security",
                "Server-to-server or backbone infrastructure → Fibre optic Ethernet",
                "IoT sensors in a small area → Bluetooth Low Energy (BLE)"
              ]
            }
          ]
        },
        {
          "code": "B1.3",
          "title": "Implications of Selecting Different Connection Types",
          "items": [
            {
              "code": "B1.3",
              "term": "Implications of Selecting and Using Different Connection Types",
              "definition": "Choosing a connection type has consequences beyond just speed — affecting security exposure, infrastructure cost, user behaviour, maintenance requirements, and operational flexibility.",
              "examples": "A business using only Wi-Fi saving on cable installation cost but increasing security risk; a school blocking USB ports to prevent data theft but making printer connections harder.",
              "examTip": "This code is about consequences of the choice. Use for 4–6 mark 'explain the implications of using X' questions — cover security, cost, performance, and user impact.",
              "keyFacts": [
                "Wi-Fi implication: easier to deploy but introduces security risks (rogue access points, eavesdropping)",
                "Ethernet implication: requires significant cabling infrastructure investment but provides reliability",
                "Bluetooth implication: convenient for peripherals but limited range restricts use cases",
                "USB implication: straightforward but organisations may need to restrict ports to prevent malware introduction or data theft",
                "Wireless generally: dependent on signal quality — physical obstacles, interference reduce performance",
                "Wired generally: infrastructure cost upfront but lower ongoing maintenance and better security"
              ]
            }
          ]
        },
        {
          "code": "B1.4",
          "title": "Impact of Connection Types on IT System Performance",
          "items": [
            {
              "code": "B1.4",
              "term": "How Connection Types Affect IT System Performance",
              "definition": "The type of connection used directly affects the speed, latency, reliability, and capacity of an IT system — determining how effectively users can work and how responsive applications feel.",
              "examples": "A video editing team switching from Wi-Fi to Gigabit Ethernet reducing file transfer time from 10 minutes to 30 seconds; a VoIP system experiencing dropped calls due to high Wi-Fi latency.",
              "examTip": "Link specific performance metrics to the connection type: Ethernet = low latency, high throughput; Wi-Fi = variable latency, affected by congestion; Bluetooth = low bandwidth, not suitable for high-data applications.",
              "keyFacts": [
                "Latency: wired connections have lower latency than wireless — critical for real-time applications",
                "Bandwidth: Ethernet (10 Gbps) >> Wi-Fi 6 (9.6 Gbps theoretical, lower in practice) >> Bluetooth (50 Mbps)",
                "Reliability: wired > wireless — interference, distance, obstacles don't affect wired",
                "Simultaneous users: Wi-Fi bandwidth shared among all connected devices — performance degrades with more users",
                "Jitter: variability in latency — worse on Wi-Fi, problematic for VoIP and video streaming",
                "USB performance limited by cable version — USB 2.0 bottlenecks high-speed storage devices"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "B2",
      "title": "Networks",
      "subtopics": [
        {
          "code": "B2.1",
          "title": "Network Topologies",
          "items": [
            {
              "code": "B2.1.1",
              "term": "Star Topology",
              "definition": "All devices connect individually to a central switch or hub using separate cables. The central device manages all communication between connected nodes.",
              "examples": "A typical office network where every PC, printer, and server connects back to a central network switch; a school computer lab with all machines cabled to one switch in the server room.",
              "examTip": "Star is the most common real-world topology. Key exam point: if ONE cable fails, only that device is affected — the rest keep working. If the CENTRAL SWITCH fails, ALL devices lose connection.",
              "keyFacts": [
                "Most common topology in modern networks",
                "Single cable failure only affects one device — fault tolerant for individual nodes",
                "Central switch failure brings down the entire network — single point of failure",
                "Easy to add or remove devices without disrupting others",
                "Easy to identify faults — cable tester on individual connections",
                "Higher cabling cost than bus — each device needs its own cable to the centre",
                "Performance does not degrade as more devices are added (unlike bus)"
              ]
            },
            {
              "code": "B2.1.2",
              "term": "Ring Topology",
              "definition": "All devices connect in a closed loop, with each device connected to exactly two others. Data travels in one direction (or both in dual-ring) around the ring until it reaches the destination.",
              "examples": "Early metropolitan area networks (MANs); some legacy FDDI (Fibre Distributed Data Interface) networks; token ring networks (largely obsolete today).",
              "examTip": "Ring topology = data travels in a loop. Key weakness: if ONE device or cable fails, the entire ring goes down (unless dual-ring). Largely obsolete in modern networks — but still on the spec.",
              "keyFacts": [
                "Each device connects to two neighbours forming a closed loop",
                "Data travels in one direction (unidirectional) — or both in dual-ring",
                "Token passing: only the device holding the 'token' can transmit — prevents collisions",
                "Single point of failure: one broken cable or failed device can break the entire ring",
                "Dual-ring: provides redundancy — traffic reroutes if one ring fails",
                "Difficult to add/remove devices — requires temporary shutdown of the ring",
                "Largely replaced by star topology in modern networks"
              ]
            },
            {
              "code": "B2.1.3",
              "term": "Bus Topology",
              "definition": "All devices connect to a single shared backbone cable (the bus). Data sent by any device travels along the entire bus in both directions and is received by all devices, but only the intended recipient processes it.",
              "examples": "Early Ethernet networks (10BASE2 using coaxial cable); simple temporary networks for small setups.",
              "examTip": "Bus topology = single shared cable. Key weakness: collision domain — only one device can transmit at a time; cable failure takes down the entire network. Largely obsolete in modern networks.",
              "keyFacts": [
                "Single shared cable (backbone) — all devices connected to it",
                "Only one device can transmit at a time — collision risk increases with more devices",
                "CSMA/CD (Carrier Sense Multiple Access with Collision Detection) manages collisions",
                "Cable failure or break disconnects all devices from the network",
                "Terminators required at each end of the bus to prevent signal reflection",
                "Low cost to set up — minimal cabling needed",
                "Performance degrades significantly as number of devices increases"
              ],
              "comparisonTable": {
                "title": "Network Topologies Compared",
                "headers": ["Feature", "Star", "Ring", "Bus"],
                "rows": [
                  ["Structure", "All devices connect to central switch", "Devices in a closed loop", "All devices on one shared backbone cable"],
                  ["Single device failure impact", "Only that device affected", "Can break entire ring (unless dual-ring)", "Only that device affected"],
                  ["Cable/switch failure impact", "Central switch failure = all down", "One cable break = all down", "Backbone cable failure = all down"],
                  ["Performance under load", "Good — switch manages traffic", "Moderate — token passing limits throughput", "Degrades — collisions increase with more devices"],
                  ["Ease of fault finding", "Easy — isolate individual cables", "Hard — must check entire ring", "Moderate — check backbone and termination"],
                  ["Cost", "Higher cabling cost (individual cables to centre)", "Moderate", "Low — minimal cabling"],
                  ["Scalability", "Easy — add devices to switch", "Hard — disrupts network", "Limited — performance degrades"],
                  ["Modern usage", "Very common (standard office/school network)", "Largely obsolete", "Largely obsolete"],
                  ["Diagram shape", "Hub-and-spoke (like a wheel)", "Circle", "Straight line with branches"]
                ]
              }
            }
          ]
        },
        {
          "code": "B2.2",
          "title": "Types of Networks",
          "items": [
            {
              "code": "B2.2.1",
              "term": "Personal Area Network (PAN)",
              "definition": "A very small network centred on an individual person, typically connecting personal devices over short distances (up to ~10 metres). Usually uses Bluetooth or USB.",
              "examples": "A phone connected to wireless earbuds and a smartwatch via Bluetooth; a laptop connected to a mouse and keyboard wirelessly; syncing a fitness tracker to a phone.",
              "examTip": "PAN = personal, short range, usually Bluetooth. It's the smallest network type — just your own devices communicating with each other.",
              "keyFacts": [
                "Range: typically up to 10 metres",
                "Technology: primarily Bluetooth, also USB, Zigbee (IoT)",
                "No infrastructure needed — direct device-to-device",
                "Low data transfer requirements for most PAN uses",
                "Only connects the individual's personal devices"
              ]
            },
            {
              "code": "B2.2.2",
              "term": "Local Area Network (LAN)",
              "definition": "A network covering a small geographic area — typically a single building, floor, or campus. The organisation owns and manages its own networking hardware (switches, cables, access points).",
              "examples": "A school network connecting all classrooms; an office network linking all employee PCs; a home network connecting computers, phones, and a smart TV.",
              "examTip": "LAN = organisation-owned, one site, high speed, low cost per connection. The organisation is responsible for all hardware and maintenance.",
              "keyFacts": [
                "Coverage: single building, floor, or small campus",
                "Organisation owns all hardware — switches, cables, WAPs",
                "High speed: typically 1 Gbps on wired Ethernet",
                "Low latency — devices are physically close",
                "Can use wired (Ethernet) and/or wireless (Wi-Fi) connections",
                "No per-megabyte data cost — internal traffic is free",
                "Connected to WAN/internet via a router at the network boundary"
              ]
            },
            {
              "code": "B2.2.3",
              "term": "Wide Area Network (WAN)",
              "definition": "A network spanning a large geographic area — across cities, countries, or continents. Uses third-party telecommunications infrastructure (leased lines, fibre optic cables, satellite) to link multiple LANs.",
              "examples": "A multinational company's network connecting offices in London, New York, and Tokyo; the internet itself is the largest WAN; a bank's network linking all branches nationwide.",
              "examTip": "WAN = connects multiple LANs over large distances using third-party infrastructure. Key distinction from LAN: organisation does NOT own the physical infrastructure — they lease it or pay a provider.",
              "keyFacts": [
                "Coverage: cities, countries, continents",
                "Organisation leases or buys access to third-party infrastructure",
                "Typically slower and higher latency than LAN due to distances",
                "Higher cost — ongoing payments to telecommunications providers",
                "Uses technologies: MPLS leased lines, broadband, fibre, satellite, 4G/5G",
                "Managed by ISPs and telecommunications companies",
                "The internet is technically the world's largest public WAN"
              ]
            },
            {
              "code": "B2.2.4",
              "term": "Virtual Private Network (VPN)",
              "definition": "A technology that creates an encrypted, private tunnel through a public network (usually the internet), allowing users to connect to a private network securely as if they were physically present on it.",
              "examples": "Remote employees connecting to the company intranet securely; a multinational connecting overseas offices over the internet instead of expensive leased lines; a user protecting their privacy on public Wi-Fi.",
              "examTip": "VPN is not a physical network — it's a technology layered on top of an existing network (usually the internet). Key benefit over dedicated WAN: much cheaper because it uses the existing public internet infrastructure.",
              "keyFacts": [
                "Tunnelling protocol: encapsulates data packets within an encrypted outer packet",
                "Encryption: all data within the tunnel is encrypted — cannot be read if intercepted",
                "Authentication: users must authenticate before connecting to the VPN",
                "IP masking: traffic appears to come from the VPN server, not the user's real IP",
                "Cost advantage: uses existing internet infrastructure — far cheaper than dedicated leased WAN lines",
                "Performance: encryption overhead adds some latency; speed depends on internet connection quality",
                "Protocols: OpenVPN, IPSec, WireGuard, L2TP"
              ],
              "comparisonTable": {
                "title": "Network Types Compared: PAN vs LAN vs WAN vs VPN",
                "headers": ["Feature", "PAN", "LAN", "WAN", "VPN"],
                "rows": [
                  ["Coverage area", "Personal (up to 10 m)", "Single building/campus", "Cities/countries/continents", "Anywhere with internet"],
                  ["Who owns infrastructure", "Individual user", "The organisation", "Third-party provider (leased)", "Runs over existing internet"],
                  ["Typical speed", "Low–medium (Bluetooth)", "High (1–10 Gbps Ethernet)", "Lower, variable", "Depends on internet connection"],
                  ["Cost", "Very low", "Moderate (one-off hardware cost)", "High (ongoing leasing fees)", "Low (subscription/software only)"],
                  ["Security", "Moderate (Bluetooth pairing)", "High (physical premises)", "Moderate (encrypted links)", "High (encrypted tunnel)"],
                  ["Primary use", "Connecting personal devices", "Connecting office/school devices", "Connecting multiple sites globally", "Secure remote access / site-to-site over internet"],
                  ["Example", "Phone + earbuds via Bluetooth", "School computer lab", "Bank's global network", "Employee accessing office from home"]
                ]
              }
            }
          ]
        },
        {
          "code": "B2.3",
          "title": "Factors Affecting Choice of Network",
          "items": [
            {
              "code": "B2.3.1",
              "term": "User Needs",
              "definition": "The specific requirements of the people who will use the network — including mobility, the applications they run, the number of simultaneous users, and the devices they use.",
              "examTip": "Always the starting point for any network selection question. Ask: what do users actually need to do? A call centre needs reliable VoIP; a warehouse team needs mobile wireless access.",
              "keyFacts": [
                "Number of users determines required bandwidth capacity",
                "Mobile/roaming users → wireless network required",
                "Fixed workstations → wired Ethernet appropriate",
                "Real-time applications (VoIP, video) → low latency required",
                "Remote access needs → VPN capability required"
              ]
            },
            {
              "code": "B2.3.2",
              "term": "Specifications",
              "definition": "The technical requirements the network must meet — including minimum speed, maximum latency, uptime guarantees, and support for specific protocols or hardware.",
              "examTip": "Specifications translate user needs into technical requirements. A 'discuss network choice' question should include technical specs like required bandwidth and latency.",
              "keyFacts": [
                "Bandwidth: minimum Mbps required to support all simultaneous users and applications",
                "Latency requirements: real-time apps need <20 ms; file sharing tolerates higher",
                "Uptime/availability: some businesses need 99.99% uptime (four nines)",
                "Protocol support: does the network need to support specific legacy systems?",
                "Scalability specification: how many devices need to connect now vs in 3–5 years?"
              ]
            },
            {
              "code": "B2.3.3",
              "term": "Connectivity",
              "definition": "Whether the network provides the right type and quality of connection — including internet access, inter-site connectivity, and support for all device types the organisation uses.",
              "examTip": "Connectivity = can every device/site that needs to connect, connect? Consider both wired and wireless requirements, and internet vs internal connectivity.",
              "keyFacts": [
                "Must support all device types (PCs, phones, IoT sensors, printers)",
                "Inter-site connectivity: WAN or VPN needed for multiple locations",
                "Internet access provision: bandwidth and redundancy of the internet uplink",
                "Mobile coverage: 4G/5G as backup if fixed internet goes down"
              ]
            },
            {
              "code": "B2.3.4",
              "term": "Cost",
              "definition": "The total financial outlay for designing, implementing, and running the network — including hardware, cabling, licensing, support, and ongoing connectivity fees.",
              "examTip": "Split cost into capital expenditure (CapEx: one-off hardware/installation) and operational expenditure (OpEx: ongoing fees, maintenance, support). Exams often test this distinction.",
              "keyFacts": [
                "Capital costs: switches, routers, cabling, WAPs, servers",
                "Ongoing costs: ISP fees, leased line rental, support contracts, licensing",
                "WAN leased lines: expensive but reliable; VPN over internet: cheaper alternative",
                "Wireless reduces cabling cost but may require more access points",
                "Training staff and ongoing maintenance adds to total cost of ownership"
              ]
            },
            {
              "code": "B2.3.5",
              "term": "Efficiency",
              "definition": "How effectively the network uses available bandwidth and resources to deliver fast, reliable communication with minimal waste or congestion.",
              "examTip": "Efficiency links to B2.4 (network performance). QoS (Quality of Service) is a key mechanism — it prioritises critical traffic (e.g. VoIP) over less important traffic.",
              "keyFacts": [
                "Quality of Service (QoS): prioritises critical traffic types (VoIP, video) over bulk downloads",
                "Network segmentation (VLANs): divides network into logical zones to reduce congestion",
                "Efficient routing protocols minimise unnecessary hops",
                "Utilisation monitoring: identify bottlenecks before they cause problems"
              ]
            },
            {
              "code": "B2.3.6",
              "term": "Compatibility",
              "definition": "Whether the new network works with existing hardware, software, operating systems, and protocols already used by the organisation.",
              "examTip": "Compatibility failures can make a 'better' network completely unusable. A legacy manufacturing system may only work with specific protocols — the network must support them.",
              "keyFacts": [
                "Legacy system support: older systems may use outdated protocols incompatible with new hardware",
                "Hardware compatibility: new switches must support existing NIC standards",
                "Protocol compatibility: ensure new network supports all protocols in use (IPv4/IPv6, specific VLANs)",
                "Operating system compatibility: network management tools must work with all OS versions in use"
              ]
            },
            {
              "code": "B2.3.7",
              "term": "Implementation (Timescales, Testing, Downtime)",
              "definition": "The practical considerations of deploying the network — how long it takes, how it is tested before going live, and how much disruption occurs to existing operations during the transition.",
              "examTip": "Implementation has three sub-considerations the spec names explicitly: timescales (how long?), testing (how do you know it works?), downtime (how much disruption?). Use all three in extended answers.",
              "keyFacts": [
                "Timescales: large network installations take weeks/months — must fit around business operations",
                "Testing: thorough testing before cutover — performance testing, security testing, failover testing",
                "Downtime: plan for minimising disruption — phased rollout, weekend/out-of-hours work",
                "Migration: moving from old to new network without losing data or access",
                "Contingency plan: fallback if new network fails during implementation",
                "Staff training: users and IT team need training before switchover"
              ]
            },
            {
              "code": "B2.3.8",
              "term": "Productivity",
              "definition": "The impact of the network on employees' ability to work effectively — including how much faster or more reliably they can access systems, share data, and communicate.",
              "examTip": "Productivity is the business case for investing in network improvements. Link slow/unreliable networks to tangible business costs: missed deadlines, customer complaints, lost revenue.",
              "keyFacts": [
                "Fast, reliable network directly improves employee output",
                "Downtime and slow connections cost organisations money in lost working time",
                "Collaborative tools (Teams, SharePoint) require reliable network to work effectively",
                "Remote working productivity depends entirely on VPN and internet connection quality"
              ]
            },
            {
              "code": "B2.3.9",
              "term": "Security",
              "definition": "Ensuring the network is protected against unauthorised access, data interception, and attacks — through encryption, access controls, firewalls, and monitoring.",
              "examTip": "Security must be considered at every layer of the network. Wireless networks are inherently more vulnerable than wired. Key requirements: WPA3 for Wi-Fi, firewall at network perimeter, VPN for remote access.",
              "keyFacts": [
                "Wi-Fi encryption: WPA3 (current standard); WPA2 (acceptable); WEP (obsolete — never use)",
                "Network segmentation: separate guest Wi-Fi from internal corporate network",
                "Firewall: controls traffic entering and leaving the network",
                "VPN: encrypts remote access connections",
                "Network access control (NAC): ensures only authorised/compliant devices connect",
                "Intrusion detection system (IDS): monitors for suspicious traffic patterns"
              ]
            }
          ]
        },
        {
          "code": "B2.4",
          "title": "How Network Features Affect Performance",
          "items": [
            {
              "code": "B2.4",
              "term": "How Features of a Network and Component Parts Affect Performance",
              "definition": "Network performance — measured in speed (throughput), latency, reliability, and the number of simultaneous users it can support — is shaped by the choice of hardware, topology, connection type, and how the network is configured.",
              "examples": "Replacing a 100 Mbps switch with a 1 Gbps switch dramatically increasing file transfer speeds across the network; adding more wireless access points reducing Wi-Fi congestion in a large office.",
              "examTip": "For 'how does X affect network performance' questions, always cover: speed/bandwidth, latency, reliability, and the effect of the number of connected devices. Hardware quality and topology both affect performance.",
              "keyFacts": [
                "Switch speed: faster switches (1 Gbps vs 100 Mbps) directly increase throughput",
                "Cable type: Cat6 supports higher speeds and longer runs than Cat5e; fibre optic far exceeds copper",
                "Topology: star avoids collision; bus degrades with more devices",
                "Number of users: bandwidth shared — more users = less per user on shared media",
                "Wireless access point placement: affects Wi-Fi signal strength and coverage",
                "Router processing speed: bottleneck at network boundary if underpowered",
                "Bandwidth of internet uplink: limits external communication for all users",
                "QoS configuration: ensures critical applications get priority bandwidth"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "B3",
      "title": "Issues Relating to Transmission of Data",
      "subtopics": [
        {
          "code": "B3.1",
          "title": "Protocols for Common Tasks",
          "items": [
            {
              "code": "B3.1.1",
              "term": "Email Protocols (SMTP, POP3, IMAP)",
              "definition": "Email communication uses three protocols: SMTP sends messages; POP3 and IMAP are used to retrieve messages from a mail server. Each serves a different function in the email delivery chain.",
              "examples": "Outlook using SMTP to send an email; a phone using IMAP to sync inbox across all devices; a basic email client using POP3 to download emails to one computer.",
              "examTip": "Know exactly what each protocol does and when to use each. IMAP vs POP3 is a common comparison question — the key difference is IMAP keeps mail on server (multi-device sync), POP3 downloads and typically deletes from server.",
              "keyFacts": [
                "SMTP (Simple Mail Transfer Protocol): sends email from client to server and between mail servers",
                "POP3 (Post Office Protocol 3): downloads email to one device, typically deletes from server",
                "IMAP (Internet Message Access Protocol): keeps email on server, syncs across all devices",
                "SMTP port: 587 (submission) / 465 (SMTPS); POP3: 110 / 995 (SSL); IMAP: 143 / 993 (SSL)",
                "Modern email clients almost always use IMAP — better for multi-device users"
              ],
              "comparisonTable": {
                "title": "Email Protocols Compared: SMTP vs POP3 vs IMAP",
                "headers": ["Feature", "SMTP", "POP3", "IMAP"],
                "rows": [
                  ["Purpose", "Sending email", "Receiving/downloading email", "Receiving/syncing email"],
                  ["Direction", "Outgoing only", "Incoming only", "Incoming only"],
                  ["Where mail is stored", "N/A — just transfers it", "Downloaded to local device; deleted from server (by default)", "Kept on mail server; synced to devices"],
                  ["Multi-device support", "Yes (sending from any device)", "No — email on one device only", "Yes — same inbox on all devices"],
                  ["Offline access", "N/A", "Yes — downloaded locally", "Limited — must sync first"],
                  ["Server storage used", "N/A", "Minimal — mail removed", "Yes — all mail stays on server"],
                  ["Best for", "Sending from any email client", "Single-device users with limited server storage", "Multi-device users wanting consistent inbox everywhere"],
                  ["Example use", "Sending from Outlook to Gmail server", "Old-style single-PC email client", "Modern phone/laptop/tablet email sync"]
                ]
              }
            },
            {
              "code": "B3.1.2",
              "term": "Voice and Video Calls over the Internet (VoIP)",
              "definition": "Voice over Internet Protocol (VoIP) converts analogue audio (and video) into digital data packets and transmits them over the internet or a network, enabling voice and video calls without the traditional telephone network.",
              "examples": "Microsoft Teams calls; Zoom video conferencing; WhatsApp calls; Skype; Google Meet.",
              "examTip": "VoIP requires sufficient bandwidth AND low latency — high latency causes noticeable delays; packet loss causes dropped audio. It requires QoS settings to prioritise voice packets over other traffic.",
              "keyFacts": [
                "Converts voice/video to digital data packets — uses IP network instead of phone network",
                "Protocols: SIP (Session Initiation Protocol) sets up/tears down calls; RTP (Real-time Transport Protocol) carries actual audio/video data",
                "Requires low latency (ideally <150 ms) — otherwise noticeable delay in conversation",
                "Requires sufficient bandwidth — typically 100 kbps per VoIP call (audio); much more for HD video",
                "Packet loss causes crackling/dropouts — voice quality highly sensitive to network quality",
                "Much cheaper than traditional PSTN calls — especially international",
                "QoS settings needed to prioritise voice packets over bulk data traffic"
              ]
            },
            {
              "code": "B3.1.3",
              "term": "Web Page Protocols (HTTP and HTTPS)",
              "definition": "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web, defining how browsers request and receive web pages. HTTPS is the secure version, adding TLS/SSL encryption.",
              "examples": "A browser loading a news article via HTTP (no login needed, no sensitive data); a user logging into online banking over HTTPS; a web form submitting payment details via HTTPS.",
              "examTip": "Know the three things HTTPS adds over HTTP: encryption (data cannot be read), integrity (data not tampered with), authentication (server identity verified). Browsers mark HTTP as 'Not Secure' — HTTPS is now the standard for all sites.",
              "keyFacts": [
                "HTTP: stateless request-response protocol — browser sends GET/POST request; server responds",
                "HTTP port 80; HTTPS port 443",
                "HTTPS adds TLS/SSL: encrypts entire session between browser and server",
                "Digital certificate required for HTTPS — verifies server identity (prevents impersonation)",
                "HTTP Strict Transport Security (HSTS): forces browsers to only use HTTPS for a domain",
                "HTTP/2 and HTTP/3: newer versions with improved performance (multiplexing, compression)"
              ],
              "comparisonTable": {
                "title": "HTTP vs HTTPS",
                "headers": ["Feature", "HTTP", "HTTPS"],
                "rows": [
                  ["Full name", "HyperText Transfer Protocol", "HyperText Transfer Protocol Secure"],
                  ["Encryption", "None — data sent in plaintext", "TLS/SSL encrypts all data in transit"],
                  ["Data integrity", "No — data can be modified in transit", "Yes — TLS detects any tampering"],
                  ["Server authentication", "No — cannot verify website identity", "Yes — digital certificate verifies server"],
                  ["Port", "80", "443"],
                  ["Browser indicator", "'Not Secure' warning", "Padlock icon"],
                  ["Risk", "Credentials and data visible to anyone intercepting traffic", "Significantly harder to intercept/read/modify"],
                  ["Use cases", "Public content with no login (increasingly replaced by HTTPS)", "Any page with login, personal data, or payment"],
                  ["Required for", "Nothing — being phased out", "E-commerce, banking, login pages, all modern sites"]
                ]
              }
            },
            {
              "code": "B3.1.4",
              "term": "Secure Payment Systems",
              "definition": "Technologies and standards that protect financial transactions made online — including encryption, tokenisation, and authentication protocols that prevent payment card data from being stolen.",
              "examples": "A customer using a credit card on an HTTPS e-commerce site; Apple Pay using tokenisation so the actual card number is never shared with the merchant; 3D Secure (e.g. Verified by Visa) adding MFA to card payments.",
              "examTip": "Secure payments combine multiple layers: HTTPS encryption (protects data in transit), tokenisation (replaces real card number with a token), MFA (3D Secure), and PCI DSS compliance (industry standard for card data security).",
              "keyFacts": [
                "HTTPS: encrypts all data including payment card details during transmission",
                "Tokenisation: replaces real card number with a unique token — merchant never sees actual card number",
                "PCI DSS (Payment Card Industry Data Security Standard): rules organisations must follow when handling card data",
                "3D Secure: additional authentication step (OTP to phone) before transaction is authorised",
                "SSL/TLS certificate required on checkout pages — browser padlock must be visible",
                "CVV code: not stored by merchants — provides additional verification",
                "Fraudulent transactions: chargeback mechanism protects consumers"
              ]
            }
          ]
        },
        {
          "code": "B3.2",
          "title": "Security Issues When Transmitting Data",
          "items": [
            {
              "code": "B3.2",
              "term": "Security Issues When Transmitting Data",
              "definition": "Data travelling across networks — whether wired or wireless — can be intercepted, altered, or blocked. The risks vary by connection type and whether encryption is used.",
              "examples": "An attacker using a packet sniffer on an unencrypted public Wi-Fi network to capture login credentials; a man-in-the-middle (MitM) attack intercepting and altering data between two parties.",
              "examTip": "Key attack types by connection: Wi-Fi → eavesdropping / MitM on unencrypted hotspots; Wired → harder but possible via rogue hardware; Internet → packet sniffing, MitM. Solution for each: encryption (TLS/VPN/HTTPS).",
              "keyFacts": [
                "Packet sniffing: capturing data packets in transit to read unencrypted content",
                "Man-in-the-middle (MitM): attacker secretly intercepts and relays communication between two parties",
                "Wi-Fi eavesdropping: unencrypted Wi-Fi allows anyone nearby to capture traffic",
                "Rogue access point (evil twin): fake Wi-Fi hotspot mimicking a legitimate one",
                "Session hijacking: stealing a session cookie to take over an authenticated session",
                "Mitigations: HTTPS/TLS, VPN on public Wi-Fi, certificate validation, encrypted DNS (DoH)"
              ]
            }
          ]
        },
        {
          "code": "B3.3",
          "title": "Bandwidth and Latency",
          "items": [
            {
              "code": "B3.3",
              "term": "Factors Affecting and Implications of Bandwidth and Latency",
              "definition": "Bandwidth is the maximum data transfer rate (measured in Mbps/Gbps). Latency is the time delay between sending and receiving data (measured in milliseconds). Both critically affect how fast and responsive a network feels.",
              "examples": "A home with 1 Gbps broadband but high latency (200 ms) feeling slow for gaming despite fast downloads; a school's Wi-Fi becoming sluggish at lunch when 500 students simultaneously stream video.",
              "examTip": "Bandwidth and latency are different things — bandwidth is how much data can flow; latency is how quickly it starts flowing. High bandwidth alone does not guarantee a good experience if latency is also high. Always explain the effect on users.",
              "keyFacts": [
                "Bandwidth: maximum data per second — shared between all simultaneous users/applications",
                "Latency: delay in transmission — caused by distance, router hops, network congestion, processing time",
                "High bandwidth but high latency: downloads fast but feels sluggish for interactive tasks",
                "Low latency critical for: VoIP, video calls, online gaming, real-time control systems",
                "Throughput: actual bandwidth achieved in practice — always lower than theoretical maximum",
                "Jitter: variation in latency — particularly harmful for VoIP/video streaming",
                "Congestion: too many devices using bandwidth simultaneously — increases latency and reduces throughput",
                "Factors affecting bandwidth: cable type, switch/router speed, ISP tier, number of users",
                "Factors affecting latency: geographic distance, number of hops, network congestion, processing time"
              ]
            }
          ]
        },
        {
          "code": "B3.4",
          "title": "File Types and Formats for Transmission",
          "items": [
            {
              "code": "B3.4.1",
              "term": "Image File Formats",
              "definition": "Digital images can be stored in various formats, each with different characteristics affecting file size, quality, and suitability for transmission.",
              "examples": "JPEG photos on a website; PNG logos with transparent backgrounds; GIF animations; RAW files from professional cameras; SVG vector graphics for logos.",
              "examTip": "Exams often ask you to choose an appropriate format for a scenario. JPEG = photos/web (lossy, small). PNG = graphics with transparency (lossless, larger). GIF = simple animations. SVG = scalable vector, resolution-independent.",
              "keyFacts": [
                "JPEG: lossy compression — good for photographs, small file size, reduced quality at high compression",
                "PNG: lossless compression — supports transparency, larger than JPEG, used for logos and graphics",
                "GIF: lossless, limited to 256 colours, supports simple animations — used for short animated images",
                "SVG: vector format — infinitely scalable without quality loss, used for logos and icons",
                "RAW: unprocessed camera sensor data — very large file, maximum quality, used by professionals",
                "BMP: uncompressed — very large files, rarely used for transmission"
              ]
            },
            {
              "code": "B3.4.2",
              "term": "Audio File Formats",
              "definition": "Digital audio is stored in formats that vary in quality and file size depending on whether lossy or lossless compression is used.",
              "examples": "MP3 music files streamed on Spotify; WAV audio for professional studio recording; AAC audio in iTunes/Apple Music; FLAC for audiophile lossless audio.",
              "examTip": "MP3 = lossy, small, widely compatible — good for streaming. WAV/FLAC = lossless, large — for professional production. The smaller the file, the less bandwidth needed for streaming.",
              "keyFacts": [
                "MP3: lossy compression — removes audio frequencies humans barely perceive; small file size; widely supported",
                "AAC: lossy, better quality than MP3 at same bit rate — used by Apple, YouTube",
                "WAV: uncompressed — large files, lossless quality, used in professional audio production",
                "FLAC: lossless compression — smaller than WAV but full quality; used by audiophiles",
                "OGG Vorbis: open-source lossy format — used in some games and web audio",
                "Bit rate: higher bit rate = better quality but larger file (e.g. 128 kbps vs 320 kbps MP3)"
              ]
            },
            {
              "code": "B3.4.3",
              "term": "Video File Formats",
              "definition": "Digital video files combine compressed video and audio streams in a container format. The compression method (codec) determines quality, file size, and compatibility.",
              "examples": "MP4 video on YouTube; MKV files for high-definition video with multiple subtitle tracks; MOV files from iPhones; AVI legacy format for older video players.",
              "examTip": "Video files = container format + codec. Container (MP4, MKV) holds the streams; codec (H.264, H.265, AV1) compresses them. H.265 produces half the file size of H.264 at the same quality — important for streaming and storage.",
              "keyFacts": [
                "MP4 (H.264): most widely compatible container/codec — used for web video, YouTube, social media",
                "MP4 (H.265/HEVC): 50% smaller than H.264 at same quality — used for 4K streaming",
                "MKV: flexible container — supports multiple audio/subtitle tracks, used for HD video",
                "MOV: Apple's format — high quality, large files",
                "AVI: older Microsoft format — widely compatible but large and inefficient",
                "Bitrate: determines quality vs file size — higher bitrate = better quality, more bandwidth needed for streaming"
              ]
            },
            {
              "code": "B3.4.4",
              "term": "Application Software File Formats",
              "definition": "Software applications are distributed as executable or installer files in formats specific to the operating system — containing the program code, resources, and metadata needed to install and run the application.",
              "examples": "A .exe installer for Windows software downloaded from a website; an .apk file sideloaded onto an Android phone; a .dmg disk image for macOS application installation; a .deb package for Debian Linux.",
              "examTip": "Software files are much larger than documents — can be hundreds of megabytes or gigabytes. Reliable, high-bandwidth connection important for distribution. Security risk: malware often disguised as legitimate software downloads.",
              "keyFacts": [
                "EXE / MSI: Windows executable and installer formats",
                "APK: Android application package — for installing apps outside the Play Store",
                "DMG / PKG: macOS disk image and installer formats",
                "DEB / RPM: Linux distribution-specific package formats",
                "ZIP / RAR: software often distributed in compressed archives to reduce download size",
                "Digital signatures: verify software has not been tampered with after the developer signed it",
                "Security: always verify source and digital signature before running downloaded software"
              ],
              "comparisonTable": {
                "title": "File Formats Summary by Media Type",
                "headers": ["Type", "Lossy formats", "Lossless/uncompressed formats", "Key consideration for transmission"],
                "rows": [
                  ["Images", "JPEG (photos, web)", "PNG (transparency), RAW (pro), SVG (vector)", "JPEG smallest for web photos; PNG needed for logos/transparency"],
                  ["Audio", "MP3, AAC, OGG", "WAV, FLAC", "MP3 for streaming; WAV/FLAC for production — much larger"],
                  ["Video", "MP4 (H.264/H.265), MKV", "None commonly — all video is compressed", "H.265 half the size of H.264; bitrate controls quality vs bandwidth"],
                  ["Software", "N/A — cannot lose code", "EXE, APK, DMG, DEB (+ ZIP wrappers)", "Large files need reliable connection; verify digital signature"]
                ]
              }
            }
          ]
        },
        {
          "code": "B3.5",
          "title": "Compression Types",
          "items": [
            {
              "code": "B3.5.1",
              "term": "Lossy Compression",
              "definition": "A compression method that permanently removes some data from a file to achieve a smaller file size. The removed data cannot be recovered — the decompressed file is an approximation of the original, not an exact copy.",
              "examples": "JPEG image compression removing imperceptible colour detail from a photograph; MP3 removing audio frequencies humans barely hear; MP4 video reducing detail in static background areas.",
              "examTip": "Lossy = smaller file, worse quality, irreversible. Suitable when minor quality loss is acceptable — streaming, web media. NOT suitable where data integrity matters — medical imaging, legal documents.",
              "keyFacts": [
                "Data is permanently discarded — original cannot be reconstructed",
                "Achieves much higher compression ratios than lossless",
                "Quality degrades each time a lossy file is edited and re-saved",
                "Compression level is a trade-off: more compression = smaller file but worse quality",
                "Uses: web images, music streaming, video streaming, social media uploads",
                "NOT suitable for: text files, executables, medical/legal images requiring exact data"
              ]
            },
            {
              "code": "B3.5.2",
              "term": "Lossless Compression",
              "definition": "A compression method that reduces file size without losing any data. The original file can be perfectly reconstructed from the compressed version — every bit of the original is recoverable.",
              "examples": "ZIP archiving of text documents; PNG image compression; FLAC audio; RAR archive of software files.",
              "examTip": "Lossless = no quality loss, original perfectly restored, but smaller compression ratio than lossy. Required wherever data accuracy is critical: text, code, spreadsheets, executables, medical images.",
              "keyFacts": [
                "No data lost — original can be perfectly reconstructed",
                "Lower compression ratio than lossy — file sizes still smaller but not as dramatically",
                "Uses algorithms like Huffman coding, LZ77, DEFLATE to find and encode patterns",
                "Uses: ZIP/RAR archives, PNG images, FLAC audio, software distribution",
                "Required for: text, databases, executables, medical/scientific data, legal files",
                "Can be applied to any file type without degrading content"
              ],
              "comparisonTable": {
                "title": "Lossy vs Lossless Compression",
                "headers": ["Feature", "Lossy Compression", "Lossless Compression"],
                "rows": [
                  ["Data loss", "Yes — some data permanently removed", "No — all data preserved exactly"],
                  ["Compression ratio", "Very high — files much smaller", "Moderate — smaller but not as dramatically"],
                  ["Reversibility", "Irreversible — cannot restore original", "Fully reversible — exact original restored"],
                  ["Quality impact", "Reduced — degradation increases with compression level", "None — identical to original after decompression"],
                  ["Re-save impact", "Quality degrades each time (generation loss)", "No quality degradation on re-saving"],
                  ["Best for", "Images (web/social), audio (streaming), video (streaming)", "Text, code, executables, archives, where accuracy matters"],
                  ["NOT suitable for", "Medical images, legal documents, scientific data, text", "Cases where file size is critical and quality loss acceptable"],
                  ["Example formats", "JPEG, MP3, MP4 (H.264), AAC", "PNG, FLAC, WAV, ZIP, RAR, GIF (images)"],
                  ["File size example", "3 MB photo → ~300 KB JPEG", "3 MB photo → ~2.5 MB PNG"]
                ]
              }
            }
          ]
        },
        {
          "code": "B3.6",
          "title": "Codecs",
          "items": [
            {
              "code": "B3.6",
              "term": "Codecs (Coder-Decoder)",
              "definition": "A codec is software (or hardware) that encodes (compresses) audio or video data for storage/transmission and decodes (decompresses) it for playback. The codec determines the compression algorithm, quality, and compatibility of audio/video files.",
              "examples": "H.264 codec encoding a YouTube video for upload and decoding it in the viewer's browser; MP3 codec encoding a song at 320 kbps for streaming; Opus codec used in Discord and Google Meet voice calls.",
              "examTip": "Codec = coder + decoder. It is what actually does the compression/decompression — the container format (MP4, MKV) just holds the compressed stream. Incompatible codec = file won't play. Key codecs to know: H.264, H.265 (video); MP3, AAC (audio).",
              "keyFacts": [
                "Encoder: compresses raw audio/video into smaller format for storage or transmission",
                "Decoder: decompresses the data for playback — must match the encoder codec",
                "If playback device doesn't have the codec installed, file won't play",
                "Trade-off: more compression = smaller file but more CPU power needed to decode",
                "Streaming services use codecs to balance quality vs bandwidth (e.g. Netflix uses H.265/HEVC and AV1)",
                "Transcoding: converting from one codec to another — used when uploading to platforms",
                "H.264 (AVC): most widely compatible video codec — used by YouTube, Blu-ray, streaming",
                "H.265 (HEVC): 50% smaller than H.264 — used for 4K content; requires more powerful hardware to decode",
                "AV1: open-source, royalty-free codec — better compression than H.265; increasingly used by YouTube/Netflix",
                "MP3: most widely compatible audio codec; AAC: better quality at same bit rate"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_C = {
  "section": "C",
  "title": "Operating Online",
  "tier": 1,
  "colour": "#e53e3e",
  "topics": [
    {
      "code": "C1",
      "title": "Online Systems",
      "subtopics": [
        {
          "code": "C1.1",
          "title": "Cloud Computing Models",
          "items": [
            {
              "code": "C1.1.1",
              "term": "Private Cloud",
              "definition": "Cloud infrastructure operated solely for one organisation, managed internally or by a third party. Hosted on-premise or at a dedicated facility.",
              "examples": "A hospital running its own cloud servers to store patient records securely; a bank with its own cloud for financial data.",
              "examTip": "Private cloud = more control + security but higher cost. Contrast with public cloud in 'discuss' questions.",
              "keyFacts": [
                "Organisation has full control over data and security",
                "Higher setup and maintenance cost than public cloud",
                "Better for sensitive/confidential data (e.g. financial, medical)",
                "Not shared with other organisations"
              ]
            },
            {
              "code": "C1.1.2",
              "term": "Public Cloud",
              "definition": "Cloud services delivered over the internet and shared across multiple organisations. Managed by a third-party provider (e.g. AWS, Microsoft Azure, Google Cloud).",
              "examples": "A small business using Google Drive; a school using Microsoft 365; a startup hosting its app on AWS.",
              "examTip": "Public cloud = low cost, scalable, but less control over where your data is stored.",
              "keyFacts": [
                "Pay-as-you-go pricing — cost-effective for small organisations",
                "Scalable — can increase/decrease resources instantly",
                "Data stored on shared infrastructure",
                "Provider responsible for maintenance and security of hardware"
              ]
            },
            {
              "code": "C1.1.3",
              "term": "Hybrid Cloud",
              "definition": "A combination of private and public cloud, allowing data and applications to be shared between them. Sensitive data stays on private cloud; less sensitive workloads use public cloud.",
              "examples": "A retailer storing customer payment data on a private cloud but running its public-facing website on a public cloud.",
              "examTip": "Hybrid cloud = best of both worlds. Good for a 'discuss suitability' question — mention flexibility and cost savings.",
              "keyFacts": [
                "Sensitive data kept on private cloud for security/compliance",
                "Less sensitive tasks handled by cheaper public cloud",
                "More complex to manage than either alone",
                "Allows organisations to scale using public cloud when demand spikes"
              ]
            },
            {
              "code": "C1.1.4",
              "term": "Infrastructure as a Service (IaaS)",
              "definition": "Cloud model providing virtualised computing resources over the internet — servers, storage, networking. Organisation manages OS, applications and data; provider manages physical hardware.",
              "examples": "Amazon EC2 (virtual servers); Microsoft Azure Virtual Machines; Google Compute Engine.",
              "examTip": "IaaS = you manage OS and above; provider manages hardware. Most flexible but most responsibility.",
              "keyFacts": [
                "Organisation rents virtual machines and storage",
                "Full control over operating system and software installed",
                "Suitable for organisations that need custom infrastructure",
                "Pay for what you use — no hardware purchase needed"
              ]
            },
            {
              "code": "C1.1.5",
              "term": "Software as a Service (SaaS)",
              "definition": "Cloud model where software applications are delivered over the internet on a subscription basis. Provider manages everything — hardware, OS, application. User just uses the software via browser.",
              "examples": "Microsoft 365 (Word, Excel online); Google Workspace; Salesforce CRM; Spotify.",
              "examTip": "SaaS = no installation needed, access anywhere. Most common in exam scenarios — link to productivity/remote working.",
              "keyFacts": [
                "No software installation required on user devices",
                "Accessible from any device with internet connection",
                "Automatic updates managed by provider",
                "Subscription-based pricing (monthly/annual)"
              ]
            },
            {
              "code": "C1.1.6",
              "term": "Platform as a Service (PaaS)",
              "definition": "Cloud model providing a platform for developers to build, test, and deploy applications without managing underlying infrastructure. Provider manages hardware and OS; developer manages applications and data.",
              "examples": "Google App Engine; Heroku; Microsoft Azure App Service.",
              "examTip": "PaaS = for developers building apps. Middle ground between IaaS (most control) and SaaS (least control).",
              "keyFacts": [
                "Developer focuses on writing code, not managing servers",
                "Provider handles OS updates, security patches, scaling",
                "Faster development — pre-built tools and frameworks available",
                "Less flexible than IaaS but less management overhead"
              ],
              "comparisonTable": {
                "title": "Cloud Service Models Compared (IaaS vs PaaS vs SaaS)",
                "headers": ["Feature", "IaaS", "PaaS", "SaaS"],
                "rows": [
                  ["What you get", "Virtual hardware (servers, storage, networking)", "Development platform + runtime environment", "Ready-to-use software application"],
                  ["You manage", "OS, middleware, apps, data", "Apps and data only", "Nothing — just use it"],
                  ["Provider manages", "Physical hardware only", "Hardware + OS + middleware", "Everything"],
                  ["Control level", "Highest", "Medium", "Lowest"],
                  ["Flexibility", "Most flexible", "Moderate", "Least flexible"],
                  ["Who uses it", "IT teams needing custom infrastructure", "Developers building applications", "End users / businesses wanting ready software"],
                  ["Example", "Amazon EC2, Azure VMs", "Google App Engine, Heroku", "Microsoft 365, Salesforce, Spotify"],
                  ["Typical cost", "Pay per resource used", "Pay per resource/API calls", "Subscription (monthly/annual)"]
                ]
              }
            },
            {
              "code": "C1.1.1-C1.1.3",
              "term": "Cloud Deployment Models Compared",
              "definition": "The three deployment models differ in who owns, controls, and shares the cloud infrastructure.",
              "examples": "NHS using private cloud for patient records; a startup using AWS public cloud; a retailer using hybrid cloud.",
              "examTip": "In 'discuss suitability' questions: match the deployment model to the scenario. Sensitive data → private/hybrid. Small budget/startup → public. Large org needing both → hybrid.",
              "keyFacts": [],
              "comparisonTable": {
                "title": "Cloud Deployment Models Compared",
                "headers": ["Feature", "Private Cloud", "Public Cloud", "Hybrid Cloud"],
                "rows": [
                  ["Who uses it", "Single organisation only", "Multiple organisations (shared)", "One organisation using both"],
                  ["Who manages it", "Org or contracted provider", "Third-party provider (e.g. AWS)", "Mix of both"],
                  ["Cost", "High setup + maintenance cost", "Low — pay-as-you-go", "Medium — private portion is costly"],
                  ["Security/Control", "Highest — full control", "Lower — shared infrastructure", "High for sensitive data, lower for rest"],
                  ["Scalability", "Limited — must provision own hardware", "Very high — instant scaling", "High — can burst to public cloud"],
                  ["Best for", "Sensitive data (medical, financial, legal)", "Small/medium orgs, startups, variable demand", "Large orgs with mixed data sensitivity"],
                  ["GDPR risk", "Low — data stays in-house", "Higher — data may leave UK", "Medium — depends on what goes where"]
                ]
              }
            }
          ]
        },
        {
          "code": "C1.2",
          "title": "Impact and Implications of Cloud Computing",
          "items": [
            {
              "code": "C1.2",
              "term": "Impact and Implications of Cloud Computing for Individuals and Organisations",
              "definition": "Cloud computing changes how individuals store data and access software, and how organisations manage IT infrastructure, costs, and workforce.",
              "examples": "An individual using iCloud for photo backup; a business moving from on-premise servers to AWS to reduce IT costs.",
              "examTip": "For a 'discuss' question: cover benefits AND drawbacks. Benefits: cost, scalability, accessibility. Drawbacks: security, internet dependency, vendor lock-in.",
              "keyFacts": [
                "BENEFITS — Individuals: access files anywhere, automatic backups, no hardware cost",
                "BENEFITS — Organisations: reduced capital expenditure, scalable, always up-to-date software",
                "DRAWBACKS: requires reliable internet connection; data security concerns",
                "DRAWBACKS: vendor lock-in — difficult to switch providers; ongoing subscription costs",
                "Data may be stored in a different country — legal/compliance implications",
                "Enables remote working — employees can access systems from anywhere"
              ],
              "extendedAnswer": "Cloud computing offers significant benefits for organisations, including reduced capital expenditure on hardware and the ability to scale resources up or down based on demand. Employees can access data and applications from any location, supporting remote working and improving productivity. However, organisations face risks: if internet connectivity is lost, access to cloud systems is unavailable, causing disruption. Security concerns arise as data is stored on third-party servers, potentially in different countries, raising data protection compliance issues under GDPR. There is also risk of vendor lock-in, where migrating data away from one provider is costly and complex."
            }
          ]
        },
        {
          "code": "C1.3",
          "title": "Systems that Enable Remote Working",
          "items": [
            {
              "code": "C1.3.1",
              "term": "VPNs (Virtual Private Networks)",
              "definition": "A VPN creates an encrypted tunnel between a user's device and the organisation's network over the internet, allowing secure remote access as if physically connected to the office network.",
              "examples": "An employee working from home connecting to the company intranet via VPN; a journalist using a VPN to securely transmit reports.",
              "examTip": "VPN = encryption + secure tunnel + remote access. Often appears with data transmission security questions.",
              "keyFacts": [
                "Encrypts all data transmitted between device and network",
                "Masks the user's IP address — provides anonymity",
                "Allows remote workers to access internal network resources securely",
                "Can reduce performance due to encryption overhead",
                "Protects data from interception on public Wi-Fi"
              ]
            },
            {
              "code": "C1.3.2",
              "term": "Remote Desktop Technologies",
              "definition": "Software that allows a user to view and control another computer's desktop remotely over a network or internet connection.",
              "examples": "Microsoft Remote Desktop; TeamViewer; IT support staff remotely fixing a user's computer.",
              "examTip": "Remote desktop = see and control another machine. Useful for IT support and employees accessing office computers from home.",
              "keyFacts": [
                "Full control of remote computer — run applications, access files",
                "Requires stable internet connection for smooth operation",
                "Security risk if not properly secured — attackers could gain access",
                "Useful for IT support without physical presence",
                "Commonly used with VPN for added security"
              ],
              "comparisonTable": {
                "title": "VPN vs Remote Desktop Technology",
                "headers": ["Feature", "VPN", "Remote Desktop"],
                "rows": [
                  ["What it does", "Encrypts tunnel so device accesses the network as if on-site", "Displays and controls a remote machine's desktop"],
                  ["Data location", "Files stay on organisation's servers; user works via secure connection", "All processing on remote machine; user just sees the screen"],
                  ["Best for", "Accessing shared files and intranet resources from home", "Full control of office PC; IT support; specific software only on office machine"],
                  ["Security concern", "Endpoint device must be secure; VPN credentials can be stolen", "If poorly secured, anyone could take control of the remote machine"],
                  ["Internet dependency", "Yes — needs reliable connection for performance", "Yes — latency makes it slow on poor connections"],
                  ["Example tools", "Cisco AnyConnect, OpenVPN, Windows VPN", "Microsoft Remote Desktop, TeamViewer, Chrome Remote Desktop"]
                ]
              }
            }
          ]
        },
        {
          "code": "C1.4",
          "title": "Factors Affecting Use and Selection of Online Systems",
          "items": [
            {
              "code": "C1.4.1",
              "term": "Security",
              "definition": "The level of protection an online system provides for data and user accounts, including encryption, access control, and compliance with regulations.",
              "examTip": "Always mention security as a factor — link to data sensitivity and GDPR for high marks.",
              "keyFacts": [
                "Organisations must ensure cloud providers are GDPR-compliant",
                "Encryption of data at rest and in transit is essential",
                "Multi-factor authentication adds extra security layer",
                "Security breaches can lead to financial penalties and reputational damage"
              ]
            },
            {
              "code": "C1.4.2",
              "term": "Cost",
              "definition": "The total cost of adopting and running an online system, including subscription fees, data transfer costs, training, and migration costs.",
              "examTip": "Compare subscription (ongoing) vs capital (one-off) cost in cloud vs on-premise discussions.",
              "keyFacts": [
                "Cloud: lower upfront cost, but ongoing subscription fees",
                "On-premise: high upfront hardware cost, lower ongoing cost",
                "Scalable pricing — only pay for resources used",
                "Hidden costs: data transfer fees, support, training"
              ]
            },
            {
              "code": "C1.4.3",
              "term": "Ease of Use",
              "definition": "How intuitive and simple the online system is for employees and customers to learn and operate.",
              "examTip": "Ease of use links to staff training needs and productivity — mention both in extended answers.",
              "keyFacts": [
                "Complex systems require more training — increases cost and downtime",
                "Good UX reduces errors and increases productivity",
                "Affects employee adoption and satisfaction"
              ]
            },
            {
              "code": "C1.4.4",
              "term": "Features",
              "definition": "The functionality offered by an online system — whether it meets the specific needs of the organisation (e.g. storage capacity, collaboration tools, analytics).",
              "examTip": "Match features to the scenario in the question — does the system do what the business needs?",
              "keyFacts": [
                "Must match user and organisational requirements",
                "Feature comparison drives provider selection",
                "Excess features can increase complexity and cost"
              ]
            },
            {
              "code": "C1.4.5",
              "term": "Connectivity",
              "definition": "The quality and reliability of the internet connection required to use the online system effectively.",
              "examTip": "Cloud systems are useless without internet — mention this as a risk/drawback in cloud questions.",
              "keyFacts": [
                "Unreliable connection causes downtime and productivity loss",
                "High-bandwidth applications (video, large files) need fast connections",
                "Remote/rural areas may have poor connectivity — limits cloud adoption"
              ]
            },
            {
              "code": "C1.4.6",
              "term": "Scalability",
              "definition": "The ability of an online system to grow or shrink in capacity to meet changing demand, without significant cost or disruption.",
              "examTip": "Scalability is a key benefit of cloud — use this in any 'discuss cloud suitability' question.",
              "keyFacts": [
                "Cloud systems can scale up during peak demand (e.g. Christmas for retail)",
                "Scale down when demand falls — avoid paying for unused capacity",
                "On-premise systems are harder and slower to scale",
                "Important for rapidly growing organisations"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "C2",
      "title": "Online Communities",
      "subtopics": [
        {
          "code": "C2.1",
          "title": "Ways of Communicating and Interacting with Online Communities",
          "items": [
            {
              "code": "C2.1.1",
              "term": "Social Media",
              "definition": "Platforms that allow users to create and share content and interact with others. Examples include Instagram, X (Twitter), Facebook, LinkedIn, TikTok.",
              "examples": "A business using Instagram to market products; a school using Twitter to communicate with parents.",
              "examTip": "Social media = marketing + communication + community building. Can appear in E1 (targeted marketing) or C2 questions.",
              "keyFacts": [
                "Instant communication to large audiences",
                "Used for marketing, customer service, brand building",
                "Risk: negative comments spread quickly; reputational damage",
                "Privacy concerns — personal data collected by platforms"
              ]
            },
            {
              "code": "C2.1.2",
              "term": "Blog/Vlog",
              "definition": "A blog is a regularly updated website with written content; a vlog is a video-based blog. Both allow individuals or organisations to share information, opinions, or expertise.",
              "examples": "A technology blogger reviewing new products; a YouTuber creating tutorial videos.",
              "examTip": "Blog/vlog = one-to-many communication. Often used for education/information sharing.",
              "keyFacts": [
                "Allows creators to build an audience over time",
                "Can generate advertising revenue",
                "Comments section allows interaction with readers/viewers",
                "Used by businesses for content marketing"
              ]
            },
            {
              "code": "C2.1.3",
              "term": "Wiki",
              "definition": "A collaboratively edited website where multiple users can create and edit content. Wikipedia is the most well-known example.",
              "examples": "Wikipedia; internal company wikis for knowledge sharing; fan wikis for games or TV shows.",
              "examTip": "Wiki = collaborative, anyone can edit. Reliability can be an issue — content may not always be accurate.",
              "keyFacts": [
                "Collaborative — content created and updated by community",
                "Free to access — democratises knowledge",
                "Accuracy concerns — unverified edits possible",
                "Used internally by organisations for documentation"
              ]
            },
            {
              "code": "C2.1.4",
              "term": "Chatrooms",
              "definition": "Online spaces where multiple users can communicate in real time via text messages. Can be public or private.",
              "examples": "Discord servers; IRC channels; customer support live chat.",
              "examTip": "Chatrooms = real-time, synchronous communication. Contrast with forums (asynchronous).",
              "keyFacts": [
                "Real-time communication between multiple users",
                "Can be public (open to anyone) or private (invite only)",
                "Risk: inappropriate content, cyberbullying, grooming",
                "Used by businesses for customer support"
              ]
            },
            {
              "code": "C2.1.5",
              "term": "Instant Messaging",
              "definition": "One-to-one or small group real-time text communication via apps such as WhatsApp, iMessage, or Microsoft Teams.",
              "examples": "WhatsApp for personal messaging; Microsoft Teams for workplace communication.",
              "examTip": "IM = faster than email, more informal. Good for quick workplace updates.",
              "keyFacts": [
                "Faster than email for quick queries",
                "Supports file sharing, voice, and video",
                "Can blur work/personal boundaries",
                "End-to-end encryption in apps like WhatsApp"
              ]
            },
            {
              "code": "C2.1.6",
              "term": "Podcasts",
              "definition": "Audio recordings (sometimes with video) distributed online for on-demand listening. Users subscribe and download episodes.",
              "examples": "BBC podcasts; educational podcasts on exam topics; business podcasts.",
              "examTip": "Podcasts = asynchronous, on-demand audio content. One-to-many communication.",
              "keyFacts": [
                "Consumed on-demand — listener chooses when to listen",
                "Growing medium for education, news, entertainment",
                "Low cost to produce — accessible to individuals",
                "No real-time interaction — one-way communication"
              ]
            },
            {
              "code": "C2.1.7",
              "term": "Forums",
              "definition": "Online discussion boards where users post questions or comments and others reply asynchronously. Threads allow organised discussion.",
              "examples": "Reddit; Stack Overflow; manufacturer support forums.",
              "examTip": "Forums = asynchronous discussion, searchable threads. Contrast with chatrooms (real-time).",
              "keyFacts": [
                "Posts are permanent and searchable — useful reference",
                "Asynchronous — no need to be online at same time",
                "Community-moderated — quality varies",
                "Used for technical support, hobby communities, discussion"
              ],
              "comparisonTable": {
                "title": "Online Community Types Compared",
                "headers": ["Feature", "Chatroom", "Forum", "Blog/Vlog", "Instant Messaging", "Social Media"],
                "rows": [
                  ["Communication style", "Real-time (synchronous)", "Asynchronous (threaded replies)", "One-to-many, asynchronous", "Real-time, one-to-one/small group", "One-to-many, asynchronous"],
                  ["Permanence", "Messages often not saved", "Posts permanent and searchable", "Posts permanent", "Usually saved in history", "Posts visible until deleted"],
                  ["Audience size", "Small to medium groups", "Open to all; large communities", "Potentially global audience", "Small group", "Potentially millions"],
                  ["Best for", "Live discussion, events, support", "Technical help, reference, Q&A", "Sharing expertise, marketing", "Quick workplace/personal communication", "Brand building, marketing, news"],
                  ["Organisation use", "Customer live support", "Knowledge base, community support", "Content marketing, SEO", "Internal team communication", "Marketing, PR, customer engagement"],
                  ["Privacy", "Can be public or private", "Usually public", "Usually public", "Private", "Usually public (can restrict)"],
                  ["Example", "Discord, IRC", "Reddit, Stack Overflow", "WordPress blog, YouTube", "WhatsApp, Teams", "Instagram, X, LinkedIn"]
                ]
              }
            }
          ]
        },
        {
          "code": "C2.2",
          "title": "Considerations for Individuals and Organisations",
          "items": [
            {
              "code": "C2.2.1",
              "term": "User Experience (UX)",
              "definition": "How easy, enjoyable, and effective the online community platform is to use — covering ease of use, performance, availability, and accessibility.",
              "examTip": "UX considerations: is it fast? Can users with disabilities access it? Is it available 24/7?",
              "keyFacts": [
                "Ease of use affects adoption — poor UX drives users away",
                "Performance: slow platforms frustrate users",
                "Availability: downtime means lost revenue/productivity",
                "Accessibility: must work for users with disabilities (screen readers, etc.)"
              ]
            },
            {
              "code": "C2.2.2",
              "term": "Meeting User Needs",
              "definition": "Whether the platform's features and content match what its users actually require.",
              "examTip": "Always tie platform choice back to specific user needs in scenario questions.",
              "keyFacts": [
                "Platform must offer features users actually need",
                "Feedback mechanisms help identify unmet needs",
                "Mismatch between platform and needs reduces engagement"
              ]
            },
            {
              "code": "C2.2.3",
              "term": "Cost",
              "definition": "The financial implications of setting up, running, and maintaining an online community platform — including subscription, hosting, moderation, and staff costs.",
              "keyFacts": [
                "Free platforms vs paid — trade-offs in features and control",
                "Moderation costs for keeping community safe",
                "Hidden costs: advertising, premium features, bandwidth"
              ]
            },
            {
              "code": "C2.2.4",
              "term": "Privacy",
              "definition": "The degree to which users' personal information is protected on the platform, and whether their data is shared with third parties.",
              "examTip": "Privacy links to F2 (GDPR) — data collected by social platforms must be handled lawfully.",
              "keyFacts": [
                "GDPR requires users to consent to data collection",
                "Platforms may sell data to advertisers — privacy risk",
                "Users may be unaware of what data is collected",
                "Organisations must have a clear privacy policy"
              ]
            },
            {
              "code": "C2.2.5",
              "term": "Security",
              "definition": "Protecting user accounts and data from unauthorised access, hacking, and malicious content on the online community platform.",
              "keyFacts": [
                "Account security: strong passwords, MFA",
                "Malicious links/content spread through communities",
                "Organisations must monitor for data breaches",
                "HTTPS ensures data in transit is encrypted"
              ]
            },
            {
              "code": "C2.2.6",
              "term": "Downtime",
              "definition": "Periods when the online platform is unavailable, preventing users from accessing content or communicating.",
              "keyFacts": [
                "Planned downtime for maintenance vs unexpected outages",
                "Business-critical platforms need high availability (99.9% uptime)",
                "Downtime causes loss of revenue and user trust",
                "Cloud-hosted platforms generally have better uptime than self-hosted"
              ]
            },
            {
              "code": "C2.2.7",
              "term": "Training",
              "definition": "The education required for employees and users to effectively use and manage the online community platform.",
              "keyFacts": [
                "Staff need training to moderate and manage platforms",
                "Users may need guidance on how to interact safely",
                "Training has a cost — time and money",
                "Ongoing training needed as platforms update"
              ]
            },
            {
              "code": "C2.2.8",
              "term": "Integration with Current Systems",
              "definition": "How easily the online community platform connects with existing software and systems already used by the organisation.",
              "keyFacts": [
                "Must integrate with CRM, email, analytics tools",
                "Poor integration creates duplicate work and data silos",
                "API availability is key to integration",
                "Migration from old system can cause temporary disruption"
              ]
            },
            {
              "code": "C2.2.9",
              "term": "Productivity",
              "definition": "The impact of the online community platform on the efficiency and output of employees and the organisation.",
              "keyFacts": [
                "Well-used communities can speed up problem-solving and collaboration",
                "Excessive social media use can reduce focus and output",
                "Organisations often set acceptable use policies to manage this",
                "Internal communities (e.g. Yammer, Teams) can replace lengthy email chains"
              ]
            },
            {
              "code": "C2.2.10",
              "term": "Working Practices and Company Policies",
              "definition": "The rules and guidelines organisations set for how employees interact on online communities — including acceptable use policies and social media guidelines.",
              "examTip": "Link to F1.1.6 (acceptable use policies) — organisations set rules to protect their reputation and comply with law.",
              "keyFacts": [
                "Acceptable use policies (AUPs) define what is/isn't allowed",
                "Employees represent the company online — misconduct has consequences",
                "Policies must comply with employment law and GDPR",
                "Remote work has made online communication policies more important"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_D = {
  "section": "D",
  "title": "Protecting Data and Information",
  "tier": 1,
  "colour": "#e53e3e",
  "topics": [
    {
      "code": "D1",
      "title": "Threats to Data, Information, and Systems",
      "subtopics": [
        {
          "code": "D1.1",
          "title": "Types of External Threats to Data",
          "items": [
            {
              "code": "D1.1.1",
              "term": "Viruses and Other Malware",
              "definition": "Malicious software (malware) designed to damage, disrupt, gain unauthorised access to, or steal data from computer systems. A virus specifically attaches itself to legitimate files and spreads when those files are shared.",
              "examples": "Ransomware encrypting a hospital's patient records and demanding payment; spyware silently recording keystrokes to steal banking passwords; a worm spreading automatically across a company network.",
              "examTip": "Learn the specific types and how each works — exams ask you to 'describe' a specific threat, not just 'name malware'. Ransomware = encrypts files + demands payment. Spyware = monitors user secretly. Trojan = disguised as legitimate software.",
              "keyFacts": [
                "Virus: attaches to files, spreads when files are shared, requires user action to activate",
                "Worm: self-replicating, spreads automatically across networks without user action",
                "Ransomware: encrypts victim's files, demands payment (ransom) for decryption key",
                "Spyware: secretly monitors user activity, captures keystrokes, sends data to attacker",
                "Trojan: disguises itself as legitimate software to trick users into installing it",
                "Adware: displays unwanted adverts, may also collect data without consent",
                "All malware types can cause data loss, financial loss, and reputational damage"
              ],
              "comparisonTable": {
                "title": "Types of Malware Compared",
                "headers": ["Type", "How it spreads", "What it does", "Key distinguishing feature"],
                "rows": [
                  ["Virus", "Attached to files; spreads when files shared/opened", "Corrupts or deletes files; can spread across systems", "Needs a host file; requires user to run it"],
                  ["Worm", "Exploits network vulnerabilities; spreads automatically", "Consumes bandwidth; installs backdoors; self-replicates", "No host file needed; spreads without user action"],
                  ["Ransomware", "Email attachments, malicious downloads, exploit kits", "Encrypts files; demands payment for decryption key", "Victim's own data used as leverage"],
                  ["Spyware", "Bundled with free software; drive-by downloads", "Records keystrokes, screenshots, browsing; steals credentials", "Operates silently in background"],
                  ["Trojan", "Disguised as legitimate software download", "Creates backdoor; installs other malware; steals data", "Tricks user into installing it voluntarily"],
                  ["Adware", "Bundled with free software or browser extensions", "Displays unwanted ads; may track browsing", "Often technically 'legal' if buried in terms"]
                ]
              }
            },
            {
              "code": "D1.1.2",
              "term": "Unauthorised Access – Hackers",
              "definition": "Hackers gain access to systems or networks without permission. They may exploit software vulnerabilities, use stolen credentials, or deploy tools such as brute-force attacks to bypass security.",
              "examples": "A hacker exploiting an unpatched vulnerability in a company's web server to access customer data; a criminal using credential stuffing to log into accounts using passwords leaked in a previous breach.",
              "examTip": "'Unauthorised access' is the correct Pearson terminology. Distinguish between black-hat (malicious), white-hat (ethical/security testing) and grey-hat hackers if the question asks about types.",
              "keyFacts": [
                "Exploit software vulnerabilities — unpatched software is a key target",
                "Brute-force attacks: systematically try all password combinations until one works",
                "Credential stuffing: use username/password pairs leaked from one breach on other sites",
                "SQL injection: insert malicious code into web forms to access databases",
                "Man-in-the-middle (MitM): intercept communication between two parties",
                "Motivated by financial gain, data theft, disruption, or notoriety"
              ]
            },
            {
              "code": "D1.1.3",
              "term": "Accidental Damage",
              "definition": "Unintentional harm to hardware, software, or data caused by human error or physical accidents — not by malicious intent.",
              "examples": "An employee accidentally deleting a database; hardware damage from spilling liquid on a server; a staff member overwriting important files while running a script.",
              "examTip": "Accidental damage is an external OR internal threat depending on context. It is distinct from deliberate malicious action — examiners may ask you to distinguish between intentional and unintentional threats.",
              "keyFacts": [
                "Human error is one of the most common causes of data loss",
                "Protection measures: regular backups, file permissions, version control",
                "Staff training reduces the likelihood of accidental damage",
                "Clearly distinct from deliberate/malicious threats"
              ]
            },
            {
              "code": "D1.1.4",
              "term": "Social Engineering",
              "definition": "Manipulating people — rather than systems — into revealing confidential information or performing actions that compromise security. Exploits human psychology (trust, fear, authority) rather than technical vulnerabilities.",
              "examples": "Phishing email pretending to be a bank asking the user to 'verify' login details; a vishing call where an attacker poses as IT support to get an employee's password; a pretexting attack where an attacker creates a fabricated scenario.",
              "examTip": "Social engineering attacks the human, not the machine. Key techniques: phishing (email), vishing (voice/phone), smishing (SMS), pretexting (fabricated scenario), baiting (physical USB left somewhere). Exams often use phishing scenarios.",
              "keyFacts": [
                "Phishing: fake emails mimicking trusted organisations to steal credentials or install malware",
                "Spear-phishing: targeted phishing using personal details to appear more convincing",
                "Vishing: voice/phone call impersonating IT support, bank, or authority figure",
                "Smishing: phishing via SMS text messages",
                "Pretexting: attacker invents a scenario to justify requesting sensitive information",
                "Baiting: leaving infected USB drives in public places hoping someone plugs them in",
                "Defence: staff training/awareness, email filtering, multi-factor authentication"
              ],
              "comparisonTable": {
                "title": "Social Engineering Techniques Compared",
                "headers": ["Technique", "Method", "Example", "Key defence"],
                "rows": [
                  ["Phishing", "Fake email mimicking trusted sender", "Email appearing to be from bank asking to 'verify' account", "Email filtering; verify sender; never click unverified links"],
                  ["Spear-phishing", "Targeted phishing using personal details", "Email using victim's name and employer details to appear legitimate", "Staff awareness training; verify requests through separate channel"],
                  ["Vishing", "Phone call impersonating authority figure", "Caller claiming to be IT support asking for password to 'fix an issue'", "Never give passwords by phone; verify caller identity independently"],
                  ["Smishing", "Phishing via SMS text message", "Text claiming parcel delivery failed, asking to click link to rebook", "Do not click links in unexpected texts; verify via official website"],
                  ["Pretexting", "Fabricated scenario to justify information request", "Attacker poses as HR to collect employee personal details for 'payroll update'", "Verify identity via official channels before providing any information"],
                  ["Baiting", "Physical media left for victim to find and use", "Infected USB drive left in company car park labelled 'Salary Data'", "Policy against using unknown USB devices; security awareness training"]
                ]
              }
            },
            {
              "code": "D1.1.5",
              "term": "Natural Disasters",
              "definition": "Physical events (floods, fires, earthquakes, power surges from lightning) that can destroy hardware, corrupt data, and cause prolonged system downtime.",
              "examples": "A server room flooded, destroying all on-site storage; a fire in a data centre wiping out backup tapes stored alongside primary servers; a lightning strike causing a power surge that destroys equipment.",
              "examTip": "Natural disasters justify the need for off-site backups and disaster recovery plans. If the question mentions a flood or fire destroying data, link to D2.1.3 (backup and recovery procedures).",
              "keyFacts": [
                "Cannot be predicted or prevented — only mitigated through preparation",
                "Off-site or cloud backups protect data from local physical disasters",
                "Disaster recovery plans (DRP) define how operations resume after a disaster",
                "Geographic redundancy: keeping backups in a different physical location or country",
                "Business continuity planning ensures organisation can continue operating"
              ]
            }
          ]
        },
        {
          "code": "D1.2",
          "title": "Types of Internal Threats to Data",
          "items": [
            {
              "code": "D1.2.1",
              "term": "Access to Inappropriate Websites",
              "definition": "Employees visiting malicious, illegal, or policy-violating websites on organisation systems, which can introduce malware, result in legal liability, or compromise the network.",
              "examples": "An employee visiting a piracy site that silently installs malware; accessing gambling sites on a work device; downloading pirated software from a third-party website.",
              "examTip": "This is an internal threat because it originates from an authorised user's (mis)behaviour. Link to acceptable use policies (F1.1.6) and web filtering as a control.",
              "keyFacts": [
                "Can introduce malware via drive-by downloads or malicious ads",
                "Creates legal liability if illegal content is accessed on organisation systems",
                "Productivity loss is also a concern",
                "Mitigated by web filtering software and acceptable use policies",
                "Monitoring of web usage raises ethical concerns about employee privacy"
              ]
            },
            {
              "code": "D1.2.2",
              "term": "Accidental Disclosure of Data",
              "definition": "Unintentional sharing of confidential or personal data by an employee — without malicious intent, but still constituting a data breach.",
              "examples": "Emailing a spreadsheet of customer data to the wrong recipient; sharing a screen during a video call that reveals confidential documents; leaving a laptop unlocked in a public place.",
              "examTip": "Accidental disclosure is still a GDPR breach even if unintentional. The organisation is still liable. Exams may ask you to distinguish this from D1.2.3 (deliberate stealing/leaking).",
              "keyFacts": [
                "Still a reportable GDPR breach even with no malicious intent",
                "Organisation must notify the ICO within 72 hours if the breach risks individuals' rights",
                "Common causes: wrong email recipient, unencrypted data sent, lost devices",
                "Mitigated by staff training, email DLP tools, encryption, clear desk policies",
                "Example: a healthcare worker accidentally emailing patient records to the wrong clinic"
              ]
            },
            {
              "code": "D1.2.3",
              "term": "Stealing/Leaking Information",
              "definition": "A deliberate internal threat where an employee, contractor, or other authorised user intentionally copies, shares, or sells confidential data — often to a competitor, for financial gain, or out of grievance.",
              "examples": "A departing employee copying the entire customer database to a personal USB before leaving; an employee selling trade secrets to a competitor; a contractor leaking confidential product designs.",
              "examTip": "The key distinction from D1.2.2 is intent — this is deliberate. Inside knowledge makes this particularly damaging as the threat actor already has legitimate access.",
              "keyFacts": [
                "Insider threat: particularly dangerous because attacker already has access rights",
                "Motivation: financial gain, grievance, coercion by external parties",
                "Hard to detect — difficult to distinguish malicious data access from normal work",
                "Mitigation: principle of least privilege (only grant access needed for the role)",
                "Data Loss Prevention (DLP) tools can monitor and block unusual data transfers",
                "Background checks, exit interviews, and revoking access promptly on departure"
              ]
            },
            {
              "code": "D1.2.4",
              "term": "Use of Portable Devices",
              "definition": "Employees using USB drives, external hard drives, laptops, or personal mobile devices for work purposes, which can introduce malware or result in data being lost or stolen if the device is lost.",
              "examples": "An employee copying sensitive files to an unencrypted USB drive that is then lost; a personal laptop infected with malware connecting to the corporate network via VPN; a memory stick containing patient records left on a train.",
              "examTip": "USB/portable devices = two risks in one: (1) malware introduction, (2) data loss if device lost or stolen. The organisation can mitigate by encrypting data on portable devices and blocking USB ports via policy/software.",
              "keyFacts": [
                "Lost/stolen devices containing unencrypted data = serious GDPR breach",
                "USB drives can introduce malware if they contain infected files",
                "BYOD (Bring Your Own Device) policies govern use of personal devices for work",
                "Encryption of data on portable devices reduces impact of loss",
                "Many organisations disable USB ports entirely or use device management software",
                "Baiting attacks specifically exploit human curiosity about unknown USB drives"
              ],
              "comparisonTable": {
                "title": "Internal Threats Compared",
                "headers": ["Threat", "Intentional?", "Who causes it", "Example", "Primary control"],
                "rows": [
                  ["Inappropriate website access", "Usually unintentional", "Any employee", "Visiting piracy site that installs malware", "Web filtering, AUP"],
                  ["Accidental disclosure", "No — human error", "Any employee", "Emailing customer data to wrong address", "Staff training, DLP tools, encryption"],
                  ["Stealing/leaking data", "Yes — deliberate", "Disgruntled or bribed employee", "Copying customer DB to USB before leaving", "Least privilege access, DLP, monitoring"],
                  ["Portable device misuse", "Either — often careless", "Any employee", "Losing unencrypted USB with patient data", "Encryption, USB port controls, BYOD policy"]
                ]
              }
            }
          ]
        },
        {
          "code": "D1.3",
          "title": "Impact on Individuals and Organisations",
          "items": [
            {
              "code": "D1.3.1",
              "term": "Loss of Data",
              "definition": "Data is permanently lost, destroyed, or made inaccessible — whether through attack, accidental deletion, hardware failure, or disaster. Can range from minor inconvenience to catastrophic operational failure.",
              "examples": "A ransomware attack encrypting all files and the organisation having no backup; a flood destroying the only copy of a customer database.",
              "examTip": "Loss of data is a direct impact. Examiners expect you to link it to downstream consequences: operational disruption, inability to serve customers, loss of revenue.",
              "keyFacts": [
                "Can affect individuals: losing personal files, identity documents, photos",
                "Can affect organisations: loss of customer records, financial data, intellectual property",
                "If no backup exists, data loss may be permanent",
                "Operational disruption: cannot process orders, access accounts, or function normally",
                "Prevention: regular offsite backups, RAID storage, cloud replication"
              ]
            },
            {
              "code": "D1.3.2",
              "term": "Financial Loss Due to Legal Action",
              "definition": "Organisations that suffer or cause a data breach may face financial penalties from the ICO under GDPR, and civil lawsuits from individuals whose data was compromised.",
              "examples": "ICO fining a company £500,000 for failing to secure customer data; a class-action lawsuit from customers affected by a data breach; the cost of notifying affected individuals and hiring forensic investigators.",
              "examTip": "Always quote the GDPR fine scale for high marks: up to £17.5 million OR 4% of global annual turnover (whichever is higher). This shows examiner-level knowledge.",
              "keyFacts": [
                "GDPR fines: up to £17.5 million or 4% of global annual turnover (whichever is greater)",
                "ICO (Information Commissioner's Office) enforces data protection law in the UK",
                "Must notify ICO within 72 hours of becoming aware of a breach",
                "Must notify affected individuals if breach poses high risk to their rights",
                "Additional costs: forensic investigation, system recovery, customer notification, PR crisis management",
                "Civil claims from affected individuals add further financial liability"
              ]
            },
            {
              "code": "D1.3.3",
              "term": "Loss of Customers Due to Public Image",
              "definition": "A data breach or cyber attack that becomes public knowledge damages customer trust and the organisation's reputation, leading to reduced sales, customer churn, and long-term brand damage.",
              "examples": "A retailer suffering a breach of payment card data losing 20% of customers to competitors; a social media platform losing user trust after a data scandal; negative press coverage amplifying customer anxiety.",
              "examTip": "Reputational damage is a long-term impact — even after the technical issue is fixed, customers may not return. Examiners want you to explain the chain: breach → publicity → loss of trust → fewer customers → reduced revenue.",
              "keyFacts": [
                "Loss of trust is difficult and slow to rebuild",
                "Social media amplifies negative coverage rapidly",
                "Affected customers may switch to competitors permanently",
                "Share price of listed companies often drops significantly after a major breach",
                "Long-term revenue impact may far exceed the direct cost of the breach itself",
                "Organisations need a PR/communications strategy alongside technical response"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "D2",
      "title": "Protecting Data",
      "subtopics": [
        {
          "code": "D2.1",
          "title": "Techniques Used to Protect Data and Systems",
          "items": [
            {
              "code": "D2.1.1",
              "term": "File Permissions",
              "definition": "Access controls applied to files and folders that determine which users or user groups can read, write, execute, or delete specific files. Implements the principle of least privilege.",
              "examples": "A payroll file set so only HR staff can view and edit it; a shared read-only document that all employees can view but not modify; a system folder that only administrators can access.",
              "examTip": "File permissions = controlling WHO can do WHAT with which files. Link to principle of least privilege — users only get the minimum access required for their job.",
              "keyFacts": [
                "Read: user can view but not change the file",
                "Write: user can modify or create files in a folder",
                "Execute: user can run a program/script",
                "Delete: user can remove files",
                "Applied to individuals or groups (e.g. all Sales staff have read-only access to pricing data)",
                "Reduces risk of both accidental and deliberate data modification or leakage"
              ]
            },
            {
              "code": "D2.1.2",
              "term": "Access Levels",
              "definition": "A hierarchy of user privilege levels that determine what systems, data, and functions different users can access. Higher access levels have greater permissions.",
              "examples": "Guest user can only view public pages; standard employee can access their department's files; manager can access team reports; IT admin has full system access.",
              "examTip": "Access levels = role-based access control (RBAC). The principle of least privilege means each user only has the minimum access needed for their role — reducing the attack surface.",
              "keyFacts": [
                "Common levels: guest → standard user → manager → administrator → root/superuser",
                "Role-based: access is tied to job function, not individual preference",
                "Reduces damage if an account is compromised — attacker only gets that user's permissions",
                "Should be reviewed regularly — especially when employees change roles or leave",
                "Separation of duties: no single user should have access to all critical functions"
              ],
              "comparisonTable": {
                "title": "File Permissions vs Access Levels",
                "headers": ["Feature", "File Permissions", "Access Levels"],
                "rows": [
                  ["What it controls", "What a user can do with a specific file/folder (read/write/execute/delete)", "What systems, applications, and data a user can access at all"],
                  ["Granularity", "Fine-grained — per file/folder", "Broader — per role or user group"],
                  ["Example", "Only finance team can write to budget.xlsx", "Only managers can log in to the HR management system"],
                  ["Managed by", "File system (OS) permissions", "User account management / directory services (e.g. Active Directory)"],
                  ["Principle applied", "Least privilege at file level", "Least privilege at system/resource level"],
                  ["Why it matters", "Prevents unauthorised file modification or data leakage", "Limits blast radius if account is compromised"]
                ]
              }
            },
            {
              "code": "D2.1.3",
              "term": "Backup and Recovery Procedures",
              "definition": "A strategy for regularly copying data to a separate location so it can be restored if the original is lost, corrupted, or destroyed. The recovery plan defines how and how fast systems can be brought back online.",
              "examples": "A company performing daily incremental backups to cloud storage and weekly full backups to an off-site data centre; a hospital restoring patient records from last night's backup after a ransomware attack.",
              "examTip": "Learn the three backup types: full, incremental, differential. Also: 3-2-1 rule (3 copies, 2 different media, 1 off-site). Exams often ask 'why keep backups off-site?' — answer: to protect against local disasters (fire, flood).",
              "keyFacts": [
                "Full backup: copies all data every time — slowest and most storage, but fastest to restore",
                "Incremental backup: copies only data changed since the last backup — fast and small, slower to restore",
                "Differential backup: copies data changed since last full backup — middle ground",
                "3-2-1 rule: 3 copies of data, on 2 different types of media, with 1 stored off-site",
                "Recovery Time Objective (RTO): how quickly systems must be restored",
                "Recovery Point Objective (RPO): maximum acceptable data loss (e.g. can lose up to 24 hours of data)",
                "Backups must be tested — an untested backup may not restore correctly"
              ],
              "comparisonTable": {
                "title": "Backup Types Compared",
                "headers": ["Type", "What it backs up", "Backup speed", "Storage needed", "Restore speed", "Best for"],
                "rows": [
                  ["Full backup", "All data every time", "Slowest", "Most storage", "Fastest — one backup set", "Weekly baseline; critical systems"],
                  ["Incremental backup", "Only changes since last backup (full or incremental)", "Fastest", "Least storage", "Slowest — need full + all incrementals", "Daily backups; large datasets"],
                  ["Differential backup", "All changes since last full backup", "Medium", "Medium", "Medium — need full + latest differential", "Balance between storage and restore speed"]
                ]
              }
            },
            {
              "code": "D2.1.4",
              "term": "Passwords and Multi-Factor Authentication (MFA)",
              "definition": "Passwords are the primary method of verifying a user's identity. MFA requires additional verification factors beyond just the password, significantly increasing security.",
              "examples": "A user logging in with a password plus a 6-digit code from an authenticator app; a bank requiring password + fingerprint to authorise a large transfer; SMS verification code sent to a mobile phone.",
              "examTip": "Pearson groups passwords AND MFA together under D2.1.4. For MFA, name the three factor types: something you KNOW (password/PIN), something you HAVE (phone/token), something you ARE (biometric). Exams often ask why MFA is more secure than password alone.",
              "keyFacts": [
                "Strong password: long (12+ characters), mix of upper/lower case, numbers and symbols, not a dictionary word",
                "Password managers store complex passwords securely so users don't reuse weak passwords",
                "MFA factor types: something you KNOW + something you HAVE + something you ARE",
                "Even if password is stolen/guessed, attacker cannot access account without second factor",
                "Common MFA methods: SMS code, authenticator app (TOTP), hardware token, biometric",
                "Single sign-on (SSO): one secure login grants access to multiple systems — reduces password fatigue"
              ]
            },
            {
              "code": "D2.1.5",
              "term": "Biometrics",
              "definition": "Authentication using unique physical or behavioural characteristics of a person — such as fingerprints, facial structure, iris patterns, or voice.",
              "examples": "Fingerprint scanner to unlock a smartphone; facial recognition to access a secure office; iris scan at airport border control.",
              "examTip": "Biometrics = 'something you ARE'. Key advantage: cannot be forgotten or easily shared. Key concern: if biometric data is stolen, it cannot be changed like a password.",
              "keyFacts": [
                "Types: fingerprint, facial recognition, iris scan, retinal scan, voice recognition, gait analysis",
                "Advantage: unique to individual — cannot be forgotten, lost, or easily shared",
                "Advantage: faster than typing a password",
                "Disadvantage: biometric data cannot be changed if compromised",
                "Disadvantage: can be fooled (spoofed) by high-quality photos/models in some systems",
                "Raises privacy concerns — organisations must store biometric data securely under GDPR",
                "False acceptance rate (FAR) vs false rejection rate (FRR) trade-off"
              ]
            },
            {
              "code": "D2.1.6",
              "term": "Physical Access Control",
              "definition": "Security measures that physically prevent unauthorised individuals from entering areas containing IT equipment, servers, or sensitive data.",
              "examples": "Swipe card system to enter a server room; biometric door locks on a data centre; CCTV cameras monitoring office entry points; security guards at building reception.",
              "examTip": "Physical access control prevents the most direct form of attack — walking in and stealing hardware. Exams may ask you to explain why physical security is as important as cybersecurity.",
              "keyFacts": [
                "Swipe cards / key fobs: grant access only to authorised personnel; access logs created",
                "Biometric door locks: fingerprint or iris required to enter secure areas",
                "Security guards: human oversight of access control",
                "CCTV: deters and records unauthorised access attempts",
                "Mantrap / airlock: two-door system where second door only opens after first is closed — prevents tailgating",
                "Clean desk policy: no sensitive documents left visible or accessible when unattended"
              ]
            },
            {
              "code": "D2.1.7",
              "term": "Digital Certificates",
              "definition": "Electronic credentials issued by a trusted Certificate Authority (CA) that verify the identity of a website, server, or individual, and enable encrypted communications.",
              "examples": "The padlock icon in a browser indicating a valid SSL/TLS certificate; an organisation's web server presenting a certificate signed by a trusted CA like DigiCert; code signing certificates verifying that software has not been tampered with.",
              "examTip": "Digital certificates = proof of identity + enable encryption. The CA is the trusted third party. HTTPS websites must have a valid certificate — if it's expired/invalid, browsers warn the user.",
              "keyFacts": [
                "Issued by a Certificate Authority (CA) — a trusted third party (e.g. DigiCert, Let's Encrypt)",
                "Contains: website/owner's public key, identity information, expiry date, CA's digital signature",
                "Used in HTTPS to (1) verify the server is genuine and (2) establish the encryption key",
                "Without a valid certificate, an attacker could impersonate a website (man-in-the-middle)",
                "Browsers show a padlock icon for valid certificates; warning page for expired/untrusted ones",
                "Also used in email (S/MIME) and software distribution (code signing)"
              ]
            }
          ]
        },
        {
          "code": "D2.2",
          "title": "Features and Functions of Antivirus Software",
          "items": [
            {
              "code": "D2.2",
              "term": "Antivirus Software",
              "definition": "Security software that detects, quarantines, and removes malicious software from a system by scanning files against a database of known malware signatures and using behavioural analysis to detect unknown threats.",
              "examples": "Windows Defender scanning downloaded files and alerting the user to ransomware; corporate endpoint protection software blocking a trojan before it can execute.",
              "examTip": "Antivirus must be kept updated — new malware is created daily and old definitions won't catch new threats. Heuristic analysis catches zero-day (unknown) threats by suspicious behaviour, not just known signatures.",
              "keyFacts": [
                "Signature-based detection: compares files against database of known malware signatures",
                "Heuristic analysis: detects suspicious behaviour patterns to catch unknown/zero-day malware",
                "Real-time scanning: monitors files and processes continuously as they run",
                "Quarantine: moves suspected malware to an isolated location before deletion",
                "Regular definition updates essential: without updates, new malware won't be detected",
                "Cannot protect against threats it hasn't been updated to recognise",
                "Should be combined with other controls (firewall, MFA, backups) — not used in isolation"
              ]
            }
          ]
        },
        {
          "code": "D2.3",
          "title": "Features and Functions of Firewalls",
          "items": [
            {
              "code": "D2.3",
              "term": "Firewalls",
              "definition": "A security system that monitors and controls incoming and outgoing network traffic based on predefined security rules. Creates a barrier between a trusted internal network and untrusted external networks (such as the internet).",
              "examples": "A company firewall blocking all incoming traffic on ports not required for business operations; a personal firewall on a laptop blocking an application from making unexpected outbound connections; a next-generation firewall performing deep packet inspection.",
              "examTip": "Hardware firewall = sits at the network perimeter, protects all devices behind it. Software firewall = installed on individual device. Exams often ask to 'describe the function' — answer: monitors traffic, applies rules to allow/block, creates barrier between internal and external networks.",
              "keyFacts": [
                "Packet filtering: examines each data packet's source/destination address and port against rules",
                "Stateful inspection: tracks active connections, only allows packets that are part of established sessions",
                "Application layer (next-gen) firewall: inspects packet contents, not just headers",
                "Can block specific websites, applications, or IP address ranges",
                "Hardware firewall: dedicated device protecting entire network (e.g. at company router)",
                "Software firewall: runs on individual computers (e.g. Windows Firewall)",
                "Cannot protect against threats originating inside the network (insider threats)"
              ],
              "comparisonTable": {
                "title": "Hardware Firewall vs Software Firewall",
                "headers": ["Feature", "Hardware Firewall", "Software Firewall"],
                "rows": [
                  ["Where it sits", "Network perimeter — between internet and internal network", "On individual device (PC, laptop, server)"],
                  ["What it protects", "All devices on the network", "Only the device it is installed on"],
                  ["Performance impact", "None on individual devices — runs on dedicated hardware", "Uses some CPU and RAM on the host device"],
                  ["Cost", "Higher upfront cost for dedicated appliance", "Often free (built into OS) or low-cost subscription"],
                  ["Management", "Centralised — IT team manages rules for all devices", "Decentralised — each device has its own settings"],
                  ["Limitation", "Does not protect against threats originating inside the network", "Only protects one device; user may disable it"],
                  ["Best for", "Businesses protecting their entire network", "Individual users; supplementary layer on specific devices"]
                ]
              }
            }
          ]
        },
        {
          "code": "D2.4",
          "title": "Features and Functions of Encryption Methods",
          "items": [
            {
              "code": "D2.4.1",
              "term": "Encryption of Stored Data (Data at Rest)",
              "definition": "Encrypting data stored on hard drives, databases, USB drives, or cloud storage so that even if the physical medium is stolen or accessed without authorisation, the data cannot be read without the decryption key.",
              "examples": "BitLocker encrypting a laptop's hard drive so a stolen laptop's data cannot be read; an encrypted database of customer payment details; encrypted backup tapes stored off-site.",
              "examTip": "Data at rest = stored data. Full disk encryption means if a device is stolen, the data is unreadable. Key management is critical — if the key is lost, the data cannot be recovered either.",
              "keyFacts": [
                "Full disk encryption (FDE): encrypts entire hard drive — e.g. BitLocker (Windows), FileVault (macOS)",
                "Database encryption: individual records or entire database encrypted at storage level",
                "Protects against theft of physical devices (laptops, USB drives, backup tapes)",
                "The decryption key must be stored separately and securely",
                "Does not protect data once it is accessed — a logged-in user still sees plaintext data"
              ]
            },
            {
              "code": "D2.4.2",
              "term": "Encryption of Data During Transmission (Data in Transit)",
              "definition": "Encrypting data as it travels across a network or the internet so that it cannot be read if intercepted by a third party.",
              "examples": "A VPN encrypting all traffic between a remote worker and the company network; TLS encrypting email messages in transit; end-to-end encryption in WhatsApp meaning only sender and recipient can read messages.",
              "examTip": "Data in transit = data being sent. Key protocols: TLS/SSL (for HTTPS, email), VPN tunnelling. End-to-end encryption (E2E) means even the service provider cannot read the content.",
              "keyFacts": [
                "TLS (Transport Layer Security): successor to SSL; protects HTTPS web traffic and email",
                "VPN: encrypts all traffic between device and network endpoint",
                "End-to-end encryption (E2E): only sender and recipient can decrypt — not even the platform provider",
                "Symmetric encryption: both parties use the same key (fast; key must be shared securely)",
                "Asymmetric encryption: public/private key pair — public key encrypts, private key decrypts (used to establish TLS sessions)",
                "Without encryption, data sent over public Wi-Fi can be intercepted (MitM attack)"
              ]
            },
            {
              "code": "D2.4.3",
              "term": "Encryption in Secure Websites (HTTPS)",
              "definition": "HTTPS (HyperText Transfer Protocol Secure) uses TLS/SSL encryption to secure communication between a user's browser and a web server, verifying the server's identity and encrypting all data exchanged.",
              "examples": "A bank's website using HTTPS to protect login credentials and transaction data; an e-commerce site encrypting payment card details during checkout; a browser displaying a padlock icon to confirm a secure connection.",
              "examTip": "HTTPS = HTTP + TLS/SSL. The three things HTTPS provides: (1) encryption — data cannot be read in transit, (2) integrity — data has not been tampered with, (3) authentication — server identity verified via digital certificate.",
              "keyFacts": [
                "Padlock icon in browser = valid HTTPS/TLS certificate in place",
                "TLS handshake: browser and server agree on encryption method and exchange keys before data transfer",
                "Digital certificate (issued by CA) verifies the server's identity — prevents impersonation",
                "Without HTTPS, login credentials sent over HTTP can be captured by a packet sniffer",
                "Google Chrome marks HTTP sites as 'Not Secure' — HTTPS is now the standard",
                "HSTS (HTTP Strict Transport Security): forces browsers to always use HTTPS for a domain"
              ],
              "comparisonTable": {
                "title": "Encryption Contexts Compared",
                "headers": ["Context", "Data at Rest (D2.4.1)", "Data in Transit (D2.4.2)", "HTTPS (D2.4.3)"],
                "rows": [
                  ["What is protected", "Stored files, databases, drives", "Data being sent across a network", "Web traffic between browser and server"],
                  ["When protection applies", "While data is stored / device is offline", "While data is being transmitted", "During every HTTPS web session"],
                  ["Key technology", "BitLocker, FileVault, AES encryption", "TLS, VPN, E2E encryption", "TLS/SSL + digital certificate"],
                  ["Main threat prevented", "Physical theft of device/storage", "Man-in-the-middle interception", "Impersonation of website + data interception"],
                  ["Example attack prevented", "Stolen encrypted laptop — data unreadable", "Intercepted Wi-Fi traffic — data unreadable", "Fake bank website impersonation thwarted"],
                  ["Who manages it", "OS/disk encryption software; DBA for databases", "Network admin (VPN); app developers (TLS)", "Web server admin (certificate) + browser"]
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_E = {
  "section": "E",
  "title": "Impact of Using IT Systems",
  "tier": 1,
  "colour": "#dd6b20",
  "topics": [
    {
      "code": "E1",
      "title": "Online Services",
      "subtopics": [
        {
          "code": "E1.1",
          "title": "Features and Implications of Online Services",
          "items": [
            {
              "code": "E1.1.1",
              "term": "Online Retail",
              "definition": "The buying and selling of goods and services over the internet. Customers browse, order, and pay online; sellers manage stock, fulfilment, and customer service through digital systems.",
              "examples": "Amazon, ASOS, Tesco online grocery delivery, eBay marketplace.",
              "examTip": "Cover both sides — benefits for customers (24/7, convenience, choice) AND impacts on traditional retailers (high street decline, reduced footfall). Also cover risks: data breaches, returns fraud, delivery failures.",
              "keyFacts": [
                "Benefits for customers: 24/7 access, global product choice, price comparison tools, delivery to door",
                "Benefits for retailers: lower overheads than physical stores, global customer reach, data-driven personalisation",
                "Risks for customers: payment fraud, data breaches, counterfeit goods, inability to inspect items",
                "Risks for retailers: cybersecurity threats, high return rates, reliance on delivery infrastructure",
                "Impact on society: decline of high street retailers, job losses in physical retail, rise of warehouse/logistics jobs",
                "Click and collect: hybrid model combining online convenience with physical pickup"
              ]
            },
            {
              "code": "E1.1.2",
              "term": "Online Financial Services",
              "definition": "Banking, insurance, investment, and payment services delivered digitally — allowing customers to manage money, apply for products, and make transactions without visiting a branch.",
              "examples": "Barclays online banking app; PayPal; Monzo digital bank; Compare the Market insurance comparison; Revolut.",
              "examTip": "Key benefits: 24/7 access, instant transfers, real-time notifications. Key risks: fraud, phishing attacks targeting banking customers, exclusion of elderly/less digitally literate users.",
              "keyFacts": [
                "Online banking: view balances, transfer money, pay bills, apply for loans — 24/7",
                "Faster Payments: near-instant bank transfers (previously took 3 working days)",
                "Open banking: regulated sharing of financial data with third-party apps (with consent)",
                "Digital-only banks (Monzo, Starling): no physical branches — lower costs passed to customers",
                "Risk: phishing and vishing attacks specifically targeting banking customers are very common",
                "Financial exclusion: not all customers can use online services — elderly, those without internet access",
                "Regulatory protection: FCA (Financial Conduct Authority) regulates UK financial services"
              ]
            },
            {
              "code": "E1.1.3",
              "term": "Online Education and Training",
              "definition": "Educational content, courses, and qualifications delivered via the internet — ranging from school learning management systems to professional training platforms and university degrees.",
              "examples": "Google Classroom; Microsoft Teams for Education; Moodle VLE; Coursera and Udemy online courses; Khan Academy; BBC Bitesize.",
              "examTip": "Benefits: access from anywhere, self-paced, lower cost than in-person. Challenges: requires reliable internet, lack of face-to-face interaction, self-motivation needed, digital divide disadvantages some learners.",
              "keyFacts": [
                "Virtual Learning Environments (VLEs): e.g. Google Classroom, Moodle — centralise resources, assignments, communication",
                "MOOCs (Massive Open Online Courses): free/low-cost university-level courses to anyone worldwide",
                "Benefits: accessible from home, self-paced, cost-effective, can reach rural/remote learners",
                "Challenges: requires reliable internet and device; less social interaction; harder to maintain discipline",
                "Digital divide: learners without internet/devices at home are disadvantaged",
                "Accelerated by COVID-19 pandemic — rapid shift forced adoption of online learning tools",
                "Hybrid learning: combination of in-person and online increasingly common"
              ]
            },
            {
              "code": "E1.1.4",
              "term": "Online News and Information",
              "definition": "The delivery of news, reference material, and information via websites, apps, and social media — replacing or supplementing traditional print and broadcast media.",
              "examples": "BBC News website; Guardian online; Wikipedia; Reddit as a news aggregator; Twitter/X for breaking news.",
              "examTip": "Key issues: fake news (misinformation), filter bubbles (algorithms showing only agreeable content), speed vs accuracy trade-off, copyright concerns when sharing news content.",
              "keyFacts": [
                "Immediate delivery: news published online within minutes of events occurring",
                "User-generated content: individuals can publish and share news via social media — democratises information",
                "Misinformation/fake news: unverified stories spread rapidly — difficult to distinguish from credible sources",
                "Filter bubble: algorithms show users news matching their existing views — reduces exposure to different perspectives",
                "Revenue model shift: print advertising revenue collapsed; paywalls and subscriptions replacing it",
                "Copyright: re-sharing news articles may infringe copyright of the original publisher",
                "Aggregators (e.g. Google News) compile articles — raise questions about fair use and revenue sharing"
              ]
            },
            {
              "code": "E1.1.5",
              "term": "Online Entertainment and Leisure",
              "definition": "Entertainment content — music, films, TV, games, and social interaction — delivered digitally on demand via the internet.",
              "examples": "Netflix (streaming video); Spotify (streaming audio); Steam (gaming platform); YouTube; TikTok; online multiplayer gaming.",
              "examTip": "Subscription streaming has disrupted traditional media (DVD rental, TV broadcast, music purchases). Key ethical/legal issues: content piracy, age verification, addiction concerns, data privacy.",
              "keyFacts": [
                "Streaming vs downloading: streaming = real-time playback (requires internet); downloading = local copy (offline access)",
                "Subscription model: monthly fee for unlimited access (Netflix, Spotify) replaced purchase model",
                "Impact on traditional media: Blockbuster/DVD rental collapse; CD sales decline; linear TV viewing falling",
                "Requires significant bandwidth — 4K Netflix needs ~25 Mbps; audio streaming ~320 kbps",
                "Piracy: illegal distribution of copyrighted content — violates Copyright Act; harms creators",
                "Age verification: concern around minors accessing inappropriate content online",
                "Addiction and wellbeing: infinite scroll and autoplay features designed to maximise engagement time"
              ]
            },
            {
              "code": "E1.1.6",
              "term": "Online Booking Systems",
              "definition": "Systems that allow customers to search availability, make reservations, and pay online in real time — replacing phone or in-person booking for travel, healthcare, hospitality, and events.",
              "examples": "Booking.com hotel reservations; Trainline train ticket booking; NHS online GP appointment booking; Ticketmaster event tickets; OpenTable restaurant reservations.",
              "examTip": "Benefits: 24/7 availability, instant confirmation, reduces admin workload for staff. Key risks: double booking if systems poorly integrated, payment fraud, customer data security.",
              "keyFacts": [
                "Real-time availability: customers see live availability and confirm instantly — no waiting for staff",
                "24/7 operation: bookings can be made outside business hours",
                "Reduces staff workload: automation handles routine booking admin",
                "Integration challenges: must sync with internal calendar/stock/availability systems",
                "Overbooking risk: system errors or poor integration can allow double-booking",
                "Customer data: booking systems collect significant personal and payment data — GDPR implications",
                "Cancellation and refund policies must be clearly communicated online"
              ],
              "comparisonTable": {
                "title": "Online Services: Benefits and Risks by Sector",
                "headers": ["Sector", "Key benefits", "Key risks/implications", "Example"],
                "rows": [
                  ["Retail (E1.1.1)", "24/7 global access, lower overheads, personalisation", "Data breaches, returns fraud, high street decline", "Amazon, ASOS"],
                  ["Financial services (E1.1.2)", "24/7 access, instant transfers, lower costs", "Phishing fraud, financial exclusion of elderly", "Barclays app, Monzo"],
                  ["Education (E1.1.3)", "Accessible anywhere, self-paced, lower cost", "Digital divide, lack of interaction, self-discipline needed", "Google Classroom, Coursera"],
                  ["News & information (E1.1.4)", "Instant, global, democratised publishing", "Misinformation, filter bubbles, copyright issues", "BBC News, Wikipedia"],
                  ["Entertainment (E1.1.5)", "On-demand, affordable, vast catalogue", "Piracy, addiction design, age verification gaps", "Netflix, Spotify"],
                  ["Booking systems (E1.1.6)", "24/7, instant confirmation, reduces admin", "Double-booking risk, data security, integration issues", "Booking.com, NHS app"]
                ]
              }
            }
          ]
        },
        {
          "code": "E1.2",
          "title": "Uses, Impact and Implications of IT for Individuals and Organisations",
          "items": [
            {
              "code": "E1.2.1",
              "term": "Transactional Data",
              "definition": "Data generated when a customer interacts with an organisation — recording what was purchased, when, for how much, using what payment method, and from which device or location.",
              "examples": "A supermarket's record of every item scanned at checkout; a bank's log of every card transaction; a website's record of every page visit and click; an Amazon order history.",
              "examTip": "Transactional data is raw interaction data — it becomes valuable when analysed. Link to targeted marketing (E1.2.2), stock control (A4.2.1), and data accuracy (E2.4).",
              "keyFacts": [
                "Captures: what was bought, when, how much, payment method, location, device",
                "Used for: demand forecasting, stock replenishment, identifying popular products",
                "Enables personalised recommendations and targeted marketing",
                "Very large volume — big data analytics tools required to process it",
                "Must be stored securely and processed under GDPR",
                "Loyalty card schemes (e.g. Tesco Clubcard) link transactional data to named individuals"
              ]
            },
            {
              "code": "E1.2.2",
              "term": "Targeted Marketing",
              "definition": "Using data analysis to identify individual preferences and behaviours, then delivering personalised advertising or recommendations designed to be relevant to that specific person.",
              "examples": "Amazon recommending products based on browsing and purchase history; Facebook showing adverts based on liked pages and demographic data; Spotify suggesting songs based on listening patterns; retargeting adverts that follow users across websites.",
              "examTip": "Targeted marketing uses transactional data + browsing data + demographic data. Benefits: relevant ads save users time, higher conversion rates for businesses. Ethical concerns: privacy invasion, manipulation, data sold without clear consent.",
              "keyFacts": [
                "Uses cookies: small files stored by websites tracking browsing behaviour across the internet",
                "Data sources: purchase history, browsing history, location data, social media activity, demographic data",
                "Benefit for businesses: higher conversion rates than blanket advertising — cost-effective",
                "Benefit for users: relevant suggestions can save time and highlight products of genuine interest",
                "Ethical concerns: often collected without truly informed consent; can feel intrusive",
                "GDPR: cookie consent required; users must be able to opt out of tracking",
                "Social media algorithms: platforms use engagement data to determine what content/adverts to show"
              ]
            },
            {
              "code": "E1.2.3",
              "term": "Collaborative Working",
              "definition": "IT systems that allow multiple people to work together on shared documents, projects, or tasks simultaneously — regardless of physical location.",
              "examples": "Google Docs allowing multiple authors to edit a document simultaneously; Microsoft SharePoint for shared file storage; Slack for team communication; Trello for project management; GitHub for collaborative code development.",
              "examTip": "Collaborative working tools change how organisations operate — link to productivity, remote working, and the implications of always-connected work culture (work-life balance).",
              "keyFacts": [
                "Real-time co-authoring: multiple users edit same document simultaneously — changes visible instantly",
                "Version control: document history prevents accidental data loss; track who changed what",
                "Cloud storage: files accessible to all team members from any location",
                "Communication integration: chat, video, and file sharing in one platform (e.g. Microsoft Teams)",
                "Benefits: faster project completion, reduced email chains, visible progress tracking",
                "Risks: reliance on internet connectivity; security if access controls poorly managed",
                "Implications: expectation of constant availability can blur work/personal boundaries"
              ]
            },
            {
              "code": "E1.2.4",
              "term": "Remote Working",
              "definition": "Working from a location other than the traditional office — enabled by IT systems including VPN, cloud applications, video conferencing, and collaboration tools.",
              "examples": "An employee working from home using VPN to access company files; a consultant working from a client site; a freelancer working from different locations using cloud-based tools.",
              "examTip": "Remote working depends on: VPN (C1.3.1), cloud systems (C1.1), collaboration tools (E1.2.3), and reliable internet (B3.3). Always link technology enablers to business and human impacts.",
              "keyFacts": [
                "Enablers: VPN for secure network access, SaaS applications (Microsoft 365), video conferencing (Teams/Zoom)",
                "Benefits for organisations: reduced office space costs, access to wider talent pool, business continuity",
                "Benefits for employees: no commute, flexible hours, improved work-life balance",
                "Risks for organisations: harder to monitor staff, cybersecurity risks on home networks, team cohesion challenges",
                "Risks for employees: isolation, difficulty separating work from home life, unreliable home internet",
                "Accelerated massively by COVID-19 pandemic — proved feasibility at scale",
                "Hybrid working: most common post-pandemic model — some office, some home"
              ],
              "comparisonTable": {
                "title": "Transactional Data vs Targeted Marketing",
                "headers": ["Feature", "Transactional Data (E1.2.1)", "Targeted Marketing (E1.2.2)"],
                "rows": [
                  ["What it is", "Raw records of customer interactions (purchases, clicks, payments)", "Using customer data to personalise advertising and recommendations"],
                  ["Who generates it", "Automatically generated when customer interacts with a system", "Created by data analysts/algorithms using collected data"],
                  ["Primary purpose", "Operational record-keeping, stock management, demand forecasting", "Increase sales conversions, improve customer experience"],
                  ["Data sources used", "POS systems, website analytics, payment records", "Transactional data + browsing history + demographics + social media"],
                  ["Benefit to business", "Informs stock ordering, identifies best-sellers, detects fraud", "Higher conversion rate; more cost-effective than mass advertising"],
                  ["Benefit to customer", "Enables faster checkout, loyalty rewards, personalised receipts", "Relevant product suggestions; less irrelevant advertising"],
                  ["Privacy concern", "Individual purchases linked to named persons — GDPR applies", "Tracking across websites; consent often unclear; feels intrusive"],
                  ["GDPR requirement", "Store securely, use only for stated purpose, retain no longer than necessary", "Explicit cookie consent; right to opt out of tracking"]
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "code": "E2",
      "title": "Using and Manipulating Data",
      "subtopics": [
        {
          "code": "E2.1",
          "title": "Sources of Data",
          "items": [
            {
              "code": "E2.1.1",
              "term": "Primary Data",
              "definition": "Original data collected directly by the researcher or organisation for a specific, current purpose. It is first-hand data that did not exist before the researcher collected it.",
              "examples": "A business conducting a customer satisfaction survey; a researcher running focus groups with users; a company collecting product usage telemetry directly from its app.",
              "examTip": "Primary = collected by YOU, for YOUR purpose, RIGHT NOW. More relevant and up to date than secondary, but expensive and time-consuming to collect.",
              "keyFacts": [
                "Collected directly — first-hand, new data",
                "Specific to the researcher's exact needs",
                "Always up to date when collected",
                "Collection methods: surveys, questionnaires, interviews, focus groups, observation, experiments",
                "Disadvantage: expensive, time-consuming, requires participant cooperation",
                "Small sample sizes are a common limitation — may not represent the full population"
              ]
            },
            {
              "code": "E2.1.2",
              "term": "Secondary Data",
              "definition": "Data that already exists, having been collected by someone else for a different original purpose. The researcher uses it second-hand for their own analysis.",
              "examples": "A business using government census data to understand its market; a student using published academic research; an organisation analysing industry reports from market research firms.",
              "examTip": "Secondary = collected by SOMEONE ELSE, for a DIFFERENT purpose, PREVIOUSLY. Cheaper and quicker to access, but may be outdated or not quite fit the current purpose.",
              "keyFacts": [
                "Already exists — no collection needed by the current researcher",
                "Sources: government statistics, published research, industry reports, news articles, existing databases",
                "Advantages: cheaper, quicker to access, larger datasets often available",
                "Disadvantages: may be outdated; collected for a different purpose so may not perfectly fit needs",
                "Reliability varies widely — must evaluate source credibility",
                "Cannot control the quality or method of original data collection"
              ],
              "comparisonTable": {
                "title": "Primary vs Secondary Data",
                "headers": ["Feature", "Primary Data", "Secondary Data"],
                "rows": [
                  ["Who collected it", "The researcher/organisation themselves", "Someone else, for a different original purpose"],
                  ["When collected", "Now — specifically for this project", "Previously — already exists"],
                  ["Relevance", "Highly specific to exact research needs", "May not perfectly fit current needs"],
                  ["Currency", "Always up to date when collected", "May be outdated"],
                  ["Cost", "High — resources needed to collect", "Low — often free or low cost to access"],
                  ["Time required", "Significant — design, collect, analyse", "Quick — locate and access existing sources"],
                  ["Sample size", "Often small — limited by resources", "Often very large — national/global datasets"],
                  ["Control over quality", "Full control over how data is collected", "No control — must trust original methodology"],
                  ["Examples", "Survey, interview, focus group, experiment", "Census data, industry reports, published research"]
                ]
              }
            }
          ]
        },
        {
          "code": "E2.2",
          "title": "Methods of Ensuring Reliability of Information",
          "items": [
            {
              "code": "E2.2",
              "term": "Methods of Ensuring Reliability of Information",
              "definition": "Reliability means the information consistently produces the same results and can be trusted to be accurate over time. Various methods are used to verify that information sources are credible and data is dependable.",
              "examples": "Cross-referencing news stories across multiple reputable sources before publishing; triangulation — comparing findings from three different data sources; using peer-reviewed academic journals rather than personal blogs.",
              "examTip": "Reliability is about consistency and trustworthiness of a source. Distinguish from validity (does the data measure what it claims to?). Exams may ask how an organisation ensures information is reliable before using it to make decisions.",
              "keyFacts": [
                "Triangulation: comparing data from multiple independent sources — if they agree, reliability is higher",
                "Cross-referencing: verifying facts against multiple credible sources before accepting them",
                "Source evaluation: consider author credentials, publication date, peer review, publisher reputation",
                "Pilot testing: running a small-scale test of data collection instruments before full deployment",
                "Sampling method: a representative, random sample increases reliability of survey results",
                "Consistency checks: comparing new data against historical data to spot anomalies",
                "Peer review: academic and scientific findings reviewed by independent experts before publication"
              ]
            }
          ]
        },
        {
          "code": "E2.3",
          "title": "Methods of Collecting Data and Opinions",
          "items": [
            {
              "code": "E2.3.1",
              "term": "Survey",
              "definition": "A data collection method that gathers responses from a large number of people using a structured set of questions — typically administered online, by post, or in person.",
              "examples": "An online customer satisfaction survey sent by email after a purchase; a government national survey about employment; a Net Promoter Score (NPS) survey asking how likely users are to recommend a product.",
              "examTip": "Surveys are quantitative — best for gathering measurable data from large samples. Key limitations: self-selection bias (only motivated people respond), social desirability bias (respondents give 'acceptable' answers).",
              "keyFacts": [
                "Best for: collecting measurable, quantitative data from large groups quickly",
                "Online surveys: cheap, fast, wide reach — tools like SurveyMonkey, Google Forms",
                "Response rate: often low (under 30%) — may introduce bias if non-respondents differ from respondents",
                "Closed questions: fixed choice answers — easy to analyse quantitatively",
                "Open questions: free-text answers — richer data but harder to analyse",
                "Bias: leading questions can skew results; self-selection affects who responds"
              ]
            },
            {
              "code": "E2.3.2",
              "term": "Questionnaire",
              "definition": "A set of written questions used to collect specific information from respondents. Similar to a survey but typically more structured and focused; can be paper-based or digital.",
              "examples": "A paper questionnaire given to shoppers exiting a store; an online product feedback form; a health questionnaire completed before a GP appointment.",
              "examTip": "Questionnaires and surveys are similar — the distinction the spec makes is that questionnaires are typically a specific instrument (the document of questions) whereas a survey is the wider process. Treat them as closely related.",
              "keyFacts": [
                "Can use Likert scales (1–5 agreement scales) for measuring attitudes and opinions",
                "Cheaper than interviews — can be distributed to many people simultaneously",
                "No interviewer bias — respondents answer in their own time without pressure",
                "Low response rates common — especially for unsolicited paper questionnaires",
                "Cannot probe or follow up interesting responses — answers are as given"
              ]
            },
            {
              "code": "E2.3.3",
              "term": "Focus Groups",
              "definition": "A small group of people (typically 6–10) brought together to discuss a topic in depth, guided by a facilitator. Used to gather qualitative opinions, attitudes, and reactions.",
              "examples": "A tech company showing a prototype app to potential users and recording their reactions; a political party testing campaign messages with swing voters; a food brand testing new flavours with target consumers.",
              "examTip": "Focus groups = qualitative, in-depth, small group. They reveal WHY people think/feel something — unlike surveys which tell you HOW MANY. Key limitation: group dynamics can suppress individual opinions (conformity pressure).",
              "keyFacts": [
                "Small group (6–10 participants) — representative of target population",
                "Guided discussion: facilitator probes and follows up on interesting responses",
                "Qualitative data: rich insights into motivations, attitudes, and reactions",
                "Expensive: requires facilitator, venue, participant incentives, and transcript analysis",
                "Group dynamics: dominant personalities may influence others; conformity can suppress minority views",
                "Not statistically representative — small samples cannot be generalised to entire populations"
              ]
            },
            {
              "code": "E2.3.4",
              "term": "Interview",
              "definition": "A one-to-one (or small group) conversation between a researcher and a participant, used to gather detailed qualitative information about experiences, opinions, or knowledge.",
              "examples": "A researcher interviewing customers about their experience with a new product; a journalist interviewing an expert; an HR team conducting structured interviews to evaluate candidates.",
              "examTip": "Structured interview = fixed questions (like a questionnaire spoken aloud). Unstructured = conversational, flexible. Semi-structured = planned questions but allows follow-up. Exams may ask you to compare interview types.",
              "keyFacts": [
                "Structured: predetermined questions — consistent, comparable, easy to analyse",
                "Unstructured: open-ended conversation — flexible, deeper insights, hard to compare across participants",
                "Semi-structured: planned questions with room for follow-up — balance of consistency and depth",
                "Rich qualitative data — interviewer can probe, clarify, and follow interesting threads",
                "Time-consuming and expensive — limits sample size",
                "Interviewer bias: interviewer's manner or phrasing can influence responses"
              ],
              "comparisonTable": {
                "title": "Data Collection Methods Compared",
                "headers": ["Method", "Type of data", "Sample size", "Cost/time", "Key strength", "Key limitation"],
                "rows": [
                  ["Survey", "Quantitative (numerical)", "Large (hundreds/thousands)", "Low cost, fast", "Statistically representative if well-designed", "Low response rates; no depth; bias possible"],
                  ["Questionnaire", "Quantitative + some qualitative", "Medium to large", "Low cost", "Standardised — easy to compare responses", "No follow-up; low response rates"],
                  ["Focus group", "Qualitative (opinions, attitudes)", "Small (6–10 per group)", "High cost, time-intensive", "Rich discussion; reveals WHY; unexpected insights", "Not representative; group dynamics; small sample"],
                  ["Interview", "Qualitative (in-depth)", "Small (one-to-one)", "Highest cost, very time-intensive", "Deepest insight; interviewer can probe", "Expensive; interviewer bias; small sample; hard to generalise"]
                ]
              }
            }
          ]
        },
        {
          "code": "E2.4",
          "title": "Reasons for Ensuring Data Accuracy",
          "items": [
            {
              "code": "E2.4",
              "term": "Reasons for Ensuring Data Accuracy",
              "definition": "Accurate data is data that is correct, complete, and free from errors. Organisations must ensure their data is accurate because decisions based on inaccurate data lead to poor outcomes, legal liability, and operational failures.",
              "examples": "A hospital using inaccurate patient data prescribing the wrong medication; an organisation sending marketing emails to wrong addresses due to data entry errors; a bank applying incorrect interest rates due to calculation errors in the database.",
              "examTip": "Link data accuracy to: (1) better decision-making, (2) legal compliance (GDPR requires accurate data), (3) customer trust, (4) operational efficiency. In the exam, give a specific consequence of inaccurate data in the scenario provided.",
              "keyFacts": [
                "GDPR: organisations legally required to keep personal data accurate and up to date",
                "Decision-making: managers rely on accurate data — inaccurate data leads to wrong business decisions",
                "Customer trust: sending wrong products, billing errors, or incorrect communications damages reputation",
                "Safety implications: inaccurate data in medical, engineering, or transport contexts can be life-threatening",
                "Financial implications: errors in financial records lead to accounting mistakes, fraud vulnerability",
                "Operational efficiency: inaccurate stock data leads to over-ordering, under-ordering, or lost sales",
                "Audit trail: accurate records needed to demonstrate compliance and resolve disputes"
              ]
            }
          ]
        },
        {
          "code": "E2.5",
          "title": "Methods of Ensuring Data Accuracy",
          "items": [
            {
              "code": "E2.5.1",
              "term": "Verification",
              "definition": "The process of checking that data has been entered correctly by comparing it to the original source document or by having it entered twice. Verification catches transcription errors but does NOT check whether the data itself is valid or sensible.",
              "examples": "Double entry: a data entry clerk types a customer's email address twice — the system checks both entries match; proofreading a typed letter against a handwritten original; a 'confirm password' field requiring the user to type their password twice.",
              "examTip": "Verification = was it copied correctly? It does NOT check if the data is correct — just that it was entered the same way twice. Double-entry and proofreading are the two key methods.",
              "keyFacts": [
                "Double entry: data entered twice independently; system alerts if entries don't match",
                "Proofreading: human comparison of entered data against source document",
                "Confirms data was transcribed without error — does NOT confirm the data is actually correct",
                "Example of limitation: verifying that '01/01/2090' was entered correctly — but that date might be wrong even though it was typed consistently",
                "Used at data input stage — first line of defence against transcription errors"
              ]
            },
            {
              "code": "E2.5.2",
              "term": "Validation",
              "definition": "Automated checks performed by a system to ensure data entered is reasonable, complete, and in the correct format — before it is accepted and stored. Validation cannot check if the data is true, only that it conforms to rules.",
              "examples": "A range check rejecting an age entry of 200; a presence check preventing a form from submitting without an email address; a format check rejecting 'ABC12' as a postcode when the format should be 'AA1 1AA'.",
              "examTip": "Validation = does the data make sense and fit the rules? It is automated. Know ALL six types: range, presence, format, length, type, lookup/list check. Each check catches different types of errors.",
              "keyFacts": [
                "Range check: value must be within acceptable limits (e.g. age 0–120, exam mark 0–100)",
                "Presence check: field cannot be left empty — mandatory fields must be completed",
                "Format check: data must match a specific pattern (e.g. postcode: AA9 9AA; date: DD/MM/YYYY)",
                "Length check: data must be a specific number of characters (e.g. NI number is always 9 characters)",
                "Type check: data must be the correct data type (e.g. date field must contain a date, not text)",
                "Lookup/list check: data must match an entry in a predefined list (e.g. country must be from dropdown)",
                "Limitation: valid data is not necessarily correct — a date of 01/01/1900 passes all checks but is probably wrong"
              ],
              "comparisonTable": {
                "title": "Verification vs Validation",
                "headers": ["Feature", "Verification", "Validation"],
                "rows": [
                  ["What it checks", "Whether data was entered the same as the source", "Whether data is reasonable, complete, correct format"],
                  ["When it occurs", "During data entry/transcription", "When data is submitted to the system"],
                  ["How it works", "Human or double-entry comparison", "Automated rule-checking by the software"],
                  ["What it catches", "Transcription/copying errors", "Out-of-range values, missing fields, wrong format/type"],
                  ["What it cannot catch", "Whether the original data itself is correct", "Whether the data is actually true (just whether it's plausible)"],
                  ["Example pass/fail", "Password typed same way twice — PASS. Different — FAIL.", "Age entered as 250 — FAIL range check. Age 25 — PASS."],
                  ["Methods", "Double entry, proofreading", "Range, presence, format, length, type, lookup checks"],
                  ["Automated?", "Can be (double entry), or manual (proofreading)", "Always automated — built into the system"]
                ]
              }
            }
          ]
        },
        {
          "code": "E2.6",
          "title": "User Interface Characteristics for Data Collection Systems",
          "items": [
            {
              "code": "E2.6.1",
              "term": "Ease of Use",
              "definition": "How intuitive and straightforward the interface is for users to navigate and complete data entry tasks without needing specialist training.",
              "examTip": "Ease of use reduces errors, speeds up data entry, and improves user satisfaction. Poor ease of use leads to workarounds that bypass validation checks.",
              "keyFacts": [
                "Logical flow: form fields in natural order (name → address → contact → payment)",
                "Clear labels: every field has an unambiguous label explaining what to enter",
                "Helpful defaults: pre-populate known fields to reduce typing",
                "Autocomplete and dropdown menus reduce typing errors",
                "Progress indicators show users where they are in a multi-step form"
              ]
            },
            {
              "code": "E2.6.2",
              "term": "Accessibility",
              "definition": "Designing interfaces so that people with disabilities or impairments can use them effectively — including users with visual, auditory, motor, or cognitive impairments.",
              "examTip": "Accessibility is both an ethical obligation and a legal one (Equality Act 2010). Link to assistive technologies (A2.2): screen readers need proper alt text; keyboard users need tab navigation.",
              "keyFacts": [
                "Screen reader compatibility: all form elements must have text labels that screen readers can read",
                "Colour contrast: text must have sufficient contrast against background for visually impaired users",
                "Keyboard navigation: all functions accessible without a mouse (using Tab key)",
                "Alt text on images: describes image content for users who cannot see it",
                "Font size and zoom: interface should work at larger text sizes without breaking layout",
                "WCAG (Web Content Accessibility Guidelines): international standard for web accessibility"
              ]
            },
            {
              "code": "E2.6.3",
              "term": "Error Reduction",
              "definition": "Design features that minimise the likelihood of users entering incorrect data — through clear instructions, immediate feedback, and appropriate input controls.",
              "examTip": "Error reduction combines good UX design with validation. Preventing errors is better than catching them after — inline validation (showing errors as the user types) is more effective than showing all errors after submission.",
              "keyFacts": [
                "Inline validation: error messages appear immediately as the user fills in fields, not just at submission",
                "Input constraints: date pickers prevent invalid date formats; dropdowns prevent free-text errors",
                "Clear error messages: explain what is wrong AND how to fix it (not just 'invalid input')",
                "Confirmation dialogs: 'Are you sure?' prompts before irreversible actions",
                "Undo functionality: allows correction of mistakes without re-entering all data",
                "Field masking: phone number fields automatically format as user types (e.g. 07XXX XXX XXX)"
              ]
            },
            {
              "code": "E2.6.4",
              "term": "Functionality",
              "definition": "Whether the interface provides all the features and capabilities that users need to complete their data entry and processing tasks effectively.",
              "examTip": "Functionality = does it do everything users need? Too few features and users can't complete tasks; too many features creates complexity and confusion.",
              "keyFacts": [
                "Must cover all required data fields without forcing workarounds",
                "Search and filter: allows users to find existing records quickly before entering duplicate data",
                "Bulk import: for organisations entering large datasets, import from CSV/Excel speeds up data entry",
                "Reporting functionality: allows users to generate outputs from collected data",
                "Integration: connects with other systems (e.g. CRM, payment gateway) to avoid re-entering data"
              ]
            },
            {
              "code": "E2.6.5",
              "term": "Performance",
              "definition": "How quickly and responsively the interface responds to user input — including page load times, processing speed, and behaviour under peak load.",
              "examTip": "Slow interfaces increase errors — users lose patience and rush, skip fields, or abandon the form. Performance is especially critical for high-volume data entry (e.g. call centres processing hundreds of records per day).",
              "keyFacts": [
                "Page load time: slow loading frustrates users and increases abandonment rate",
                "Response time to user actions: interface should respond within 200 ms to feel instantaneous",
                "Scalability: performance must hold up under peak concurrent usage",
                "Timeout handling: long-running operations should show a progress indicator",
                "Local vs server-side processing: some validation can run client-side (faster) before server submission"
              ]
            },
            {
              "code": "E2.6.6",
              "term": "Compatibility",
              "definition": "Whether the interface works correctly across different devices, operating systems, browsers, and screen sizes — ensuring all users can access it regardless of their technical environment.",
              "examTip": "Compatibility = works everywhere. Covers cross-browser (Chrome, Firefox, Safari), cross-OS (Windows, macOS, Android, iOS), and responsive design (mobile vs desktop screen sizes).",
              "keyFacts": [
                "Cross-browser compatibility: must work on Chrome, Firefox, Edge, Safari",
                "Cross-platform: must work on Windows, macOS, Android, iOS",
                "Responsive design: adapts layout to different screen sizes (mobile, tablet, desktop)",
                "Legacy system support: some organisations still use older browsers/OS — must be considered",
                "Assistive technology compatibility: must work with screen readers and other AT (links to E2.6.2)"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_F = {
  "section": "F",
  "title": "Legal and Ethical Issues",
  "topics": [
    {
      "code": "F1",
      "title": "Moral and Ethical Issues",
      "subtopics": [
        {
          "code": "F1.1",
          "title": "Moral and Ethical Factors and Implications of the Use of IT",
          "comparisonTable": {
            "title": "Key Ethical Issues in IT — Overview",
            "headers": ["Issue", "What It Means", "Example", "Stakeholders Affected"],
            "rows": [
              ["Privacy", "Right to control personal data; risk of surveillance/data misuse", "Social media tracking browsing history for ads", "All individuals using digital systems"],
              ["Environmental Impact", "IT causes e-waste, energy consumption, carbon emissions", "Data centres consuming ~1% of global electricity", "Society, environment, future generations"],
              ["Unequal Access", "Digital divide — not everyone can afford/access technology", "Rural areas with no broadband; low-income households without devices", "Disadvantaged communities, developing nations"],
              ["Assistive Tech Access", "Disabled users need assistive technologies but access is unequal", "Screen readers cost hundreds; not all employers provide them", "Disabled users, employers, schools"],
              ["Online Behaviour", "Netiquette and responsible digital communication", "Cyberbullying, trolling, spreading misinformation online", "All users, especially young people"],
              ["Acceptable Use Policies", "Organisational rules governing IT use by staff/students", "School AUP banning social media on school devices", "Employees, students, organisations"]
            ]
          },
          "items": [
            {
              "code": "F1.1.1",
              "term": "Privacy",
              "definition": "The right of individuals to control their personal information and how it is collected, stored, used, and shared by organisations and IT systems.",
              "examples": "Social media platforms tracking location and browsing behaviour to serve targeted advertising; employers monitoring employee emails and keystrokes; CCTV and facial recognition in public spaces.",
              "examTip": "For 'discuss privacy' questions: cover the tension between individual rights and organisational/commercial interests. Reference data protection law (GDPR/DPA 2018) as the legal framework. Bring in at least two distinct contexts (personal use, workplace, government surveillance).",
              "keyFacts": [
                "Data minimisation: organisations should only collect data they genuinely need",
                "Consent: individuals must agree to data collection under GDPR",
                "Right to erasure ('right to be forgotten'): individuals can request deletion of their data",
                "Cookies and tracking: websites must obtain consent before placing non-essential cookies",
                "Surveillance capitalism: business model of collecting and monetising personal data (Google, Meta)"
              ]
            },
            {
              "code": "F1.1.2",
              "term": "Environmental Impact",
              "definition": "The effects of IT on the natural environment, including energy consumption of data centres, e-waste from discarded devices, carbon emissions from manufacturing, and the environmental cost of the internet.",
              "examples": "Data centres consuming approximately 1–2% of global electricity; smartphones containing rare earth metals mined under environmentally damaging conditions; millions of tonnes of e-waste discarded annually with toxic components (lead, mercury).",
              "examTip": "Balance negative impacts (energy, e-waste, rare minerals) against positives (remote working reducing travel, paperless offices, smart energy grids reducing waste). Examiners award marks for nuanced two-sided analysis.",
              "keyFacts": [
                "E-waste: discarded electronics are the fastest-growing waste stream globally",
                "Rare earth metals: lithium, cobalt, coltan — mined with significant environmental and human cost",
                "Data centre PUE (Power Usage Effectiveness): ratio of total energy to IT equipment energy; lower = more efficient",
                "Cloud computing consolidates servers, potentially more energy-efficient than individual on-premise servers",
                "Remote working enabled by IT can reduce commuting carbon emissions"
              ]
            },
            {
              "code": "F1.1.3",
              "term": "Unequal Access to Information Technology",
              "definition": "The digital divide — the gap between those who have reliable access to modern IT (devices, internet, digital skills) and those who do not, often correlating with income, geography, age, and education level.",
              "examples": "Rural communities in the UK lacking access to superfast broadband; elderly people excluded from online government services; low-income households unable to afford devices for home learning; developing nations with limited infrastructure.",
              "examTip": "Distinguish three dimensions of the digital divide: access gap (no device/internet), skills gap (cannot use technology effectively), and usage gap (uses technology in limited ways). Government and organisational interventions are relevant here.",
              "keyFacts": [
                "UK Government broadband targets: Universal Service Obligation guarantees minimum 10 Mbps to all UK premises",
                "Device poverty: 1 in 5 school children in UK lacked suitable device for home learning during COVID-19",
                "Digital skills gap: millions of UK adults lack basic digital literacy (ONS data)",
                "Ofcom: regulator monitoring UK communications access and equality",
                "Assistive technology costs compound access inequality for disabled users"
              ]
            },
            {
              "code": "F1.1.4",
              "term": "Access to Assistive Technology",
              "definition": "The ethical issue of whether disabled individuals have fair and adequate access to assistive technologies (hardware and software that enables them to use IT systems) in workplaces, education, and public services.",
              "examples": "Employer failing to provide screen reader for visually impaired employee; school lacking braille display for blind pupil; public websites not meeting WCAG accessibility standards, excluding screen reader users.",
              "examTip": "Link to the Equality Act 2010 — organisations have a legal duty to make 'reasonable adjustments' for disabled employees/service users. Assistive tech access is therefore both an ethical AND a legal issue.",
              "keyFacts": [
                "Equality Act 2010: employers must make reasonable adjustments for disabled employees, which may include providing assistive technology",
                "WCAG (Web Content Accessibility Guidelines): international standard for making websites accessible to disabled users",
                "Cost barrier: specialist assistive tech can cost hundreds to thousands of pounds — not equally accessible",
                "Examples: screen readers (JAWS, NVDA), braille displays, eye-tracking software, adaptive keyboards",
                "Public sector equality duty: public bodies must actively consider accessibility in IT procurement"
              ]
            },
            {
              "code": "F1.1.5",
              "term": "Online Behaviour and Netiquette",
              "definition": "The standards of acceptable conduct in digital communications — including respecting others online, avoiding harmful behaviour (cyberbullying, trolling, hate speech), and taking responsibility for one's digital actions.",
              "examples": "Cyberbullying via social media causing psychological harm; trolling and harassment on discussion forums; spreading misinformation about a business or individual; sharing personal images without consent ('revenge porn').",
              "examTip": "Netiquette is the informal code of conduct; Acceptable Use Policies are the formal equivalent (next code). Exam questions often ask you to 'discuss the ethical implications of online behaviour' — cover responsibility, anonymity enabling bad behaviour, legal boundaries (Malicious Communications Act), and impact on victims.",
              "keyFacts": [
                "Netiquette: unwritten rules of polite online communication (e.g., no ALL CAPS = shouting, cite sources, be constructive)",
                "Cyberbullying: repeated harmful behaviour targeting an individual online — criminal under Malicious Communications Act 1988",
                "Trolling: deliberately provocative posts intended to cause emotional distress",
                "Online anonymity: reduces social accountability, enabling behaviour people wouldn't display in person",
                "Digital footprint: all online behaviour leaves a traceable record — affects future employment/reputation"
              ]
            },
            {
              "code": "F1.1.6",
              "term": "Acceptable Use Policies (AUPs)",
              "definition": "A formal written agreement between an organisation and its users (employees, students) setting out the rules and restrictions on how IT systems, networks, and data may be used — what is permitted, what is prohibited, and the consequences of violations.",
              "examples": "School AUP prohibiting social media and gaming on school devices; employer AUP forbidding personal email on work systems; university AUP requiring students not to share login credentials; ISP AUP prohibiting illegal downloading.",
              "examTip": "AUPs reduce legal liability for the organisation, manage security risks, and set clear expectations. Exam questions often ask what an AUP should include — typical contents: permitted uses, prohibited activities, monitoring clause, consequences of breach, data protection responsibilities.",
              "keyFacts": [
                "AUPs are a legal protective document — if users breach the AUP they cannot claim ignorance",
                "Typical AUP content: permitted software, prohibited activities, personal use rules, monitoring policy, data handling rules, breach consequences",
                "Must be signed/acknowledged by users to be enforceable",
                "Regular review: AUPs should be updated as technology and threats evolve",
                "Monitoring: AUP should inform users that their activity may be monitored — links to privacy/GDPR compliance"
              ]
            }
          ]
        }
      ]
    },
    {
      "code": "F2",
      "title": "Legal Issues",
      "subtopics": [
        {
          "code": "F2.1",
          "title": "Role and Impact of Current Legislation in Protecting IT Systems, Users and Their Data",
          "comparisonTable": {
            "title": "UK IT Legislation — Summary Comparison",
            "headers": ["Legislation", "Year", "What It Covers", "Key Offences / Requirements", "Maximum Penalty"],
            "rows": [
              ["Computer Misuse Act", "1990 (amended)", "Unauthorised access to computer systems and data", "S1: Unauthorised access; S2: Unauthorised access with intent; S3: Unauthorised modification", "S1: 2 yrs; S2: 5 yrs; S3: 10 yrs imprisonment"],
              ["Copyright, Designs and Patents Act", "1988", "Intellectual property rights for creative works and software", "Reproducing/distributing copyrighted work without permission", "Civil damages + up to 10 years imprisonment for criminal infringement"],
              ["Copyright (Computer Programs) Regulations", "1992", "Specific IP protection for software and programs", "Copying, reverse engineering, or distributing software illegally", "Same as CDPA 1988"],
              ["Health & Safety / DSE Regulations", "1992/1999", "Workplace safety for IT/screen users", "Employers must provide DSE assessments, breaks, training, proper equipment", "Civil claims / HSE enforcement"],
              ["Data Protection Act / UK GDPR", "2018/2018", "Protection of personal data; rights of data subjects", "Unlawful processing, failure to report breaches, inadequate security", "ICO fines up to £17.5m or 4% global turnover"]
            ]
          },
          "items": [
            {
              "code": "F2.1.1",
              "term": "Computer Misuse Legislation (Computer Misuse Act 1990)",
              "definition": "The Computer Misuse Act 1990 (amended by the Police and Justice Act 2006 and Serious Crime Act 2015) makes it illegal to access computer systems without authorisation or to misuse computer systems to commit or facilitate further crime.",
              "examples": "Hacker gaining unauthorised access to a company's database (S1); hacker accessing a bank system intending to commit fraud (S2); malware author deploying ransomware that corrupts files (S3); DDoS attack making a service unavailable (S3 as amended).",
              "examTip": "Know all three sections by number and what each covers. Examiners frequently ask you to 'state the section of the Computer Misuse Act that applies' to a scenario. S1 = access only; S2 = access + intent for further crime; S3 = damaging/modifying/impairing systems.",
              "comparisonTable": {
                "title": "Computer Misuse Act 1990 — Three Offences",
                "headers": ["Section", "Offence", "Example", "Max Sentence"],
                "rows": [
                  ["Section 1", "Unauthorised access to computer material", "Using someone else's password to log into their account out of curiosity", "2 years imprisonment + unlimited fine"],
                  ["Section 2", "Unauthorised access with intent to commit or facilitate further offences", "Hacking into a bank's system intending to transfer funds fraudulently", "5 years imprisonment + unlimited fine"],
                  ["Section 3", "Unauthorised acts with intent to impair operation of a computer", "Deploying ransomware; launching a DDoS attack; installing a keylogger", "10 years imprisonment + unlimited fine"]
                ]
              },
              "keyFacts": [
                "CMA 1990: landmark law — first UK legislation specifically targeting cybercrime",
                "Amended by Police & Justice Act 2006: added S3A (making/supplying hacking tools); DDoS attacks explicitly included",
                "Amended by Serious Crime Act 2015: increased S3 maximum from 5 to 10 years; added S3ZA for critical national infrastructure attacks (life in prison)",
                "Applies to any computer system — not just traditional PCs (applies to phones, tablets, servers)",
                "Prosecution requires proving intent and lack of authorisation"
              ]
            },
            {
              "code": "F2.1.2",
              "term": "Copyright, Designs and Patents Legislation (CDPA 1988)",
              "definition": "The Copyright, Designs and Patents Act 1988 protects the intellectual property rights of creators — including software developers, authors, musicians, and filmmakers. It makes it illegal to copy, distribute, or publicly perform copyrighted works without authorisation.",
              "examples": "Copying commercial software without a licence; sharing a pirated movie via torrent; using a royalty-free stock image in a commercial product without purchasing the correct licence; taking and using copyrighted music in a YouTube video without permission.",
              "examTip": "For IT contexts: CDPA 1988 protects software code as a literary work. Key provisions for IT: software piracy is a criminal offence; end-user licence agreements (EULAs) govern permitted use; companies can be liable if employees pirate software on work machines.",
              "keyFacts": [
                "Copyright arises automatically — no registration needed in the UK",
                "Duration: life of creator + 70 years for most works; 25 years from publication for computer-generated works",
                "Software is protected as a 'literary work' under CDPA",
                "Fair dealing: limited exceptions — criticism, review, news reporting, private study (not commercial use)",
                "EULAs (End User Licence Agreements): contracts specifying how software may be used",
                "Business Software Alliance (BSA): industry body that investigates software piracy"
              ]
            },
            {
              "code": "F2.1.3",
              "term": "Copyright Regulations (Computer Programs) 1992",
              "definition": "The Copyright (Computer Programs) Regulations 1992 implemented the EU Software Directive into UK law, specifically extending and clarifying copyright protection for computer programs — treating software code as a literary work with full copyright protection.",
              "examples": "A developer cannot copy the source code of a commercial application and release it as their own product; decompiling software to extract algorithms for commercial use is prohibited (with narrow exceptions for interoperability).",
              "examTip": "This is a narrower regulation supplementing CDPA 1988 specifically for software. Know that: (1) programs are literary works; (2) there is a limited right to decompile for interoperability only; (3) making a backup copy of legitimately owned software is generally permitted.",
              "keyFacts": [
                "Implements EU Software Directive (91/250/EEC) into UK law",
                "Computer programs explicitly protected as literary works",
                "Limited decompilation right: permitted only to achieve interoperability with other programs, not to copy functionality",
                "Backup copying: legitimate owners may make one backup copy for personal use",
                "Post-Brexit: UK retained these regulations as part of domestic law via the European Union (Withdrawal) Act 2018"
              ]
            },
            {
              "code": "F2.1.4",
              "term": "Health and Safety and Display Screen Equipment (DSE) Regulations",
              "definition": "The Health and Safety at Work Act 1974 and the Health and Safety (Display Screen Equipment) Regulations 1992 (updated 2002) impose legal duties on employers to protect workers who regularly use computers and screens from physical and psychological harm.",
              "examples": "Employer required to provide ergonomic chair and adjustable desk for office worker using a PC all day; company providing regular eye tests and contributing to corrective glasses for DSE users; manager scheduling regular screen breaks for call centre staff.",
              "examTip": "Know the employer's four main obligations under DSE Regulations: (1) conduct DSE risk assessments; (2) ensure adequate breaks from screen work; (3) provide free eye tests on request; (4) provide training on correct workstation setup. Also know the health risks DSE is designed to prevent.",
              "comparisonTable": {
                "title": "DSE Regulations — Employer Obligations vs Health Risks Addressed",
                "headers": ["Employer Obligation", "Health Risk It Addresses"],
                "rows": [
                  ["Workstation risk assessment (screen, keyboard, chair, lighting, space)", "Musculoskeletal disorders — RSI, back/neck pain from poor posture"],
                  ["Regular breaks from DSE work (at least 5-10 mins per hour)", "Eye strain, headaches, fatigue from prolonged screen use"],
                  ["Free eye tests for DSE workers (annually or as needed)", "Visual fatigue, uncorrected vision problems worsened by screen work"],
                  ["Provide corrective glasses if required specifically for DSE work", "Vision deterioration linked directly to screen use"],
                  ["Training on safe workstation setup and correct posture", "Repetitive Strain Injury (RSI), carpal tunnel syndrome from poor technique"],
                  ["Report DSE-related illness under RIDDOR if absence > 7 days", "Work-related upper limb disorder (WRULD) — employer accountability"]
                ]
              },
              "keyFacts": [
                "DSE Regulations 1992: apply to 'habitual users' of display screen equipment — typically those who use screens for 1+ hour continuously as a normal part of work",
                "Risk assessment required for every workstation where DSE is used",
                "Eye tests: employer must fund if employee requests one as a DSE user",
                "Breaks: law requires adequate breaks — guidance suggests 5–10 minutes every hour",
                "Health risks: RSI, carpal tunnel syndrome, back pain, eye strain, headaches, stress",
                "Remote workers are covered — employer must ensure home workstation is assessed if DSE is used regularly"
              ]
            },
            {
              "code": "F2.1.5",
              "term": "Data Protection Legislation (Data Protection Act 2018 / UK GDPR)",
              "definition": "The Data Protection Act 2018 incorporates and supplements the UK General Data Protection Regulation (UK GDPR) — together forming the main legal framework for how personal data must be collected, processed, stored, and deleted by organisations in the UK.",
              "examples": "GP surgery holding patient records must ensure data is accurate, secured, and not retained longer than necessary; e-commerce company must obtain explicit consent before sending marketing emails; data breach affecting 10,000 customers must be reported to ICO within 72 hours.",
              "examTip": "Know the six lawful bases for processing and the seven UK GDPR principles (ADISS LA). Most exam questions focus on: what constitutes personal data, the rights of data subjects, the role of the ICO, and breach notification requirements. Penalties are a favourite mark-grabber — ICO can fine up to £17.5m or 4% of global annual turnover.",
              "comparisonTable": {
                "title": "UK GDPR — Seven Data Protection Principles",
                "headers": ["Principle", "Meaning", "Example Violation"],
                "rows": [
                  ["1. Lawfulness, Fairness & Transparency", "Data processed legally, fairly, and openly", "Collecting location data without informing users"],
                  ["2. Purpose Limitation", "Data only used for the specific purpose it was collected for", "Using customer purchase data to build psychological profiles for resale"],
                  ["3. Data Minimisation", "Only collect data that is necessary", "Asking for date of birth when only age range is needed"],
                  ["4. Accuracy", "Data must be accurate and kept up to date", "Storing outdated address causing important letters to be sent elsewhere"],
                  ["5. Storage Limitation", "Data not kept longer than necessary", "Retaining old employee records indefinitely after departure"],
                  ["6. Integrity & Confidentiality", "Data secured against unauthorised access, loss, or destruction", "Storing customer passwords in plaintext; inadequate firewall"],
                  ["7. Accountability", "Organisation must demonstrate compliance", "No documented data protection policies; no DPO appointed where required"]
                ]
              },
              "keyFacts": [
                "ICO (Information Commissioner's Office): UK data protection regulator — investigates complaints, issues fines",
                "Personal data: any information that can identify a living individual (name, email, IP address, biometrics)",
                "Special category data: racial origin, health, religion, sexual orientation, political opinions — higher protection required",
                "Data subject rights: access (SAR), rectification, erasure, restriction, portability, object, no automated decision-making",
                "Lawful bases for processing: consent, contract, legal obligation, vital interests, public task, legitimate interests (CLVLPL)",
                "Breach notification: if high risk to individuals — report to ICO within 72 hours; notify affected individuals without undue delay",
                "Data Protection Officer (DPO): required for public authorities and organisations processing special category data at scale",
                "GDPR fines: Tier 1 up to €10m/2% turnover; Tier 2 up to €20m/4% turnover (UK equivalents: £8.7m/£17.5m)"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;

const INLINE_FLASHCARDS = {
  "cards": [
    {"id":"c1","section":"C","code":"C1.1.1","front":"What is a Private Cloud?","back":"Cloud infrastructure operated solely for one organisation. Hosted on-premise or at a dedicated facility. More control and security but higher cost than public cloud."},
    {"id":"c2","section":"C","code":"C1.1.2","front":"What is a Public Cloud?","back":"Cloud services delivered over the internet, shared across multiple organisations, managed by a third-party provider (e.g. AWS, Azure). Low cost and scalable but less control over data location."},
    {"id":"c3","section":"C","code":"C1.1.3","front":"What is a Hybrid Cloud?","back":"Combines private and public cloud. Sensitive data stays on private cloud; less sensitive workloads use cheaper public cloud. Offers flexibility but is more complex to manage."},
    {"id":"c4","section":"C","code":"C1.1.4","front":"What does IaaS stand for and what does it provide?","back":"Infrastructure as a Service. Provides virtualised computing resources (servers, storage, networking) over the internet. Organisation manages OS and software; provider manages physical hardware. Example: Amazon EC2."},
    {"id":"c5","section":"C","code":"C1.1.5","front":"What does SaaS stand for and what does it provide?","back":"Software as a Service. Software delivered over the internet on subscription — no installation needed. Provider manages everything. Examples: Microsoft 365, Google Workspace. Accessible from any device."},
    {"id":"c6","section":"C","code":"C1.1.6","front":"What does PaaS stand for and what does it provide?","back":"Platform as a Service. Provides a platform for developers to build and deploy apps without managing infrastructure. Provider handles OS and hardware; developer manages the application. Example: Google App Engine, Heroku."},
    {"id":"c7","section":"C","code":"C1.2","front":"Give TWO benefits and TWO drawbacks of cloud computing for an organisation.","back":"BENEFITS: Reduced capital expenditure (no hardware to buy); scalable (resources increase/decrease with demand). DRAWBACKS: Internet dependency (outage = no access); security risk (data held by third party, GDPR implications)."},
    {"id":"c8","section":"C","code":"C1.3.1","front":"What is a VPN and how does it enable remote working?","back":"Virtual Private Network — creates an encrypted tunnel between a device and the organisation's network over the internet. Allows remote workers to access internal resources securely as if in the office. Protects data from interception on public Wi-Fi."},
    {"id":"c9","section":"C","code":"C1.3.2","front":"What is remote desktop technology?","back":"Software allowing a user to view and control another computer's desktop remotely over a network/internet. Used by IT support and remote workers. Examples: Microsoft Remote Desktop, TeamViewer. Security risk if not properly protected."},
    {"id":"c10","section":"C","code":"C1.4.1","front":"Why is security a factor when selecting an online system?","back":"Organisation must ensure cloud provider is GDPR-compliant. Data must be encrypted at rest and in transit. Security breaches can cause financial penalties and reputational damage. MFA adds extra protection."},
    {"id":"c11","section":"C","code":"C1.4.6","front":"What is scalability in the context of cloud computing?","back":"The ability to increase or decrease resources on demand without significant cost or disruption. Cloud can scale up during peak demand (e.g. Christmas retail) and scale down to avoid paying for unused capacity. On-premise systems are harder to scale."},
    {"id":"c12","section":"C","code":"C2.1.1","front":"Give TWO ways social media can be used by an organisation and ONE risk.","back":"USES: Marketing/advertising to large audiences; direct customer communication/service. RISK: Negative comments spread rapidly — can cause serious reputational damage. Also: personal data collected by platforms raises privacy concerns."},
    {"id":"c13","section":"C","code":"C2.1.3","front":"What is a wiki and what is its main limitation?","back":"A collaboratively edited website where multiple users can create and edit content (e.g. Wikipedia). Main limitation: accuracy concerns — content may be unverified or contain errors since anyone can edit."},
    {"id":"c14","section":"C","code":"C2.1.4","front":"Difference between a chatroom and a forum?","back":"Chatroom: real-time (synchronous) communication — users must be online at the same time. Forum: asynchronous — posts are permanent and searchable, users reply in their own time. Forums better for reference; chatrooms better for live discussion."},
    {"id":"c15","section":"C","code":"C2.2.4","front":"What privacy consideration must organisations be aware of when using online communities?","back":"GDPR requires users to consent to data collection. Platforms may sell data to advertisers — users may not know what data is collected. Organisations must have a clear privacy policy and ensure their social media use complies with data protection law."},
    {"id":"c16","section":"C","code":"C2.2.10","front":"What is an Acceptable Use Policy (AUP)?","back":"A set of rules an organisation sets for how employees interact online. Defines what is/isn't allowed (e.g. no sharing confidential data, professional conduct on social media). Employees represent the company online — misconduct can have legal and reputational consequences."},
    {"id":"d1","section":"D","code":"D1.1.1","front":"What is malware? Give THREE examples.","back":"Malicious software designed to damage, disrupt, or gain unauthorised access to systems. Examples: viruses (attach to files and spread), ransomware (encrypts files and demands payment), spyware (monitors user activity secretly), Trojans (disguise as legitimate software)."},
    {"id":"d2","section":"D","code":"D1.1.4","front":"What is social engineering? Give an example.","back":"Manipulating people into revealing confidential information or performing actions that compromise security. Example: phishing — sending fake emails pretending to be a bank to trick users into entering their login details."},
    {"id":"d3","section":"D","code":"D1.3","front":"State THREE impacts of a data breach on an organisation.","back":"1. Loss of data — customer/business data permanently lost or stolen. 2. Financial loss — GDPR fines (up to £17.5m or 4% global turnover) and compensation claims. 3. Reputational damage — loss of customer trust, negative publicity, fewer sales."},
    {"id":"d4","section":"D","code":"D2.4","front":"What is encryption and how does it protect data?","back":"The process of converting data into an unreadable format using an algorithm and key. Only someone with the correct decryption key can read it. Protects stored data, data in transit (e.g. emails), and data on secure websites (HTTPS uses SSL/TLS encryption)."},
    {"id":"d5","section":"D","code":"D2.1.4","front":"What is Multi-Factor Authentication (MFA) and why is it more secure than a password alone?","back":"MFA requires two or more verification factors: something you know (password), something you have (phone/token), something you are (biometric). Even if a password is stolen, attacker cannot access the account without the second factor."},
    {"id":"d6","section":"D","code":"D2.3","front":"What does a firewall do?","back":"A firewall monitors and controls incoming/outgoing network traffic based on security rules. It blocks unauthorised access to/from a private network. Can be hardware or software. Creates a barrier between trusted internal network and untrusted external networks (internet)."},
    {"id":"b1","section":"B","code":"B1.1.3","front":"What is Wi-Fi and give ONE advantage and ONE disadvantage?","back":"Wi-Fi: wireless networking standard using radio waves to connect devices to a network/internet. ADVANTAGE: no cables needed — flexible, mobile use. DISADVANTAGE: signal strength weakens with distance/walls; more susceptible to interference and security risks than wired connections."},
    {"id":"b2","section":"B","code":"B1.1.4","front":"What is Ethernet? Give ONE advantage over Wi-Fi.","back":"Wired networking standard using cables (copper or fibre optic) to connect devices. ADVANTAGE: more reliable, faster, and more secure than Wi-Fi — signal not affected by interference; harder for others to intercept."},
    {"id":"b3","section":"B","code":"B2.1.1","front":"Describe a star network topology.","back":"All devices connect to a central switch/hub. If one device fails, others are unaffected (only that connection goes down). If the central switch fails, ALL devices lose connection. Most common topology in modern networks — easy to manage and add devices."},
    {"id":"b4","section":"B","code":"B2.2.3","front":"What is a WAN and how does it differ from a LAN?","back":"WAN (Wide Area Network): covers large geographic areas, often connecting multiple LANs (e.g. across cities or countries). Uses third-party infrastructure (e.g. phone lines, fibre). LAN (Local Area Network): limited to a small area (e.g. one building). Organisation owns the infrastructure."},
    {"id":"b5","section":"B","code":"B2.2.4","front":"What is a VPN and why would an organisation use one?","back":"Virtual Private Network: creates encrypted tunnel over the internet for secure data transmission. Used to securely connect remote workers to the company network, or to link office branches over the internet without a costly dedicated line."},
    {"id":"b6","section":"B","code":"B3.1.3","front":"What is the difference between HTTP and HTTPS?","back":"HTTP: HyperText Transfer Protocol — transfers web pages over the internet; data is unencrypted. HTTPS: HTTP Secure — uses SSL/TLS encryption to protect data in transit. Ensures data cannot be intercepted and verifies the website is genuine. Essential for any site handling personal data or payments."},
    {"id":"b7","section":"B","code":"B3.3","front":"What is bandwidth and what is latency?","back":"Bandwidth: the maximum amount of data that can be transmitted per second (measured in Mbps/Gbps). Higher bandwidth = more data per second. Latency: the delay between sending data and it being received (measured in ms). Lower latency = faster response. Both affect network performance."},
    {"id":"b8","section":"B","code":"B3.5","front":"Difference between lossy and lossless compression?","back":"Lossy: permanently removes some data to achieve smaller file sizes — some quality is lost (irreversible). Used for images (JPEG), audio (MP3), video (MP4). Lossless: reduces file size without losing any data — original can be perfectly restored. Used for text, ZIP files, PNG images."},
    {"id":"e1","section":"E","code":"E1.1.1","front":"Give TWO benefits of online retail for customers and ONE risk.","back":"BENEFITS: Shop 24/7 from anywhere; wider choice of products; easy price comparison. RISK: Personal/payment data at risk of breach; products cannot be physically inspected before purchase; returns process can be inconvenient."},
    {"id":"e2","section":"E","code":"E1.2.2","front":"What is targeted marketing? How does it use IT?","back":"Marketing that uses data about individuals (browsing history, purchase history, demographics) to show personalised adverts. IT systems analyse transactional data and cookies to build customer profiles. Example: Amazon recommending products based on past purchases."},
    {"id":"e3","section":"E","code":"E2.5.1","front":"What is verification in data entry?","back":"Checking that data has been entered correctly — comparing input against original source. Methods: double entry (entering data twice and comparing), proofreading. Catches transcription errors but does NOT check whether the data itself is correct/valid."},
    {"id":"e4","section":"E","code":"E2.5.2","front":"What is validation? Give TWO types.","back":"Automated checking that data entered is reasonable, complete, and in the correct format. Types: Range check (value within acceptable range, e.g. age 0–120); Presence check (field cannot be left empty); Format check (data matches expected pattern, e.g. postcode format); Length check (correct number of characters)."},
    {"id":"a1","section":"A","code":"A3.2.3","front":"What is virtual memory?","back":"A memory management technique where the OS uses part of the hard disk as an extension of RAM. When RAM is full, less-used data is temporarily moved to the hard disk (swapping/paging), freeing RAM for active processes. Slower than RAM but prevents crashes when RAM is exhausted."},
    {"id":"a2","section":"A","code":"A3.5","front":"Name and describe FOUR types of user interface.","back":"1. CLI (Command Line Interface): text commands typed by user — powerful but requires expertise. 2. GUI (Graphical User Interface): icons, windows, mouse — intuitive for general users. 3. Menu-driven: user selects from menus — limited but simple (e.g. ATM). 4. Touchscreen GUI: same as GUI but touch input — used on smartphones/tablets."},
    {"id":"a3","section":"A","code":"A3.6","front":"Difference between open source and proprietary software?","back":"Open source: source code is freely available, can be modified and redistributed (e.g. Linux, LibreOffice). Low/no cost, community support. Proprietary: source code is closed, owned by company, cannot be modified (e.g. Windows, MS Office). Usually costs money, vendor provides support."},
    {"id":"a4","section":"A","code":"A2.3","front":"Give FOUR characteristics of storage media.","back":"1. Capacity: how much data it can hold (GB/TB). 2. Cost: price per GB. 3. Speed: how fast data is read/written. 4. Compatibility: whether the device works with the system. SSD = faster but more expensive per GB than HDD. USB flash drives = portable but lower capacity than HDD."},
    {"id":"f1","section":"F","code":"F2.1.1","front":"What does the Computer Misuse Act 1990 cover?","back":"Three offences: 1. Unauthorised access to a computer (e.g. hacking) — up to 2 years in prison. 2. Unauthorised access with intent to commit further offence (e.g. hacking to steal data). 3. Unauthorised modification of computer material (e.g. planting a virus, deleting files) — up to 10 years."},
    {"id":"f2","section":"F","code":"F2.1.5","front":"What are the key principles of the Data Protection Act 2018 / GDPR?","back":"Personal data must be: processed lawfully and with consent; collected for a specific purpose; adequate and not excessive; accurate and up to date; not kept longer than necessary; kept secure. Individuals have rights: to access their data, correct it, and request deletion ('right to be forgotten')."},
    {"id":"f3","section":"F","code":"F1.1.1","front":"What is a privacy concern in the context of IT systems?","back":"Individuals may not know what personal data is collected about them (e.g. browsing data, location, purchase history). Data may be sold to third parties without explicit consent. GDPR gives individuals the right to know what data is held and how it is used. Organisations must have transparent privacy policies."},
    {"id":"f4","section":"F","code":"F1.1.3","front":"What is meant by 'unequal access to information technology'?","back":"Not everyone has equal access to IT — due to cost, disability, age, geography, or digital literacy. This is the 'digital divide'. Can disadvantage individuals in education, employment, and access to services. Organisations and governments should consider accessibility and affordable access to reduce inequality."}
  ]
}
;

const INLINE_QUESTIONS = {
  "questions": [
    {
      "id": "q1",
      "section": "C",
      "code": "C1.1",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO types of cloud computing service model.",
      "modelAnswer": "Any two of: Software as a Service (SaaS); Platform as a Service (PaaS); Infrastructure as a Service (IaaS).",
      "markPoints": ["1 mark per correct service model named (max 2)"]
    },
    {
      "id": "q2",
      "section": "C",
      "code": "C1.1",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between a public cloud and a private cloud.",
      "modelAnswer": "A public cloud is cloud infrastructure that is shared across multiple organisations and managed by a third-party provider such as AWS or Microsoft Azure. It is cost-effective because organisations pay only for what they use, but they have less control over where their data is stored.\n\nA private cloud is operated solely for one organisation and provides more control over data security and compliance. However, it is more expensive to set up and maintain than a public cloud.",
      "markPoints": [
        "Public cloud: shared infrastructure / managed by third party (1 mark)",
        "Public cloud: lower cost / accessible over internet (1 mark)",
        "Private cloud: used by single organisation (1 mark)",
        "Private cloud: more secure/more control / higher cost (1 mark)"
      ]
    },
    {
      "id": "q3",
      "section": "C",
      "code": "C1.2",
      "marks": 6,
      "commandWord": "Discuss",
      "question": "A school is considering moving its student data and teaching resources to a cloud-based system. Discuss the benefits and drawbacks of this decision for the school.",
      "modelAnswer": "Moving to cloud computing would offer the school several benefits. The school would not need to invest in expensive on-site servers or maintain hardware, reducing capital expenditure — important for a school operating on a limited budget. Cloud storage also allows staff and students to access resources from any device with an internet connection, supporting remote learning.\n\nHowever, there are significant drawbacks. Student data is particularly sensitive; storing it on cloud servers raises data protection concerns, as the school must ensure the provider is GDPR-compliant. If the internet connection fails, neither staff nor students would be able to access teaching resources or student records, causing significant disruption to learning. There is also the risk of vendor lock-in — if the school becomes dependent on one provider, switching later could be expensive and disruptive.",
      "markPoints": [
        "L1 (1-2): Simple benefit or drawback identified with little/no development",
        "L2 (3-4): At least one benefit AND one drawback explained with some reference to the scenario",
        "L3 (5-6): Multiple benefits and drawbacks explained and linked to the school context; balanced discussion"
      ]
    },
    {
      "id": "q4",
      "section": "C",
      "code": "C1.3.1",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain how a VPN allows employees to work securely from home.",
      "modelAnswer": "A VPN (Virtual Private Network) creates an encrypted tunnel between the employee's device at home and the organisation's network. This means all data transmitted between the employee and the company is encrypted and cannot be read if intercepted. The employee can access internal resources — such as shared files and databases — as if they were physically in the office, even though they are connecting over the public internet.",
      "markPoints": [
        "Creates encrypted tunnel / encrypts data in transit (1 mark)",
        "Connects over the public internet (1 mark)",
        "Allows access to internal network resources remotely (1 mark)",
        "Data cannot be intercepted / read by third parties (1 mark)"
      ]
    },
    {
      "id": "q5",
      "section": "C",
      "code": "C2.1",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO ways an organisation can interact with online communities.",
      "modelAnswer": "Any two of: social media; blogs/vlogs; wikis; chatrooms; instant messaging; podcasts; forums.",
      "markPoints": ["1 mark per correct method (max 2)"]
    },
    {
      "id": "q6",
      "section": "C",
      "code": "C2.2",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO considerations for an organisation when using an online community platform.",
      "modelAnswer": "Security: the organisation must ensure user accounts and data are protected from unauthorised access. This includes implementing strong passwords and encryption to prevent data breaches that could damage the organisation's reputation.\n\nPrivacy: the organisation must ensure the platform complies with GDPR. Users must consent to data collection, and the organisation must have a clear privacy policy explaining what data is collected and how it is used.",
      "markPoints": [
        "Security identified (1 mark) + development/explanation (1 mark)",
        "Privacy/any other valid consideration identified (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q7",
      "section": "D",
      "code": "D1.1",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO types of external threat to an organisation's data.",
      "modelAnswer": "Any two of: viruses/malware; unauthorised access (hackers); social engineering (e.g. phishing); accidental damage; natural disasters.",
      "markPoints": ["1 mark per correct threat (max 2)"]
    },
    {
      "id": "q8",
      "section": "D",
      "code": "D1.1.4",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain what is meant by social engineering and describe ONE technique used by attackers.",
      "modelAnswer": "Social engineering is the manipulation of people into revealing confidential information or performing actions that compromise security, rather than exploiting technical vulnerabilities in systems.\n\nPhishing is a common technique where attackers send fake emails that appear to come from a legitimate source such as a bank or employer. The email tricks the recipient into clicking a malicious link or entering their login credentials on a fake website, giving the attacker access to the victim's account.",
      "markPoints": [
        "Social engineering defined: manipulating people (not systems) (1 mark)",
        "To reveal confidential information / take security-compromising action (1 mark)",
        "Named technique (e.g. phishing) (1 mark)",
        "Explanation of how the technique works (1 mark)"
      ]
    },
    {
      "id": "q9",
      "section": "D",
      "code": "D1.3",
      "marks": 6,
      "commandWord": "Explain",
      "question": "Explain the impacts of a data breach on an organisation.",
      "modelAnswer": "A data breach can have serious financial consequences. Under GDPR, the Information Commissioner's Office (ICO) can impose fines of up to £17.5 million or 4% of global annual turnover for serious breaches. The organisation may also face civil lawsuits from individuals whose data was compromised.\n\nThe organisation's reputation would be severely damaged. Customers who learn their personal data has been exposed are likely to lose trust in the organisation and take their business elsewhere. Negative media coverage can amplify this reputational damage, potentially resulting in long-term loss of revenue.\n\nOperationally, the organisation may need to take systems offline to investigate the breach and prevent further loss, causing disruption to normal business operations. The cost of hiring cybersecurity experts and notifying affected customers (required within 72 hours under GDPR) adds further expense.",
      "markPoints": [
        "L1 (1-2): One impact identified with limited development",
        "L2 (3-4): Two or more impacts explained (e.g. financial and reputational)",
        "L3 (5-6): Three or more impacts well-explained with clear links between them; e.g. financial (fines + lost revenue), reputational (lost customer trust), operational (downtime)"
      ]
    },
    {
      "id": "q10",
      "section": "D",
      "code": "D2.4",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain how encryption is used to protect data on websites that use HTTPS.",
      "modelAnswer": "HTTPS uses SSL/TLS encryption to protect data transmitted between a user's browser and a web server. When a user connects to an HTTPS site, the server sends a digital certificate to verify its identity. A symmetric encryption key is then agreed between the browser and server, and all subsequent data — including login credentials and payment details — is encrypted using this key. Even if the data is intercepted in transit, it cannot be read without the decryption key.",
      "markPoints": [
        "HTTPS uses SSL/TLS / encryption protocol named (1 mark)",
        "Data encrypted in transit / between browser and server (1 mark)",
        "Digital certificate verifies server identity (1 mark)",
        "Intercepted data cannot be read without key (1 mark)"
      ]
    },
    {
      "id": "q11",
      "section": "D",
      "code": "D2.1",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO techniques an organisation can use to protect its data from unauthorised access.",
      "modelAnswer": "Multi-factor authentication (MFA) requires users to verify their identity using two or more factors — typically a password plus a code sent to their phone. This means that even if a password is stolen, an attacker cannot access the account without the second factor.\n\nFile permissions allow the organisation to control who can read, write, or execute specific files. This ensures employees can only access data relevant to their role, reducing the risk of accidental or deliberate data leaks from within the organisation.",
      "markPoints": [
        "MFA / passwords / biometrics identified (1 mark) + development (1 mark)",
        "File permissions / access levels identified (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q12",
      "section": "B",
      "code": "B1.1",
      "marks": 4,
      "commandWord": "Compare",
      "question": "Compare Wi-Fi and Ethernet as methods of network connection.",
      "modelAnswer": "Wi-Fi uses radio waves to connect devices wirelessly, meaning users can move around freely without being tethered to a cable. However, Wi-Fi signals can be weakened by walls and interference from other devices, making the connection less reliable. Wi-Fi is also less secure than Ethernet as the signal can be intercepted more easily.\n\nEthernet uses physical cables (copper or fibre optic) to connect devices. This provides a faster, more reliable connection with lower latency, making it better for tasks requiring consistent bandwidth such as video conferencing. However, it limits the physical movement of devices.",
      "markPoints": [
        "Wi-Fi wireless / no cables / portable (1 mark)",
        "Wi-Fi disadvantage: interference / less secure / slower (1 mark)",
        "Ethernet: wired / faster / more reliable (1 mark)",
        "Ethernet disadvantage: limits movement / cable required (1 mark)"
      ]
    },
    {
      "id": "q13",
      "section": "B",
      "code": "B2.1",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe ONE advantage and ONE disadvantage of a star network topology.",
      "modelAnswer": "Advantage: in a star topology, if one device or cable fails, only that device loses its connection — all other devices continue to function normally. This makes the network more fault-tolerant and easier to troubleshoot.\n\nDisadvantage: if the central switch or hub fails, all devices connected to it lose their network connection simultaneously, making the entire network dependent on that single point of failure.",
      "markPoints": [
        "Advantage identified (e.g. fault isolation) (1 mark) + development (1 mark)",
        "Disadvantage identified (e.g. single point of failure at switch) (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q14",
      "section": "B",
      "code": "B3.1.3",
      "marks": 2,
      "commandWord": "State",
      "question": "State the difference between HTTP and HTTPS.",
      "modelAnswer": "HTTP transfers data without encryption (unsecured). HTTPS uses SSL/TLS encryption to secure data in transit, protecting it from interception.",
      "markPoints": ["HTTP: no encryption / unsecured (1 mark)", "HTTPS: uses SSL/TLS / encrypts data in transit (1 mark)"]
    },
    {
      "id": "q15",
      "section": "B",
      "code": "B3.5",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between lossy and lossless compression. Give an example of when each would be used.",
      "modelAnswer": "Lossy compression permanently removes some data from a file to achieve a smaller file size, resulting in reduced quality that cannot be restored. It is typically used for images (JPEG), audio (MP3), and video (MP4) where some quality loss is acceptable but file size is important for streaming or storage.\n\nLossless compression reduces file size without losing any data — the original file can be perfectly reconstructed from the compressed version. It is used where accuracy is critical, such as compressing text documents (ZIP), software files, or medical images where data integrity must be maintained.",
      "markPoints": [
        "Lossy: permanently removes data / reduced quality (1 mark)",
        "Lossy example: JPEG / MP3 / MP4 / streaming (1 mark)",
        "Lossless: no data lost / can be fully restored (1 mark)",
        "Lossless example: ZIP / text / PNG / software files (1 mark)"
      ]
    },
    {
      "id": "q16",
      "section": "B",
      "code": "B3.3",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the factors that affect the performance of a network.",
      "modelAnswer": "Bandwidth determines how much data can be transmitted per second — a higher bandwidth network can transfer more data simultaneously, improving performance for multiple users. Latency is the delay between data being sent and received; high latency causes slow response times, particularly noticeable in real-time applications such as video calls.\n\nThe number of users connected also affects performance — as more devices share the network, available bandwidth per device decreases. The quality of hardware (switches, cables, routers) also impacts performance; older or lower-quality equipment may create bottlenecks.",
      "markPoints": [
        "Bandwidth explained with effect on performance (1 mark)",
        "Latency explained with effect (1 mark)",
        "Number of users / congestion (1 mark)",
        "Hardware quality / cables / switches (1 mark)"
      ]
    },
    {
      "id": "q17",
      "section": "E",
      "code": "E1.1",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO benefits of online retail for a business.",
      "modelAnswer": "Online retail allows a business to reach a global customer base rather than being limited to customers in a local area. The business can operate 24 hours a day, 7 days a week, enabling sales to continue even when physical stores are closed.\n\nOnline retail typically reduces overheads compared to physical stores — the business does not need to pay rent for retail premises or employ as many shop floor staff, increasing profit margins.",
      "markPoints": [
        "Wider customer reach / global audience (1 mark) + development (1 mark)",
        "Reduced overheads / lower costs / 24/7 operation (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q18",
      "section": "E",
      "code": "E1.2.2",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain how an organisation uses transactional data for targeted marketing.",
      "modelAnswer": "Transactional data records details of each customer purchase — what was bought, when, at what price, and by whom. Organisations analyse this data to identify patterns in individual customer behaviour, such as frequently purchased products or preferred brands.\n\nThis analysis allows the organisation to send personalised marketing — for example, recommending similar products or offering discounts on items a customer regularly buys. This increases the likelihood of a sale, improves the customer experience, and is more cost-effective than blanket advertising to all customers.",
      "markPoints": [
        "Transactional data records purchases / customer behaviour (1 mark)",
        "Data analysed to identify patterns / preferences (1 mark)",
        "Used to send personalised recommendations / adverts (1 mark)",
        "Increases conversion / more effective than generic marketing (1 mark)"
      ]
    },
    {
      "id": "q19",
      "section": "E",
      "code": "E2.5",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between verification and validation in data entry systems.",
      "modelAnswer": "Verification checks that data has been entered correctly by comparing the input to the original source. A common method is double entry, where a user enters data twice and the system checks both entries match. This catches typing errors but does not check whether the data itself is valid.\n\nValidation is an automated process that checks whether entered data is reasonable, complete, and in the correct format. For example, a range check ensures a numeric value falls within acceptable limits (e.g. age must be between 0 and 120). Validation cannot check if data is true — only that it is in the correct format.",
      "markPoints": [
        "Verification: checking data entered correctly / matches original (1 mark)",
        "Example of verification (e.g. double entry, proofreading) (1 mark)",
        "Validation: automated check data is reasonable/correct format (1 mark)",
        "Example of validation (range/presence/format/length check) (1 mark)"
      ]
    },
    {
      "id": "q20",
      "section": "A",
      "code": "A3.2",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain TWO functions of an operating system.",
      "modelAnswer": "Memory management: the operating system allocates RAM to running programs, ensuring each process has sufficient memory and preventing processes from interfering with each other. When RAM is full, it uses virtual memory (swapping data to the hard disk) to avoid crashes.\n\nSecurity management: the OS controls user authentication, manages access levels, and implements encryption to protect data. It also manages the system firewall to prevent unauthorised network access.",
      "markPoints": [
        "Memory management identified (1 mark) + explanation (allocates RAM, virtual memory, swapping) (1 mark)",
        "Security / user accounts / any valid OS function identified (1 mark) + explanation (1 mark)"
      ]
    },
    {
      "id": "q21",
      "section": "A",
      "code": "A3.5",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO types of user interface.",
      "modelAnswer": "A Graphical User Interface (GUI) uses icons, windows, menus, and a pointer (usually a mouse) to allow users to interact with the computer visually. It is intuitive and requires minimal technical knowledge, making it suitable for general users.\n\nA Command Line Interface (CLI) requires the user to type text commands. It provides more direct control over the system and is faster for experienced users performing repetitive tasks, but it requires knowledge of specific commands and is not suitable for inexperienced users.",
      "markPoints": [
        "GUI identified (1 mark) + description (icons/windows/mouse/intuitive) (1 mark)",
        "CLI identified (1 mark) + description (text commands/requires expertise/faster for experts) (1 mark)"
      ]
    },
    {
      "id": "q22",
      "section": "A",
      "code": "A3.6",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain ONE benefit and ONE drawback of open source software compared to proprietary software.",
      "modelAnswer": "A benefit of open source software is that it is usually free to download and use, significantly reducing software licensing costs for organisations. The source code is also publicly available, allowing developers to customise it to meet specific needs.\n\nA drawback is that open source software may offer less dedicated technical support than proprietary software. Users typically rely on community forums rather than a dedicated helpdesk. This can be a problem for organisations that require guaranteed support response times.",
      "markPoints": [
        "Benefit: free/no licence cost / customisable source code (1 mark) + development (1 mark)",
        "Drawback: limited formal support / security risks / compatibility issues (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q23",
      "section": "F",
      "code": "F2.1.5",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain how the Data Protection Act 2018 / GDPR protects individuals.",
      "modelAnswer": "The Data Protection Act 2018 (incorporating GDPR) requires organisations to handle personal data responsibly. Data must be collected for a specific, lawful purpose and not used for anything else without the individual's consent. Organisations must not hold more data than necessary and must keep it accurate and up to date.\n\nIndividuals are given rights under the Act, including the right to access the data held about them, the right to have inaccurate data corrected, and the right to request deletion of their data (the 'right to be forgotten'). Organisations that fail to comply face significant fines from the ICO.",
      "markPoints": [
        "Data collected lawfully / for specified purpose / with consent (1 mark)",
        "Data must be accurate / not excessive / secure (1 mark)",
        "Individual rights: access / correct / delete data (1 mark)",
        "ICO can impose fines for non-compliance (1 mark)"
      ]
    },
    {
      "id": "q24",
      "section": "F",
      "code": "F2.1.1",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe the THREE offences under the Computer Misuse Act 1990.",
      "modelAnswer": "The first offence is unauthorised access to a computer system — this covers hacking into a system without permission and carries a maximum sentence of two years in prison.\n\nThe second offence is unauthorised access with intent to commit a further offence — for example, hacking a company's system to steal financial data with intent to commit fraud. This carries a more severe penalty.\n\nThe third offence is unauthorised modification of computer material — this includes installing malware, deleting files, or making changes to a system without permission. This carries a maximum sentence of ten years in prison.",
      "markPoints": [
        "Offence 1: unauthorised access / hacking (1 mark)",
        "Offence 2: unauthorised access with intent to commit further crime (1 mark)",
        "Offence 3: unauthorised modification / installing malware / deleting files (1 mark)",
        "Penalties or additional detail for any offence (1 mark)"
      ]
    },
    {
      "id": "q25",
      "section": "A",
      "code": "A1.1",
      "marks": 2,
      "commandWord": "Give",
      "question": "Give TWO examples of embedded systems.",
      "modelAnswer": "Any two of: smart thermostat; washing machine control system; ABS brakes in a car; traffic light controller; pacemaker; IoT sensors.",
      "markPoints": ["1 mark per valid embedded system example (max 2)"]
    },
    {
      "id": "q26",
      "section": "B",
      "code": "B2.2",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between a LAN and a WAN.",
      "modelAnswer": "A LAN (Local Area Network) covers a small geographic area, typically a single building or site such as a school or office. The organisation usually owns all the networking hardware (cables, switches). LANs offer high speed and low latency because all devices are physically close.\n\nA WAN (Wide Area Network) covers a large geographic area — such as connecting offices in different cities or countries — using third-party telecommunications infrastructure (e.g. fibre optic cables, leased lines). WANs are typically slower and more expensive to maintain than LANs due to the distances and infrastructure involved.",
      "markPoints": [
        "LAN: small geographic area / single building or site (1 mark)",
        "LAN: organisation owns hardware / high speed / low cost (1 mark)",
        "WAN: large geographic area / multiple sites / countries (1 mark)",
        "WAN: uses third-party infrastructure / slower / higher cost (1 mark)"
      ]
    },
    {
      "id": "q27",
      "section": "D",
      "code": "D1.2",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO internal threats to an organisation's data.",
      "modelAnswer": "Accidental disclosure of data occurs when an employee unintentionally shares confidential information — for example, sending an email containing personal customer data to the wrong recipient. This can violate GDPR and cause reputational damage even though it was not malicious.\n\nStealing or leaking information is a deliberate internal threat where a disgruntled employee copies and shares sensitive data with competitors or externally. This type of insider threat is particularly dangerous because the employee already has legitimate access to the data.",
      "markPoints": [
        "Accidental disclosure identified (1 mark) + development (1 mark)",
        "Stealing/leaking information / inappropriate website access / portable devices identified (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q28",
      "section": "C",
      "code": "C1.4",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain why scalability is an important factor for an organisation when selecting a cloud computing service.",
      "modelAnswer": "Scalability is the ability to increase or decrease computing resources on demand. For an organisation, this means that during periods of high demand — for example, a retailer during the Christmas period — additional server capacity can be provisioned almost instantly without purchasing new hardware.\n\nWhen demand falls, the organisation can reduce its resource usage and only pay for what it uses, avoiding the cost of maintaining idle hardware. This makes cloud computing more cost-efficient than on-premise infrastructure, which must be sized for peak demand but sits underused most of the time.",
      "markPoints": [
        "Scalability: ability to increase/decrease resources on demand (1 mark)",
        "Useful during peak demand periods / can scale up quickly (1 mark)",
        "Can scale down and reduce costs (1 mark)",
        "On-premise cannot scale as easily / must buy hardware in advance (1 mark)"
      ]
    },
    {
      "id": "q29",
      "section": "E",
      "code": "E1.1.2",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO benefits of online financial services (e.g. online banking) for customers.",
      "modelAnswer": "Online banking allows customers to access their accounts, transfer money, and pay bills at any time of day, from any location with internet access. This is significantly more convenient than visiting a branch during opening hours.\n\nOnline financial services also offer faster transactions. Bank transfers that once took three working days can now be completed almost instantly using Faster Payments. This benefits customers who need to make time-sensitive payments.",
      "markPoints": [
        "24/7 access / accessible anywhere (1 mark) + development (1 mark)",
        "Faster transactions / real-time balance checking / convenience (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q30",
      "section": "A",
      "code": "A4.1",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain TWO factors an organisation should consider when choosing a new IT system.",
      "modelAnswer": "Cost is an important factor — the organisation must consider both the initial purchase cost and the ongoing costs of maintenance, training, and licensing. For a small organisation, the total cost of ownership must be within budget.\n\nCompatibility is also crucial — the new system must work with existing hardware, software, and data formats already used by the organisation. If the new system is incompatible, additional costs for conversion or replacement of other systems will be incurred.",
      "markPoints": [
        "Cost identified (1 mark) + development (initial/ongoing/total cost of ownership) (1 mark)",
        "Compatibility / security / user needs / performance / implementation identified (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q31",
      "section": "F",
      "code": "F1.1",
      "marks": 6,
      "commandWord": "Discuss",
      "question": "Discuss the ethical issues associated with organisations collecting and using personal data for targeted marketing.",
      "modelAnswer": "The primary ethical issue is privacy — individuals may be unaware of the extent to which their data (browsing history, location, purchase patterns) is being collected and used. Even when consent is given through lengthy terms and conditions, it is questionable whether this constitutes truly informed consent.\n\nTargeted marketing can also create a 'filter bubble' effect where individuals are only shown content aligned with their existing interests, limiting their exposure to different perspectives. This can be seen as a form of manipulation.\n\nHowever, there are arguments that targeted marketing benefits consumers by showing them relevant products rather than generic adverts, potentially saving them time. Organisations argue that data collection enables a better user experience.\n\nOverall, the ethical concern centres on the power imbalance — organisations have far more knowledge about individuals than individuals have about how their data is used. Stronger regulation and genuine transparency would help address this.",
      "markPoints": [
        "L1 (1-2): One ethical issue identified with limited explanation",
        "L2 (3-4): Two ethical issues explained (e.g. privacy, consent, manipulation)",
        "L3 (5-6): Multiple issues explained with counterarguments considered; balanced evaluation reaching a reasoned conclusion"
      ]
    },
    {
      "id": "q32",
      "section": "D",
      "code": "D2.2",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe how antivirus software protects a computer system.",
      "modelAnswer": "Antivirus software constantly monitors the files and processes on a computer, comparing them against a database of known malware signatures. When a match is found, the software alerts the user and quarantines or deletes the malicious file to prevent damage.\n\nModern antivirus software also uses heuristic analysis to detect previously unknown threats by identifying suspicious behaviour patterns — for example, a program attempting to modify system files without authorisation. Regular updates to the virus definition database are essential to protect against new malware.",
      "markPoints": [
        "Scans files / compares to malware signature database (1 mark)",
        "Quarantines or deletes detected malware (1 mark)",
        "Heuristic analysis / detects unknown threats by behaviour (1 mark)",
        "Regular updates needed to remain effective (1 mark)"
      ]
    },
    {
      "id": "q33",
      "section": "B",
      "code": "B3.1.1",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between IMAP and POP3 for receiving email.",
      "modelAnswer": "IMAP (Internet Message Access Protocol) stores emails on the mail server and synchronises them across multiple devices. This means a user can access the same emails from a phone, laptop, and desktop, and any changes (such as deleting or moving an email) are reflected on all devices.\n\nPOP3 (Post Office Protocol 3) downloads emails from the server to a single device and typically deletes them from the server. This means emails are only accessible from the device they were downloaded to, which can be a limitation for users who access email on multiple devices.",
      "markPoints": [
        "IMAP: stores emails on server / syncs across devices (1 mark)",
        "IMAP: changes reflected on all devices (1 mark)",
        "POP3: downloads to one device / typically deletes from server (1 mark)",
        "POP3: emails only on one device (1 mark)"
      ]
    },
    {
      "id": "q34",
      "section": "A",
      "code": "A3.1",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO types of operating system.",
      "modelAnswer": "Any two of: batch; distributed; multitasking; network OS; real-time OS; mobile OS; single use; multi-user.",
      "markPoints": ["1 mark per valid OS type (max 2)"]
    },
    {
      "id": "q35",
      "section": "E",
      "code": "E2.1",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain the difference between primary and secondary sources of data.",
      "modelAnswer": "Primary data is original data collected directly for a specific purpose or research project. Methods include surveys, questionnaires, interviews, and focus groups. Primary data is up to date and specific to the researcher's needs, but it can be expensive and time-consuming to collect.\n\nSecondary data is data that already exists and was collected by someone else for a different purpose — for example, government statistics, published reports, or existing research. It is quicker and cheaper to access, but may not be perfectly suited to the researcher's current needs and could be outdated.",
      "markPoints": [
        "Primary: collected for specific purpose / first-hand data (1 mark)",
        "Primary: examples (survey, interview) / up to date / expensive to collect (1 mark)",
        "Secondary: already exists / collected by others (1 mark)",
        "Secondary: examples (reports, statistics) / cheaper but may be outdated/less relevant (1 mark)"
      ]
    },
    {
      "id": "q36",
      "section": "C",
      "code": "C1.1",
      "marks": 8,
      "commandWord": "Discuss",
      "question": "A national charity is considering moving from on-premise servers to cloud computing. The charity processes large volumes of donor personal data and relies on its systems being available 24/7. Discuss whether cloud computing is suitable for the charity. [8 marks]",
      "modelAnswer": "Cloud computing offers several advantages that could make it suitable for the charity. Moving to a cloud service would eliminate the need to maintain on-premise servers, reducing capital expenditure — important for a charity operating on limited funds. Cloud platforms are also scalable, allowing the charity to increase storage capacity as its donor database grows without purchasing additional hardware. Using SaaS applications would give staff access to systems from anywhere, which could improve flexibility.\n\nHowever, there are significant concerns specific to this scenario. The charity processes large volumes of personal data from donors, which means any cloud provider must be fully GDPR-compliant. Data stored on cloud servers may be located in different countries, raising questions about data sovereignty and compliance with UK data protection law. A breach of donor data could not only result in ICO fines but would severely damage the charity's reputation and reduce donor trust.\n\nThe charity's requirement for 24/7 availability is also a risk factor. Cloud services, despite generally having high uptime, are dependent on the charity maintaining a reliable internet connection. Any internet outage would prevent access to all systems, causing complete operational disruption.\n\nOverall, cloud computing could be suitable for the charity, particularly a private or hybrid cloud model that gives greater control over sensitive donor data while retaining the cost and scalability benefits. The charity would need to conduct thorough due diligence on the provider's security credentials and GDPR compliance before proceeding.",
      "markPoints": [
        "L1 (1-3): One or two points identified, limited development, may not link to the scenario",
        "L2 (4-6): Benefits and drawbacks explained with some links to the charity scenario (donor data, 24/7 need)",
        "L3 (7-8): Comprehensive discussion covering multiple benefits AND specific risks linked to scenario; evaluative conclusion about suitability"
      ]
    },
    {
      "id": "q37",
      "section": "A",
      "code": "A2.2",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO examples of assistive technology.",
      "modelAnswer": "Any two of: screen reader; braille display; screen magnifier; adaptive keyboard; eye-tracking software; text-to-speech software; sip-and-puff switch; head pointer.",
      "markPoints": ["1 mark per valid assistive technology (max 2)"]
    },
    {
      "id": "q38",
      "section": "D",
      "code": "D2.1",
      "marks": 2,
      "commandWord": "State",
      "question": "State TWO methods of physical access control used to protect IT systems.",
      "modelAnswer": "Any two of: biometric scanners (fingerprint/retinal); key card/swipe card access; CCTV cameras; security guards; locked server rooms.",
      "markPoints": ["1 mark per valid physical access control method (max 2)"]
    },
    {
      "id": "q39",
      "section": "F",
      "code": "F2.1.2",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain how the Copyright, Designs and Patents Act 1988 protects software developers.",
      "modelAnswer": "The Copyright, Designs and Patents Act 1988 automatically protects original software created by a developer — they do not need to register it. The Act gives the developer exclusive rights to copy, distribute, and modify their software.\n\nAnyone who copies, distributes, or adapts the software without the developer's permission is committing copyright infringement, which is a criminal offence. This protects the developer's ability to monetise their work and prevents others from profiting from their code without permission.",
      "markPoints": [
        "Automatically protects original software / no registration needed (1 mark)",
        "Gives exclusive rights to copy/distribute/modify (1 mark)",
        "Copying without permission = copyright infringement / criminal offence (1 mark)",
        "Protects developer's ability to profit from work (1 mark)"
      ]
    },
    {
      "id": "q40",
      "section": "B",
      "code": "B2.3",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain TWO factors that affect the choice of network for an organisation.",
      "modelAnswer": "Security is an important factor — the organisation must choose a network that provides sufficient protection for the data being transmitted. A business handling sensitive financial data, for example, would require a more secure network solution such as a VPN or private WAN rather than relying solely on a public internet connection.\n\nCost is also a key consideration. Setting up a WAN to connect multiple office sites involves significant infrastructure costs, including leased lines and networking equipment. The organisation must balance connection quality and security against available budget.",
      "markPoints": [
        "Security identified (1 mark) + development linked to data sensitivity / business type (1 mark)",
        "Cost / user needs / scalability / implementation / compatibility identified (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q41",
      "section": "E",
      "code": "E1.2.4",
      "marks": 4,
      "commandWord": "Describe",
      "question": "Describe TWO benefits of remote working enabled by IT systems.",
      "modelAnswer": "Remote working allows employees to work from any location, removing the need to commute to an office. This can improve work-life balance and reduce travel costs for employees, potentially increasing job satisfaction and staff retention.\n\nFor the organisation, remote working can reduce costs associated with maintaining a large office — less desk space is needed if employees work from home on a rota. IT systems such as VPNs, cloud software, and video conferencing tools make it possible for teams to collaborate effectively regardless of location.",
      "markPoints": [
        "Flexibility / no commute / improved work-life balance (1 mark) + development (1 mark)",
        "Reduced office costs / wider recruitment pool / business continuity (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q42",
      "section": "A",
      "code": "A5",
      "marks": 4,
      "commandWord": "Explain",
      "question": "Explain TWO ways in which artificial intelligence (AI) is affecting the use of IT systems in organisations.",
      "modelAnswer": "AI enables automation of repetitive tasks that previously required human input — for example, AI chatbots can handle routine customer queries 24/7, reducing the need for large customer service teams and lowering staffing costs.\n\nAI also enhances data analysis capabilities. Organisations can use machine learning to identify patterns in large datasets that humans could not process manually — for example, detecting fraudulent transactions in real time by identifying unusual spending patterns. This improves security and business decision-making.",
      "markPoints": [
        "Automation of tasks / chatbots / reducing staffing needs (1 mark) + development (1 mark)",
        "Enhanced data analysis / pattern recognition / fraud detection / decision support (1 mark) + development (1 mark)"
      ]
    },
    {
      "id": "q43",
      "section": "F",
      "code": "F2.1.1",
      "marks": 6,
      "commandWord": "Discuss",
      "question": "A company employee has accessed confidential customer records without authorisation to pass information to a competitor. Discuss which section(s) of the Computer Misuse Act 1990 apply and the potential consequences for the employee. [6 marks]",
      "modelAnswer": "Section 1 of the Computer Misuse Act 1990 applies because the employee accessed computer material (customer records) without authorisation. Even though the employee had legitimate access to the company's systems as part of their job, accessing files beyond the scope of their role constitutes unauthorised access under Section 1.\n\nSection 2 also applies because the unauthorised access was carried out with the intent to commit a further offence — passing the data to a competitor could constitute fraud or breach of confidence. Section 2 requires both unauthorised access and intent to commit or facilitate a further crime.\n\nThe consequences for the employee are serious. Under Section 1, the maximum penalty is 2 years' imprisonment and an unlimited fine. Under Section 2, the maximum penalty increases to 5 years' imprisonment. Additionally, the employee could face civil action from the company for breach of contract and a claim for damages. Their employer could also report the breach to the ICO under GDPR, which could result in the company itself being fined if adequate access controls were not in place.",
      "markPoints": [
        "Section 1 identified: unauthorised access to computer material (1 mark)",
        "Section 1 explained with reference to scenario — accessing beyond role scope (1 mark)",
        "Section 2 identified: unauthorised access with intent to commit further offence (1 mark)",
        "Section 2 linked to scenario — intent to pass data to competitor = further crime (1 mark)",
        "Consequence: criminal penalties (imprisonment/fine for S1 or S2) (1 mark)",
        "Additional consequence: civil action / GDPR implications / dismissal (1 mark)"
      ]
    },
    {
      "id": "q44",
      "section": "F",
      "code": "F1.1",
      "marks": 6,
      "commandWord": "Discuss",
      "question": "A school is introducing a new IT acceptable use policy (AUP) for students. Discuss what the AUP should include and why it is important for the school to have one. [6 marks]",
      "modelAnswer": "An acceptable use policy should clearly define what students are and are not permitted to do on school IT systems. It should specify permitted activities (e.g. educational research, using school-approved software), prohibited activities (e.g. accessing social media, downloading games, visiting inappropriate websites), and the consequences of breaching the policy (e.g. loss of IT access, disciplinary action).\n\nThe AUP should also include a clause informing students that their activity on school systems may be monitored. This is both a legal requirement under GDPR — students must be informed that their data (in this case, their browsing activity) is being processed — and a deterrent against misuse.\n\nIt is important for the school to have an AUP because it protects the school legally: if a student breaches the policy and causes harm (e.g. cyberbullying another student using school equipment), the school can demonstrate it had clear rules in place. It also helps manage security risks by preventing students from installing malware or accessing harmful content on school networks. Finally, it sets clear expectations for acceptable digital behaviour, which supports students' wider digital literacy and netiquette skills.",
      "markPoints": [
        "AUP contents: permitted and prohibited activities identified (1 mark)",
        "AUP includes consequences of breach (1 mark)",
        "Monitoring clause included with GDPR justification (1 mark)",
        "Importance: legal protection for the school (1 mark)",
        "Importance: security risk management (preventing malware/inappropriate content) (1 mark)",
        "Importance: setting expectations / supporting digital literacy / netiquette (1 mark)"
      ]
    }
  ]
}
;

const INLINE_EXTENDED = [
  {
    "id": "cloud-9",
    "title": "Cloud Computing Suitability (9 marks)",
    "marks": 9,
    "time": 1080,
    "section": "C",
    "command": "Discuss",
    "question": "A small business currently stores all its customer data on local servers. The business owner is considering moving to cloud computing. Discuss the suitability of moving to cloud computing for this business. [9 marks]",
    "structure": [
      "Para 1 — Identify: Name the relevant cloud model(s) (e.g. public cloud, SaaS/IaaS) and briefly state what cloud computing is in context.",
      "Para 2 — Benefits: Give 2–3 specific benefits linked to the scenario (small business = limited budget, needs scalability, staff may work remotely).",
      "Para 3 — Drawbacks: Give 2–3 specific drawbacks/risks linked to the scenario (GDPR compliance, internet dependency, vendor lock-in).",
      "Para 4 — Evaluate: Make a clear judgement — is it suitable? On balance, why? Qualify with conditions (e.g. 'provided the business chooses a GDPR-compliant provider').",
      "Target: ~300–400 words. Level 3 = benefits AND drawbacks clearly linked to the scenario with a supported conclusion."
    ],
    "tips": [
      "Identify the cloud model (SaaS/IaaS/PaaS or public/private/hybrid) — examiners reward specific terminology",
      "Benefits must be linked to THIS scenario: small business = cost savings, no IT staff needed, scalability",
      "Drawbacks must be linked too: GDPR concerns with data stored offshore, internet outage = no access",
      "Level 3 (7–9 marks): your conclusion must be supported — don't just say 'it is suitable', say WHY on balance",
      "Key phrase: 'the suitability depends on...' signals an evaluative conclusion"
    ],
    "markScheme": [
      "**[1–3 marks — Level 1]** Basic identification of cloud features or general benefits/drawbacks with limited or no link to the scenario. e.g. 'Cloud computing is cheaper' without development.",
      "**[4–6 marks — Level 2]** Benefits AND drawbacks identified with some explanation. At least one point clearly linked to the small business scenario. Response is mostly descriptive with emerging analysis.",
      "**[7–9 marks — Level 3]** Benefits and drawbacks both clearly explained and consistently linked to the small business scenario. Supported evaluative conclusion present — judgement on overall suitability with justification.",
      "**Mark points (indicative):** Cost reduction / no capital expenditure on servers **(1)**; pay-as-you-go / subscription model suitable for small budget **(1)**; scalability — easy to increase storage as business grows **(1)**; remote access for staff **(1)**; GDPR compliance concern — data stored in third-party/overseas servers **(1)**; internet dependency — outage means no access to customer data **(1)**; vendor lock-in risk **(1)**; security risk — shared infrastructure, data breach by provider **(1)**; evaluative conclusion with justification **(1)**"
    ],
    "modelAnswer": "Cloud computing could be highly suitable for this small business, though the decision requires careful consideration of both benefits and risks.\n\nThe most significant benefit is cost reduction. Currently the business pays for local server hardware, maintenance, and potentially IT support staff. Moving to a public cloud model — for example, using a SaaS solution for customer data management — eliminates these capital costs and replaces them with a predictable monthly subscription. For a small business with limited capital, this is a major advantage. Scalability is another benefit: if the business grows and needs more storage, cloud capacity can be increased almost instantly without purchasing new hardware.\n\nCloud computing also enables remote access to customer data, which supports flexible working and means the business owner can access records from any device with an internet connection.\n\nHowever, there are important risks. Cloud providers store data on remote servers, potentially located outside the UK. Under GDPR and the Data Protection Act 2018, the business remains responsible for ensuring its customers' personal data is processed lawfully, even if a third party stores it. If the provider suffers a data breach, the business could face ICO fines and reputational damage. Additionally, the business becomes entirely dependent on a reliable internet connection — any outage would prevent access to customer records, disrupting operations. Vendor lock-in is a further concern: migrating data away from one cloud provider to another can be costly and technically complex.\n\nOverall, cloud computing is suitable for this small business given the significant cost savings and scalability benefits, which directly address the challenges a small business faces. However, suitability is conditional: the business must select a GDPR-compliant UK or EEA-based provider, ensure adequate internet redundancy, and include clear data processing agreements in its contract with the provider."
  },
  {
    "id": "cyber-security-8",
    "title": "Cyber Security Threats and Impacts (8 marks)",
    "marks": 8,
    "time": 1080,
    "section": "D",
    "command": "Discuss",
    "question": "A retail organisation has experienced a cyber attack in which customer payment data was stolen. Discuss the impacts of this cyber attack on the organisation. [8 marks]",
    "structure": [
      "Para 1 — Financial impact: fines (GDPR/ICO), legal action from affected customers, incident response costs.",
      "Para 2 — Reputational impact: loss of customer trust, media coverage, reduction in sales — link to retail scenario (customers avoid giving card details).",
      "Para 3 — Operational impact: downtime, systems taken offline, investigation disrupting trading.",
      "Para 4 — Evaluate: Which impact is most severe and hardest to recover from? Support your judgement.",
      "Target: ~300–350 words. Level 3 = multiple distinct impacts explained with scenario linkage + evaluative conclusion."
    ],
    "tips": [
      "Use D1.3 spec codes: loss of data, financial loss due to legal action, loss of customers due to public image",
      "GDPR breach notification: within 72 hours to ICO — failure to notify is itself a violation",
      "ICO fine: up to £17.5m or 4% of global annual turnover — mention the figure for marks",
      "Retail scenario: customers specifically will fear card fraud — link every point to THIS context",
      "Level 3 conclusion: state which impact is MOST severe and WHY (reputational is often hardest to undo)"
    ],
    "markScheme": [
      "**[1–3 marks — Level 1]** Basic identification of one or two impacts with limited development. Generic statements not linked to the scenario.",
      "**[4–6 marks — Level 2]** At least two distinct impact types identified and explained. Some connection to the retail/payment data scenario. Mostly descriptive with limited evaluation.",
      "**[7–8 marks — Level 3]** Multiple distinct impacts (financial, reputational, operational) explained and consistently linked to the retail scenario. Evaluative conclusion present — judgement on relative severity with justification.",
      "**Mark points (indicative):** GDPR fine / ICO penalty (up to £17.5m or 4% turnover) **(1)**; legal action / compensation claims from affected customers **(1)**; incident response costs (forensics, notification, system rebuild) **(1)**; reputational damage / loss of customer trust **(1)**; loss of customers / reduced revenue in retail context **(1)**; operational disruption / systems taken offline / downtime **(1)**; long-term security improvement costs **(1)**; evaluative conclusion on most severe impact with justification **(1)**"
    ],
    "modelAnswer": "The cyber attack would have severe and wide-ranging impacts on the retail organisation.\n\nThe most immediate impact is financial. Under GDPR, the organisation is required to report the breach to the ICO within 72 hours. If the ICO determines that the organisation failed to adequately protect customer payment data, it can impose fines of up to £17.5 million or 4% of global annual turnover — whichever is higher. Beyond regulatory fines, affected customers may pursue civil compensation claims, adding further financial exposure. The organisation will also face significant incident response costs: forensic investigation, customer notification, and rebuilding compromised systems.\n\nReputational damage is equally serious. News of a breach involving payment card data is particularly damaging for a retailer because customers' primary concern will be that their financial details have been stolen and could be used fraudulently. This will undermine trust in the organisation, leading customers to shop elsewhere. Negative media coverage and social media criticism will amplify this effect, accelerating the loss of customers and revenue.\n\nOperationally, the organisation may need to take affected systems offline during the investigation to prevent further data loss. This downtime prevents normal trading and adds to financial losses.\n\nIn the long term, the business will need to invest significantly in strengthening its security infrastructure — implementing stronger encryption, multi-factor authentication, and regular penetration testing — representing ongoing additional costs.\n\nOverall, whilst all impacts are significant, the reputational damage is likely the most severe in the long term. Financial penalties can be absorbed or insured against, and systems can be rebuilt, but lost customer trust in a competitive retail market is extremely difficult to restore. Customers have many alternatives, and once they associate the brand with a payment data breach, rebuilding confidence takes years."
  },
  {
    "id": "networks-6",
    "title": "Network Factors for a Multi-Site Organisation (6 marks)",
    "marks": 6,
    "time": 720,
    "section": "B",
    "command": "Describe",
    "question": "A company has offices in three different cities across the UK. Describe the factors the company should consider when choosing a network to connect its offices. [6 marks]",
    "structure": [
      "Point 1 — Security: data travelling between cities = interception risk. WAN + VPN solution.",
      "Point 2 — Cost: leased lines vs broadband, recurring vs capital costs for a multi-city WAN.",
      "Point 3 — Performance/Efficiency: bandwidth and latency requirements for video conferencing, file sharing.",
      "Point 4 — Implementation: timescales, testing, downtime during setup.",
      "Target: ~200–250 words. 6-mark levels question: aim for at least 3 factors, each with explanation linked to the scenario."
    ],
    "tips": [
      "Use B2.3 spec codes: user needs, cost, security, efficiency, implementation, compatibility",
      "Link every factor to the scenario — three offices, UK-wide, data transmitted between cities",
      "Level 3 (5–6 marks): each factor explained in context, not just listed",
      "WAN + VPN is the expected network type for multi-city — naming it gains marks",
      "Don't just name factors — explain WHY each matters for THIS company"
    ],
    "markScheme": [
      "**[1–2 marks — Level 1]** One or two factors named with minimal or no explanation. Generic response not clearly linked to the scenario.",
      "**[3–4 marks — Level 2]** Two or three factors identified with some explanation. Some linkage to the multi-site scenario.",
      "**[5–6 marks — Level 3]** Three or more factors clearly explained and linked to the multi-city organisation scenario. Each factor has a clear 'why it matters here' element.",
      "**Mark points (indicative):** Security — data transmitted between cities at risk of interception, VPN encryption needed **(1)**; Cost — WAN infrastructure / leased lines expensive, must balance cost vs reliability **(1)**; Bandwidth/performance — sufficient for video conferencing and file transfer between offices **(1)**; Implementation — timescales and downtime during setup **(1)**; Reliability/efficiency — consistent uptime essential for business operations across sites **(1)**; Compatibility — must work with existing hardware/software at each office **(1)**"
    ],
    "modelAnswer": "The company should consider security as a primary factor. Because data will travel over public infrastructure between three cities, there is a risk of interception. The company should use a WAN with VPN technology to encrypt all data in transit between offices, protecting confidential business information.\n\nCost is another key consideration. A WAN connecting three UK cities involves significant recurring costs — leased lines or managed broadband connections at each site, plus ongoing maintenance and support. The company must assess whether the budget supports the level of connectivity required.\n\nPerformance and bandwidth must be considered carefully. If staff regularly use video conferencing between offices or transfer large files, the network must provide sufficient bandwidth and low enough latency to support this without disruption. A slow or unreliable connection would reduce productivity across all three locations.\n\nFinally, implementation timescale matters. Setting up a multi-site WAN requires planning, testing, and a migration period during which connectivity may be disrupted. The company must schedule this to minimise downtime and ensure all three offices can continue operating during the transition."
  },
  {
    "id": "it-impact-organisations-10",
    "title": "Impact of IT Systems on Organisations (10 marks)",
    "marks": 10,
    "time": 1080,
    "section": "A",
    "command": "Evaluate",
    "question": "A large supermarket chain is replacing its manual stock-taking process with an automated IT system that tracks stock levels in real time using barcode scanners and a central database. Evaluate the impact of this new IT system on the organisation. [10 marks]",
    "structure": [
      "Para 1 — Productivity/efficiency: automation replaces manual counting, real-time data improves ordering decisions. Link to supermarket context.",
      "Para 2 — Cost implications: upfront implementation costs (hardware, software, training) vs long-term savings (reduced labour, fewer stockouts).",
      "Para 3 — Workforce impact: job displacement / changed roles / training needs. Balance against new roles created.",
      "Para 4 — Security and data concerns: central database = single point of failure, data breach risk if customer/stock data exposed.",
      "Para 5 — Evaluate: On balance, is the impact positive? Consider short-term disruption vs long-term gain. Qualify your conclusion.",
      "Target: ~400–500 words. Level 3 = multiple impact areas with scenario linkage + supported evaluative conclusion."
    ],
    "tips": [
      "Use A4.3 spec codes: user experience, cost, implementation, productivity, working practices, staff training, security",
      "Supermarket scenario: stock control (A4.2.1) is the specific IT use — anchor every point to this",
      "Implementation (A4.3.4): timescales, testing, migration, downtime — the transition period has real costs",
      "Working practices (A4.3.7): staff who did manual stock counts now use handheld scanners — role changes, not necessarily job losses",
      "Level 3 conclusion: weigh short-term disruption against long-term benefit — which outweighs the other and why?"
    ],
    "markScheme": [
      "**[1–3 marks — Level 1]** Basic identification of one or two impacts with limited development. Generic response not clearly linked to the supermarket/stock control scenario.",
      "**[4–6 marks — Level 2]** Two or more distinct impact areas identified and explained. Some linkage to the scenario. Mostly descriptive; limited evaluation present.",
      "**[7–9 marks — Level 3]** Multiple distinct impacts clearly explained and consistently linked to the supermarket scenario. Evaluative conclusion present — judgement on overall balance of impact with justification.",
      "**[10 marks — Level 3 top]** As Level 3 with a fully supported, nuanced conclusion that acknowledges complexity (e.g. positive long-term impact conditional on successful implementation and staff training).",
      "**Mark points (indicative):** Improved stock accuracy / reduced stockouts / better ordering decisions **(1)**; real-time data enables faster response to demand changes **(1)**; implementation costs — hardware (scanners, servers), software, installation **(1)**; disruption during implementation / staff learning curve **(1)**; long-term cost savings — reduced labour for manual counting, less waste **(1)**; staff training needs (initial + ongoing) **(1)**; changed working practices — staff roles altered, not necessarily eliminated **(1)**; security risk — central database is a target; breach could expose supplier/pricing data **(1)**; dependency on system — if system fails, stock management disrupted **(1)**; evaluative conclusion with justified judgement on overall impact **(1)**"
    ],
    "modelAnswer": "The introduction of a real-time automated stock control system would have significant impacts on this supermarket chain across productivity, cost, workforce, and security.\n\nThe most immediate positive impact is on productivity and operational efficiency. Real-time barcode scanning means stock levels are updated instantly as items are received and sold. This eliminates the delays and errors associated with manual stock counts — which might only occur weekly — and enables the supermarket to automate reorder triggers when stock falls below a threshold. This reduces the risk of stockouts, which directly affects customer satisfaction and sales revenue.\n\nHowever, the implementation phase carries real costs. The supermarket must invest in barcode scanners, a central database, network infrastructure across all store locations, and software licences. Migrating from a manual system requires a testing period during which both systems may run in parallel, increasing workload. Downtime during the transition could disrupt stock management temporarily.\n\nThe impact on the workforce is nuanced. Staff who previously spent time manually counting stock will have their roles changed — they will use handheld scanners rather than clipboards. This requires initial training and potentially ongoing technical support. Some roles may be reduced if automation handles tasks previously done by more staff, but new roles in IT support and database management will likely be created. There is therefore a risk of short-term job insecurity, which could affect morale.\n\nFrom a security perspective, centralising all stock data in a single database creates a concentrated risk. If the database is breached, sensitive supplier pricing or customer purchasing data could be exposed, creating GDPR compliance issues and reputational damage.\n\nOverall, the long-term impact on the organisation is strongly positive. The efficiency gains, cost savings from reduced labour and waste, and improved decision-making capability significantly outweigh the upfront investment and transitional disruption. The key condition for success is adequate staff training and a well-planned implementation that minimises downtime. Provided these are managed carefully, the new system represents a clear improvement for the organisation."
  },
  {
    "id": "legal-ethical-10",
    "title": "Effectiveness of IT Legislation (10 marks)",
    "marks": 10,
    "time": 1080,
    "section": "F",
    "command": "Evaluate",
    "question": "Evaluate the extent to which current UK legislation effectively protects individuals using IT systems. [10 marks]",
    "structure": [
      "Para 1 — DPA 2018 / UK GDPR: what it protects, how (rights + ICO enforcement), limitation (overseas enforcement, consent fatigue).",
      "Para 2 — Computer Misuse Act 1990: deters hacking/malware, limitation (anonymous attackers, cross-border, outdated for modern threats).",
      "Para 3 — CDPA 1988 / Copyright Regs: protects IP/software, limitation (peer-to-peer piracy, overseas sites, enforcement cost).",
      "Para 4 — Evaluate: On balance, does legislation provide effective protection? Identify the biggest gap. Conclude with a qualified judgement.",
      "Target: ~400–500 words. Level 3 = each law evaluated (strengths + limits) + a supported overall conclusion."
    ],
    "tips": [
      "Name all three Acts with correct years: DPA 2018, CMA 1990, CDPA 1988",
      "ICO powers are a strength: fines up to £17.5m / 4% global turnover — use the figure",
      "The biggest weakness across all laws: global/anonymous nature of the internet makes enforcement extremely difficult",
      "Balance: legislation creates a framework and deters domestic offenders — but international reach is the critical gap",
      "Level 3 conclusion: qualified — 'effective within domestic borders but significantly limited by...' scores higher than a simple yes/no"
    ],
    "markScheme": [
      "**[1–3 marks — Level 1]** Names one piece of legislation with limited description. No evaluation. Generic or largely irrelevant content.",
      "**[4–6 marks — Level 2]** Two or more Acts identified with explanation of what they protect. Some attempt to consider limitations. Mostly descriptive; limited balance.",
      "**[7–9 marks — Level 3]** All three main Acts discussed with both strengths and limitations evaluated. Supported conclusion present.",
      "**[10 marks — Level 3 top]** As Level 3 with a nuanced, fully supported conclusion that acknowledges complexity — e.g. effective domestically but fundamentally limited globally; legislation is necessary but insufficient alone.",
      "**Mark points (indicative):** DPA/GDPR: individual rights (access, erasure, portability) **(1)**; ICO enforcement powers / fine levels **(1)**; DPA limitation: overseas enforcement difficulty **(1)**; CMA 1990: criminalises unauthorised access / three-tier offences **(1)**; CMA limitation: anonymous/overseas attackers, outdated for AI-era threats **(1)**; CDPA 1988: protects software as literary work **(1)**; CDPA limitation: online piracy enforcement impractical **(1)**; overall evaluation: effective framework domestically but limited globally **(1)**; conclusion: legislation necessary but insufficient — technical measures also required **(1)**; highest-quality conclusion with nuanced qualification **(1)**"
    ],
    "modelAnswer": "Current UK legislation provides a meaningful framework for protecting individuals using IT systems, but its effectiveness is significantly constrained by the global and often anonymous nature of the internet.\n\nThe Data Protection Act 2018 and UK GDPR give individuals substantial rights over their personal data — including the right to access, rectify, and erase their data, and to object to automated decision-making. The Information Commissioner's Office (ICO) has real enforcement powers, including fines of up to £17.5 million or 4% of global annual turnover for serious breaches. This creates genuine accountability for UK organisations. However, a critical limitation is that many data-handling organisations, particularly large tech platforms, are based outside the UK. The ICO's jurisdiction does not extend effectively to overseas companies, meaning individuals' data processed by foreign entities may receive weaker protection in practice.\n\nThe Computer Misuse Act 1990 criminalises unauthorised access to computer systems and the deployment of malicious software across three tiers of offences. This deters domestic cybercriminals and provides a legal basis for prosecution. However, the Act was written in 1990, before the modern threat landscape existed — state-sponsored attacks, ransomware groups operating from jurisdictions with no extradition treaties, and AI-assisted hacking are difficult to prosecute under the Act. Offenders are frequently anonymous and based overseas, making enforcement practically difficult regardless of the legal framework.\n\nThe Copyright, Designs and Patents Act 1988 protects software as a literary work, preventing piracy and unauthorised copying. However, the proliferation of peer-to-peer file sharing and overseas piracy sites makes enforcement costly and largely impractical for individuals seeking to enforce their rights.\n\nIn conclusion, UK legislation is effective at protecting individuals from domestic threats and at holding UK-based organisations accountable. The DPA/GDPR framework in particular is among the strongest in the world. However, legislation alone is insufficient: the global, anonymous nature of the internet means enforcement against overseas actors is largely theoretical. Individuals remain significantly exposed to threats from outside UK jurisdiction. Legislation therefore provides a necessary but incomplete level of protection — it must be supplemented by technical measures such as encryption, security software, and individual digital literacy."
  },
  {
    "id": "online-services-impact-12",
    "title": "Impact of Online Services on Organisations (12 marks)",
    "marks": 12,
    "time": 1260,
    "section": "E",
    "command": "Evaluate",
    "question": "A traditional high-street bank is considering expanding its services to offer a full online and mobile banking platform. Evaluate the impact of this change on the bank as an organisation. [12 marks]",
    "structure": [
      "Para 1 — Customer experience and reach: 24/7 access, broader customer base, accessibility. Link to banking scenario.",
      "Para 2 — Operational costs: reduced need for physical branches / staff, but high IT infrastructure investment required.",
      "Para 3 — Security risks: online banking = target for cybercrime (phishing, account takeover), GDPR and financial regulation obligations.",
      "Para 4 — Working practices and staff impact: branch staff roles change, some redundancies, retraining required.",
      "Para 5 — Data and analytics: transactional data enables targeted marketing, personalisation — competitive advantage.",
      "Para 6 — Evaluate: On balance, is this transition beneficial? What are the biggest risks? What conditions make it successful?",
      "Target: ~500–600 words. Level 3/4 = multiple perspectives, scenario-specific, nuanced conclusion with conditions."
    ],
    "tips": [
      "E1.1.2 (financial services) and E1.2.1 (transactional data) are the core spec codes here",
      "A4.3 impact codes: user experience, cost, working practices, security, productivity — use all of them",
      "Digital divide: not all customers can access online banking — older or less digitally literate customers excluded",
      "GDPR: financial data is highly sensitive — breach consequences are severe for a bank",
      "12-mark question: aim for 5+ distinct impact areas, each with scenario linkage. Your conclusion must weigh these up explicitly."
    ],
    "markScheme": [
      "**[1–3 marks — Level 1]** Identifies one or two basic impacts with limited development. Generic response not linked to the banking scenario.",
      "**[4–6 marks — Level 2]** Three or more impacts identified with explanation. Some scenario linkage. Descriptive with limited evaluation.",
      "**[7–9 marks — Level 3]** Multiple impact areas clearly explained and linked to the bank scenario. Evaluative conclusion present with some justification.",
      "**[10–12 marks — Level 3/4 top]** As Level 3 with comprehensive coverage of diverse impacts, consistent scenario linkage throughout, and a fully supported, nuanced evaluative conclusion that considers conditions and trade-offs.",
      "**Mark points (indicative):** Improved customer accessibility / 24/7 service availability **(1)**; broader customer reach — customers without local branch access **(1)**; long-term cost reduction — fewer branches / reduced staffing costs **(1)**; high upfront IT investment — platform development, security infrastructure **(1)**; cybersecurity risks — phishing, account takeover, man-in-the-middle attacks **(1)**; GDPR obligations — financial data is highly sensitive, breach = significant fine **(1)**; staff working practices changed — branch cashier roles reduced **(1)**; retraining / redundancy costs in transition **(1)**; digital divide — older/less digitally literate customers excluded or disadvantaged **(1)**; transactional data enables targeted marketing / personalised product offers **(1)**; competitive advantage — banks without online platform lose customers to fintech competitors **(1)**; evaluative conclusion with conditions for success **(1)**"
    ],
    "modelAnswer": "Moving to a full online and mobile banking platform would have wide-ranging impacts on the bank across customer experience, operations, security, workforce, and competitive positioning.\n\nFrom a customer experience perspective, online banking delivers significant benefits. Customers gain 24/7 access to their accounts, removing the constraint of branch opening hours. The bank can also reach customers in areas without a local branch, potentially expanding its customer base. Features such as instant transfers, real-time balance notifications, and mobile cheque deposits improve convenience substantially.\n\nHowever, not all customers will benefit equally. Older customers or those with limited digital literacy may struggle to use the platform, effectively excluding them from services they currently access in-branch. The bank has a responsibility under the Equality Act and its own service obligations to ensure these customers are not disadvantaged — which may require maintaining some physical branches or telephone services, reducing the anticipated cost savings.\n\nIn terms of operational costs, the long-term savings could be substantial: fewer physical branches means reduced property costs, and reduced footfall in branches means lower staffing requirements. However, the upfront investment is significant — developing a secure, scalable platform, integrating it with existing systems, and testing it thoroughly requires considerable capital expenditure and a lengthy implementation period during which normal operations must continue.\n\nSecurity is one of the most critical impacts. Online banking is a high-value target for cybercriminals: phishing attacks attempting to steal login credentials, man-in-the-middle attacks intercepting transactions, and account takeover fraud are all significant threats. The bank must invest heavily in security measures — multi-factor authentication, real-time fraud detection, end-to-end encryption — and will face strict obligations under GDPR and Financial Conduct Authority (FCA) regulations. A data breach involving financial data could result in severe ICO fines, legal action from affected customers, and catastrophic reputational damage.\n\nThe impact on the workforce is significant. Branch cashiers and counter staff will see their roles reduced as more customers manage accounts online. This creates potential redundancies and requires investment in retraining staff for digital support roles. Managing this transition sensitively is important for staff morale and the bank's public image.\n\nA strategic benefit of online banking is the volume of transactional data generated. The bank can analyse spending patterns to offer personalised financial products — such as targeted loan or savings account offers — creating a competitive advantage and additional revenue streams.\n\nOverall, the transition to online banking represents a strongly positive long-term impact for the bank, provided it is executed carefully. The cost savings, expanded reach, and data-driven competitive advantages are substantial. The critical risks — cybersecurity, customer exclusion, and workforce disruption — are manageable but require significant investment. The bank's success depends on maintaining service quality for all customer segments during and after the transition, and on building a security infrastructure robust enough to protect highly sensitive financial data."
  }
]
;
