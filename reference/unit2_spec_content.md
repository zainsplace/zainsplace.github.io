# Unit 2: Cyber Security and Incident Management — Official Pearson Content

**Source:** Pearson Level 3 Alternative Academic Qualification BTEC National in Information Technology (Extended Certificate), Specification Issue 5 – November 2025, Unit 2: Cyber Security and Incident Management (pages 35–72), "Content" section.
https://qualifications.pearson.com/content/dam/pdf/btec-aaqs/information-technology/2025/specification-and-sample-assessments/btec-level-3-national-ext-cert-in-it-aaq-spec.pdf

**Assessment:** External examination | 90 marks | 2 hours 15 minutes | short- and long-answer questions

## Assessment Outcomes

- **AO1** — Demonstrate knowledge and understanding.
- **AO2** — Apply knowledge and understanding.
- **AO3** — Analyse and evaluate.

Key command terms: Complete, Describe, Explain, Evaluate, Identify, State/name/give.

> Converted from the PDF text. The wording, including Pearson's typos and the B3.2 numbering slip (B3.2.1, B3.2.2, then B3.3.3, B3.3.4), is as published.

---

## A: Cyber security threats, system vulnerabilities and security protection methods

### A1 Cyber security threats Students should apply their knowledge and understanding of the function and impact of internal and external threats.

**A1.1** Internal threats:

- **A1.1.1** employee sabotage, deliberate and accidental
  - theft or loss of
    - physical equipment
    - data
    - software/licences
  - use of unauthorised software
    - license and legal liability issues
    - compatibility issues
    - interference with running of the network/other software
    - used for spying. harassment, illegal activities
    - used to avoid/interfere with monitoring, auditing, user/device supervision
- **A1.1.2** accidental or deliberate damage
  - fire
  - flood
  - power loss
  - terrorism
  - other disasters
- **A1.1.3** weak cyber security measures and unsafe practices
  - security of computer equipment and storage devices
  - security vetting of visitors
  - visiting untrustworthy websites
- **A1.1.4** accidental loss or disclosure of data/credentials
  - human factors
    - negligence
    - poor training
    - not following security procedures
  - inadequate monitoring and reporting
  - weak security culture

**A1.2** Function of external threats:

- **A1.2.1** malicious software (malware)
  - viruses
    - boot sector
    - web script
    - macro
    - worm
    - rootkit
    - trojan
    - browser hijack
    - polymorphic
  - spyware
    - keylogger/data thief
    - system monitor
    - mobile device tracker/stalkerware
    - web beacons and tracking cookies
  - adware
    - potentially unwanted program (PUP)
    - legitimate adware
    - abusive or deceptive adware, legal and illegal
  - ransomware
    - encryptors
    - lockers
    - scareware
    - leakware/doxware
  - bots
- **A1.2.2** hacking – commercial, government, individuals
  - Denial of Service (DoS) and Distributed Denial of Service (DDoS)
  - browser hijack
  - cyberwarfare
  - data theft
  - data tampering
    - back end – databases and other data stores
    - front end – web pages and other public facing displays
- **A1.2.3** sabotage – commercial, government, individuals, terrorism
  - data poisoning
  - data tampering
  - data destruction
  - fakes
    - images, video, audio, documents
    - using manual/traditional software methods
    - using Artificial Intelligence (AI)
  - damage to/hijacking of
    - machinery
    - vehicles
    - internet connected devices
    - industrial processes
    - critical infrastructure – commercial and national
- **A1.2.4** social-engineering techniques used to obtain secure information by deception.
  - phishing, vishing, smishing
  - whaling, spear phishing
  - Domain Name System (DNS) spoofing
  - pretexting/impersonation
- **A1.2.5** physical security
  - unauthorised access to secure areas
    - tailgating
    - forced entry
    - impersonation
    - coercion
  - unauthorised access to devices
    - unattended devices
    - shoulder surfing
    - theft of device
    - lost devices
    - devices/interfaces installed in public areas

**A1.3** Impact of a credible threat, likely to result in some form of loss:

- **A1.3.1** operational loss
  - manufacturing output
  - service availability
  - data availability
- **A1.3.2** financial loss
  - organisational
    - cash flow problems
    - loss of profits
    - increased insurance costs
  - compensation
    - refunds to customers
    - payments for compromising customer data/personal information
    - costs of remedial actions such as credit score/identity protection
    - payment for contractual default/inability to provide contracted service/goods
    - discounts/write-offs to retain/regain customers
  - legal liability
    - fines
    - penalty payments
    - costs of statutory requirements in investigations
    - legal fees
- **A1.3.3** reputational loss
  - loss of trust
  - poor customer reviews
    - on social media
    - on review websites
    - on organisation's own website
  - reduced scores on reputation metrics/web sites
- **A1.3.4** intellectual property loss
  - new product design
  - testing and development data
  - organisational strategy
  - trade secrets

**A1.4** Cyber security threats vary over time and cyber security organisations provide
 regular updates on the current and changing threat landscape.
- **A1.4.1** National Cyber Security Centre (NCSC) UK
  - latest threat reports and malware analysis
  - news (reports and advisories on recent activity)
- **A1.4.2** National Institute of Standards and Technology (NIST) USA
  - news (reports and advisories on recent activity)
- **A1.4.3** Open Web Application Security Project (OWASP)
  - OWASP Top 10

### A2 System vulnerabilities Students should apply their knowledge and understanding of the different types of systems and their vulnerabilities, tools to assess the vulnerabilities and the risk management measures.

**A2.1** Vulnerabilities of different types of computer and/or systems and the different
 threats they are exposed to.
- **A2.1.1** network
  - firewall ports
    - types
      - assigned/well known, such as port 80 for Hypertext Transfer Protocol (HTTP)
      - registered, used by operating systems, internet services and specific pieces of software
      - dynamic/private, used for private/customised services, temporary needs
    - vulnerabilities
      - open ports
      - spoofing
      - Denial of Service (DoS)
  - external storage devices
    - universal serial bus (USB)/flash drive
    - SD card
    - external hard drive
    - solid state device (SSD)
    - optical disk and magnetic tape, in the context of backup systems
- **A2.1.2** organisational
  - permissions or privileges
    - read, write, execute, modify/change
    - user, administrator, system, group
    - on files, folders/directories, devices, data structures, services
  - password policy
    - minimum and maximum length
    - character restrictions
    - frequency of password reuse
    - disallow personal names, birthdays etc.
    - specify a minimum password age
    - prevent password sharing/multiple logon with same password
  - password management
    - password managers
      - on an individual device
      - synchronised between devices
      - cloud based
      - to generate passwords
    - lockout of inactive accounts
    - effective new user/leaving user process
    - auto-filling of forms/screens by
      - browser
      - dedicated software
- **A2.1.3** software
  - from an untrustworthy source
  - software downloads
    - requirement for
      - trusted source
      - Hypertext Transfer Protocol Secure (HTTPS) or lock symbol
      - malware scan, pre-install
      - hash check
    - malicious/deceptive installers
  - illegal copies
    - lack of security support/updates
    - backdoors
    - containing malware
  - zero-day exploits
    - new threats
    - window of exploitation before fix/patch applied
  - data storage and processing software
    - SQL injection
    - poor/no protection on internet-facing data systems
    - design/security flaws in web interfaces
  - missing patches/updates
- **A2.1.4** operating system, Graphical User Interface (GUI) and Command Line Interface (CLI)
  - unsupported/out of support versions
  - missing patches/updates
  - missing/incorrect security settings
- **A2.1.5** mobile devices reliant on Original Equipment Manufacturers (OEMs) to update system software
- **A2.1.6** physical
    - theft of equipment/devices containing sensitive data
    - mobile device
    - data storage device
  - poor/missing security for restricted areas
- **A2.1.7** process of how people use the system
  - leaks, intentional and accidental
  - sharing security details
  - flawed security processes
- **A2.1.8** security implications of cloud computing and of the Internet of Things (IoT) devices
  - Cloud computing
    - missing/incorrect/default security settings
    - third party/cloud provider access
    - reliant on third party security
    - data movement outside of the organisation's network/over the internet, risk of interception/theft/tampering
  - IoT
    - weak/no encryption on IoT devices/transmissions
    - default passwords
    - lack of patches and updates
    - deployment by non-IT staff
    - flawed/insecure control interfaces
    - poor/no compatibility with network security systems
    - eavesdropping/smart devices always listening/sending voice data

**A2.2** Where to find up-to-date sources of information on specific known hardware and
 software vulnerabilities.
- **A2.2.1** manufacturer's website
- **A2.2.2** forum/technical help website for IT professionals/cyber security specialists
- **A2.2.3** third party websites specialising in specific hardware or software

**A2.3** Attack vectors

- **A2.3.1** Wireless
  - Wi-Fi, IEEE 802.11 family of standards
  - Bluetooth
  - Cellular
  - satellite link
  - Infra Red (IR)
  - Near-field communication (NFC)
  - Radio-frequency identification (RFID)
- **A2.3.2** internet connection
  - types
    - copper cable
    - optical fibre
    - Wi-Fi
    - cellular/5G
  - connection devices
    - modem/router-modem, cable and optical fibre
    - wireless router
    - cellular device/5G router
- **A2.3.3** internal network access devices
  - router
  - switch
  - wireless access point

**A2.4** Types and uses of tools and methods to assess the vulnerabilities in computer
 systems
- **A2.4.1** port scanner
- **A2.4.2** network mapper/system discovery
- **A2.4.3** registry checker
- **A2.4.4** website vulnerability scanner
- **A2.4.5** vulnerability detection and management software
- **A2.4.6** assessing user vulnerabilities

**A2.5** Use of independent third-party review of a system and network designs before
 implementation
- **A2.5.1** establishing due diligence
- **A2.5.2** third party certification

**A2.6** Applications and features of penetration testing for common threats, those in the
 Open Web Application Security Project (OWASP) top 10.
- **A2.6.1** uses range of techniques to find weak spots
- **A2.6.2** checks against lists of known vulnerabilities
- **A2.6.3** produce reports, in appropriate formats

**A2.7** Passive risk management measures:

- **A2.7.1** risk transfer to a third party (commissioning a service provider)
- **A2.7.2** risk avoidance by stopping an activity
- **A2.7.3** risk acceptance

### A3 Legal responsibilities Students should know the responsibilities in relation to current legal legislation.

**A3.1** Current legislation

- **A3.1.1** General Data Protection Regulation (GDPR) (requirements for protection of data, privacy rights)
- **A3.1.2** Computer Misuse Act 1990 (protects personal data held by organisations from unauthorised access and modification).

**A3.2** Areas the legislation applies to

- **A3.2.1** protection of data, in storage and when transferred
- **A3.2.2** privacy, personally identifying information (PII)
- **A3.2.3** unauthorised access to computers/devices
- **A3.2.4** unauthorised access to and modification of data

**A3.3** Legal responsibilities legislation

- **A3.3.1** General Data Protection Regulation (GDPR)
  - principles
    - lawfulness
    - fairness and transparency
    - limited to stated purpose(es)
    - accuracy
    - keep minimum amount of data
    - store for minimum amount of time
    - maintain confidentiality and integrity
  - legal reasons for data processing
    - consent
    - contractual obligation
    - legitimate interest
    - vital interest
    - legal requirement
    - public interest
  - personal rights, people have the right to:
    - access their own personal data
    - be informed about how and why their data is used
    - have their data corrected, removed or restricted
    - object to the data being used
    - portability (have data supplied in a machine readable format)
    - not to be subject to a decision based solely on automated processing.
  - Computer Misuse Act
    - responsibilities of organisations - exercise due care to comply with its security obligations under GDPR

### A4 Software and hardware security measures Students should apply their knowledge and understanding of the use and effectiveness of security measures for software and hardware, use of encryption and precautions to protect wireless local area network (WLAN)

**A4.1** Software and hardware

- **A4.1.1** physical security measures
  - site security locks
    - mechanical
    - electronic
    - network connected
  - card entry
    - Near-field Communication (NFC)
    - Radio-frequency Identification (RFID)
    - barcode, QR code
    - magnetic stripe
    - embedded microprocessor/chip
  - biometrics
    - fingerprint
    - iris/retina/eye pattern
    - facial recognition
    - voice recognition
    - handwriting/signature/pattern, etc. • on touchscreen/pad
  - Closed-Circuit Television (CCTV)
  - security staff
  - alarms – on buildings/restricted areas and on devices
  - protected cabling and cabinets
  - staff training
- **A4.1.2** data storage, data protection and backup, and recovery procedures
  - backup types
    - full
    - differential
    - incremental
  - backup strategies
    - onsite, offsite, cloud
    - automated, manual
    - hot site, warm site
  - redundant array of independent disks (RAID) vs backup
  - archiving vs backup
  - data resilience
  - recovery types
    - file/data restore
    - image restore of; disc, device, system
    - full/bare-metal restore
- **A4.1.3** antivirus software and detection techniques
  - virus signatures, scanning
  - heuristics techniques used to identify potentially suspicious file content or behaviour
  - file integrity check, checksum
  - techniques for dealing with identified threats
    - warning
    - logging
    - prevent execution
    - quarantine
    - deletion
- **A4.1.4** software and hardware firewalls and the filtering techniques they use
  - packet filtering and inspection
  - application layer awareness
  - inbound and outbound rules
  - network address
- **A4.1.5** user authentication
  - user login procedures
  - strong password, password policy compliance
  - biometric authentication
  - single factor and multi-factor authentication (MFA)
    - knowledge/things you know
    - possession/things you have
    - inherence/things you are
    - location factors such as IP address, MAC address, global positioning system (GPS) location
    - behaviour factors such as how a signature/pattern is made, how a keyboard is used
  - security tokens
    - connected such as a Universal Serial Bus (USB) key, or smartcard plus reader
    - contactless such as a Bluetooth enabled dongle
    - disconnected, a device that generates a code independently such as:
      - a smartphone with a security app
      - a dedicated device issued by a bank or credit card company
  - Kerberos network authentication for Windows® and Linux®-based operating systems
  - basic key exchange process
    - client request
    - server response
    - authentication of server response
    - key exchange
  - certificate-based authentication
    - Transport Layer Security (TLS)
    - Secure Sockets Layer (SSL)
    - client/device certificate
    - Public Key Infrastructure (PKI)
    - Certificate Authority (CA)
    - self-signed certificate
- **A4.1.6** access controls and the methods to restrict users' access to resources
  - Discretionary Access Control (DAC), users have control of their own files and resources
  - Role-Based Access Control (RBAC), administrator sets rules groups of users based on their role in an organisation
  - Rule-Based Access Control (RBAC), administrator sets rules for individual users
  - resources
    - applications
    - folders
    - files
    - data sets
    - physical resources/devices
- **A4.1.7** trusted computing
  - benefits, increased security
  - drawbacks, loss of user control/privacy/anonymity
- **A4.1.8** Finding lost or stolen devices
  - device location technology
    - Global Positioning System (GPS)
    - phone home on connection
    - device tracking and location reporting software
- **A4.1.9** Device based security
  - timed lockout of desktop/screen
  - desktop/screen lock after failed login attempts
  - memory wipe/factory reset after failed login attempts
  - remote access for lock/wipe/reset of lost/stolen device

**A4.2** Use of encryption

- **A4.2.1** storage encryption
  - safe password storage
  - Digital Rights Management (DRM)
  - file, folder, disc, device encryption
- **A4.2.2** communications encryption
  - symmetric encryption
    - secret key
    - Advanced Encryption Standard (AES)
  - asymmetric encryption
    - public and private keys
    - Rivest–Shamir–Adleman (RSA)
    - Diffie–Hellman key exchange
  - integrated into smart, mobile and built-in/embedded devices
  - The Onion Router (TOR)
  - Virtual Private Networks (VPNs)
  - digital certificates and certificate authorities
  - Hypertext Transfer Protocol Secure (HTTPS)
  - public/private keys
  - End-to-End Encryption (E2EE)
  - secure message apps

**A4.3** Precautions that can be taken to protect a Wireless Local Area Network (WLAN)
 from unauthorised access:
- **A4.3.1** Media Access Control (MAC) address filtering and hiding the Service Set Identifier (SSID)
- **A4.3.2** wireless encryption
  - Wi-Fi Protected Access 2 and 3 (WPA2/3)
  - Wi-Fi Protected Setup
  - known wireless vulnerabilities
    - unsecured access point
    - piggybacking/unauthorised use of unsecured network
    - Evil Twin attack/fake access point
    - wireless sniffing/eavesdropping
  - mitigation methods for attacks on Wi-Fi
    - changing default passwords/settings/names
    - use of block and allow lists for device access
    - use of VPNs
    - use of WPA2/3
    - firewalls

**A4.4** Security issues during network and system design to ensure security is built

- **A4.4.1** expect attacks to happen and plan for them
- **A4.4.2** design the system to run on `fewest privileges'
- **A4.4.3** assume everyone will get access to the system design
- **A4.4.4** avoid reliance on secrecy/obscurity
- **A4.4.5** compliance with information security standards such as ISO 27000

## B: Use of networking architectures and principles for security Students should apply their knowledge and understanding of the security issues of networked systems and how to secure them in organisational contexts. Students should be able to interpret and amend schematic diagrams.

### B1 Network types

**B1.1** Applications and features of networks:

- **B1.1.1** Network types
  - Local Area Network (LAN)
  - Wireless Local Area Network (WLAN)
  - Wide Area Network (WAN)
  - Storage Area Network (SAN)
  - Personal Area Network (PAN)
  - the internet
- **B1.1.2** Private network types
  - intranet
  - extranet
  - cloud network
- **B1.1.3** wired and wireless integration
  - ethernet standards for wired and wireless (802 family)
  - compatibility/interoperability issues such as protocols and access points
  - admin issues such as channels and IP addresses
  - technical issues such as signal strength and interference
- **B1.1.4** schematic diagrams
  - network diagram, logical and physical
  - diagrams showing specific items such as port numbers or network addresses
- **B1.1.5** Features/requirements of networks (cyber security related)
  - scalability
  - software and hardware sharing/compatibility
  - data and file sharing/transfer
  - performance/response time
  - backup management
  - security settings
  - reliability
  - fault tolerance
  - communications

**B1.2** Applications and features of network topologies:

- **B1.2.1** physical topologies
  - star
  - extended star
  - hierarchical
  - wireless mesh
  - ad-hoc (mix of wired and wireless for Bring Your Own Device (BYOD))
- **B1.2.2** logical topologies
  - logical bus
  - logical ring

**B1.3** network architecture

- **B1.3.1** peer-to-peer
- **B1.3.2** client/server
- **B1.3.3** thin client

**B1.4** modern trends – applications and security issues of:

- **B1.4.1** virtualisation
  - segmentation
  - isolation/sandboxing/containerisation
  - reduced attack surface
- **B1.4.2** cloud computing
  - configuration issues, default access settings
  - reliance on service provider, data leaks/loss/theft
  - Application Programming Interfaces (API), vulnerabilities in interface to cloud services/storage
  - account hijacking
- **B1.4.3** BYOD
  - issues with organisational data on a private device
    - password policy
    - owner's/organisation's privacy
    - data security, on device and when transferred
    - patches, maintenance, updates, compatibility
    - organisational v personal applications
    - erasing/wiping data after use/when no longer required
    - tracing/auditing data use/movement
  - Software-Defined Networking (SDN)
    - segmentation
    - remote management
    - automation
    - scalability
    - reduced hardware requirements
  - Storage Area Network (SAN)
    - redundancy
    - scalability
    - access controls
    - encryption/digital certificates
  - Internet of Things (IoT)
    - Application Program Interface (API) security issues
    - default passwords/security settings
    - lack of patches/updates
    - Zigbee, Bluetooth 5 and similar low-power wireless technology
      - mesh capability
      - ease of interception/interference
      - range issues
    - botnets
    - spying via networked cameras/smart hubs/TVs
    - exposure of non-traditional networked devices such as medical equipment, home appliances, commercial machinery, and vehicles
  - remote working
    - devices seen/used by others such as family members, visitors
    - need for VPN/encrypted link
    - security of home network/Wi-Fi
    - weaknesses of/reliance on third party communication systems such as video calls
    - issues around data storage/transfer/use of the cloud

### B2 Network components

**B2.1** Application and features of hardware components:

- **B2.1.1** end-user devices, with connectivity and processing
  - mobile devices
    - mobile phone/smartphone
    - laptop/netbook/notebook
    - tablet
    - handheld game console and other entertainment devices
    - smartwatches and fitness trackers
    - digital cameras
    - virtual reality and augmented reality sets
  - fixed, networked devices with processing and/or storage
    - server
    - Personal Computer (PC)/workstation
    - printer
    - scanner
    - Network Attached Storage (NAS)
    - multi-functional devices (any combination of devices in B2.1.1)
- **B2.1.2** connectivity devices
  - switch, managed and unmanaged
  - router, wired and wireless
  - gateway
  - bridge
  - repeater
  - access point
  - USB hub, active and passive
  - modem
    - Digital Subscriber Line (DSL)/copper cable
    - optical fibre modem
    - wireless modem
  - multi-functional devices (any combination of devices in B2.1.2)
- **B2.1.3** connection media
  - cable
    - Ethernet
    - universal serial bus (USB), current types and legacy requirements
  - Wireless
    - Wi-Fi, IEEE 802.11 family of standards
    - NFC
    - Bluetooth, current types and legacy requirements
    - cellular, 5G
  - optical fibre
  - Li-Fi

**B2.2** Application and security issues of external media and storage

- **B2.2.1** encryption
- **B2.2.2** secure disposal
- **B2.2.3** loss/theft of media
- **B2.2.4** interception/copying
- **B2.2.5** data loss/corruption
- **B2.2.6** media lifespan/failure
- **B2.2.7** malware vector

**B2.3** Application and features of software components

- **B2.3.1** network and device operating systems
  - Graphical User Interface (GUI)
  - Command Line Interface (CLI)
  - web interface, internal web page for device control/configuration
- **B2.3.2** network monitoring, management and troubleshooting tools
  - remote access administration tools
  - performance monitor
  - events and logs viewer
  - vulnerability scanner
  - network analyser/packet sniffer
- **B2.3.3** network applications
  - remote working tools
  - database
  - document management
  - network discovery/mapping tools.

### B3 Networking infrastructure services and resources

**B3.1** Application and function of:

- **B3.1.1** Transmission Control Protocol/Internet Protocol (TCP/IP)
  - four layer model
  - Transport Layer Security (TLS)
  - packets and headers
  - error correction
- **B3.1.2** ports
  - hardware, switch ports
  - software/virtual, Internet Protocol ports
- **B3.1.3** packet
  - header
  - trailer/footer
  - payload/body/content
  - types
    - Transmission Control Protocol (TCP)
    - Internet Protocol (IP)
    - User Datagram Protocol (UDP)
- **B3.1.4** network address translation (NAT)
  - types
    - static
    - dynamic
    - Port Address Translation (PAT)
  - structure and format of IPv4 and IPv6 addressing
  - RFC 1918 private addresses
    - Class A: 10.0. 0.0 to 10.255. 255.255
    - Class B: 172.16. 0.0 to 172.31. 255.255
    - Class C: 192.168. 0.0 to 192.168. 255.255
    - Automatic Private IP Addressing (APIPA) for DHCP failure, 169.254.0.1to 169.254.254.255
    - reserved IP addresses such as 127.0.0.1 loopback address

**B3.2** Application of domains, sub-domains and segmentation

- **B3.2.1** hierarchy
- **B3.2.2** trust relationships
- **B3.3.3** access control
- **B3.3.4** security benefits
  - limits access to devices, data, and applications
  - restricts lateral movement of attack/malware/intruder
  - smaller attack surface
  - simpler damage control

**B3.3** Application of network devices to configure networks

- **B3.3.1** server
- **B3.3.2** router
- **B3.3.3** switch
- **B3.3.4** Wireless Access Point (WAP)
- **B3.3.5** firewall
- **B3.3.6** bridge
- **B3.3.7** gateway

**B3.4** Application and function of network infrastructure services

- **B3.4.1** Domain Name System (DNS)
  - DNS resolution process
  - reverse DNS resolution
  - DNS cache
  - IPv6 DNS
- **B3.4.2** directory services (DS), identity and access management
  - active directory
  - open directory
  - OpenLDAP
- **B3.4.3** authentication services
  - types
    - single-factor
    - two-factor (TFA)
    - multi-factor (MFA)
    - single sign on (SSO)
  - authentication protocols
    - Password Authentication Protocol (PAP), (RFC 1334)
    - Challenge Handshake Authentication Protocol (CHAP), (RFC 1994)
    - Extensible Authentication Protocol (EAP), (RFC 5247)
- **B3.4.4** Dynamic Host Configuration Protocol (DHCP)
  - DHCP servers and clients
  - IP address allocation process
  - basic configuration settings
    - address ranges
    - lease information
    - reservations/static addresses
    - dynamic addresses/allocation
    - automatic addresses/allocation
    - server address
- **B3.4.5** routing
  - static
  - dynamic/adaptive
  - routing tables
  - Interior Gateway Protocols (IGPs), within one network/organisation
  - Exterior Gateway Protocols (EGPs), between networks
  - Border Gateway Protocol (BGP), internet routing
- **B3.4.6** remote access services
  - by dial-up, using telecommunications services
  - by VPN, over the internet
  - handshake/connection processes, client-host/server
  - uses/gives access to
    - devices
    - files
    - data
    - desktops
    - applications

**B3.5** Application and function of network services and resources

- **B3.5.1** file and print services
  - file server, networked file storage
  - print server, networked printer
  - file management, tracking, sharing
  - print management, sharing, queueing, prioritising
  - printer configuration and driver management
- **B3.5.2** web, mail and communications services
  - web services
    - use HTTP or HTTPS protocols
    - use XML messaging system
    - are independent of operating system or programming language
    - allow applications to communicate
    - allow sharing of data, functionality
  - mail services
    - use Simple Mail Transfer Protocol (SMTP), Post Office Protocol (POP), and Multipurpose Internet Mail Extensions (MIME)
    - protocols lack built-in encryption
    - mail server and client
    - process of finding destination server for mail delivery
    - communications services
    - email
    - Voice over IP (VoIP)/Internet Calling
    - SMS/text Messaging
    - video conferencing
    - social networking applications
    - online collaboration tools
    - Communication as a Service (CaaS)

## C: Cyber security documentation Students should know and understand the governance policies and documents needed to establish and maintain security on an ongoing basis.

### C1 Internal policies General IT policies

**C1.1** Use of general security-related IT policies and their effectiveness

- **C1.1.1** a cyber security policy that uses the Plan-Do-Check-Act loop derived from part of the International Organization for Standardization (ISO) 27001:2013
  - policies on internet and email use
    - inappropriate, offensive, illegal material
    - sending confidential information
    - privacy issues
    - upload/download of copyrighted material, music, video
    - download of executable files
    - visiting potentially dangerous websites
    - organisations rights and obligations to scan traffic, monitor activities, retain copies of emails, etc.
  - security and password procedures
    - length/strength policy
    - management and enforcement tools
    - deny lists of common/weak passwords
    - monitoring/logging of password attempts
    - lockout policy for inactivity, login attempts
    - use of technology to reduce requirement for passwords
  - staff responsibilities
    - complete required security training
    - follow security procedures and report problems
    - respond to/report suspicious activity
    - maintain security in own workspace/behaviour
  - staff IT security training
    - leadership/management to ensure training is staffed/funded/resourced
    - flexibility of training program so everyone can take part
    - range of training resources/learning styles
    - progress tracking
    - incentives rather than punishment
    - ongoing training for reinforcement and for new threats
- **C1.1.2** security audits and their application to check compliance against policies
  - audit goals and scope
  - identify problems/gaps/weaknesses
  - check against internal policies
  - check against external regulations/laws
  - reporting of results, required improvements/changes
- **C1.1.3** backup policy
  - selection of data
  - backup methods
  - backup type
  - frequency/scheduling
  - storage strategy
  - responsibility, accountability
  - backup testing strategy
  - legal/regulatory compliance
  - emergency/recovery procedures
- **C1.1.4** data protection policy to ensure organisational compliance
  - Data Protection Officer
  - follow data protection principles
  - protecting rights/privacy
  - staff training
  - system security procedures
  - application of policy to external contractors/consultants/vendors etc.
  - responsibility and accountability of staff/organisation
- **C1.1.5** cyber security incident response policy
  - contacts
    - incident response team leader/provider
    - IT team leader/provider
    - senior management
    - legal
    - public relations
    - human resources
    - insurance
  - procedures/flowcharts/checklists for
    - initial decisions/triage/escalation
    - main response, analysis, containment, mitigation, recovery
    - reviewing, reporting, closing the incident
  - communications
    - contact telephone plus alternative/backup
    - conference call facility
- **C1.1.6** disaster recovery policy
  - purpose and scope
  - triage, a list of possible events, their severity and appropriate response
    - activate cyber security incident response
    - activate business continuity plan
    - activate disaster recovery plan
  - roles, responsibilities
  - contact lists
  - monitoring and reporting requirements
- **C1.1.7** external services policy
  - general for external services policies
    - authorization and access control
    - management, responsibility, accountability
    - contact details
    - regulatory compliance
    - incident response procedures
  - cloud
    - cloud resources requiring protection
    - acceptable use
    - data protection
  - hardware
    - sources, vendors, contractors, other third parties
    - service agreements
    - maintenance and support
  - software
    - sources, vendors, contractors, other third parties
    - service agreements
    - licencing
    - software support
  - support
    - service time/availability
    - response time – report to support starting
    - troubleshooting/completion/solution time, time to fix the problem
    - escalation procedures

## D: Forensic procedures

### D1 Forensic collection of evidence Students should apply their knowledge and understanding of the methods for collecting forensic evidence following a security incident

**D1.1** Forensics on devices – servers, PCs and mobile devices

- **D1.1.1** meeting requirements for forensics
  - confiscation of devices
    - prior planning for a range of devices/scenarios
    - passwords, codes, PINs, etc.
    - chargers, cables etc. for mobile devices
    - retain current power state/status if possible
    - isolation of device from network/communications (if device is suspected to be communicating)
      - photograph screen
      - turn off device
      - remove battery/power cable
      - use airplane mode
      - disable wireless communication
      - use Faraday bag/cage
    - appropriate packaging
    - document chain of custody
    - establish legal permissions
  - taking an image of the system
  - using a forensic analysis tool
  - reviewing files and settings
  - reviewing system logs
  - reviewing user activity
  - malware analysis and alerts
- **D1.1.2** the challenges of live forensics
  - changing data in situ
  - recovering corrupted data and preventing data corruption
  - capturing data in active memory
  - capturing remote data
  - not losing temporary files
- **D1.1.3** network forensics
  - agreeing a network-testing forensics methodology with supervisory and investigatory authorities
  - scanning of local infrastructure
    - ensuring permission is granted
    - ensuring that testing protocol will not disrupt a live system
    - passive and active analysis tools
  - reviewing and analysing firewalls and infrastructure devices
    - switch
    - router
    - Wireless Access Point (WAP)
    - client or server logs
  - analysing malware activity and alerts
- **D1.1.4** Documenting the scene
  - prior planning for a range of scenarios
  - securing the scene
  - plans, photos, diagrams of the scene
  - contemporaneous notes
  - witness statements

### D2 Systematic forensic analysis of a suspect system Students should apply their knowledge and understanding of the requirements and processes for forensic analysis

**D2.1** Requirements for maintaining an accurate record, made at the time, or as soon
 after the incident as possible
- **D2.1.1** Retaining snapshots of the system
  - originals/clean system for comparison
  - generate hash function/checksum for copies/images
  - whole disk/machine, with/without `boot' facility
  - files/folders directories/data structures
  - memory, RAM, BIOS, memory cards/SIM
  - virtual discs/machines
  - process/sub-process output/activity
  - network information such as open ports, IP addresses, user logins
  - temporary files, deleted data
  - system generated data such as System Volume Information, hibernation files, shadow copies, crash dumps, page files, synchronisation files
- **D2.1.2** Requirements for the recording of all findings and considering how reliable the evidence is
  - no collection/action that could change data on a digital device
  - collection by competent person
  - creation of trail or record of all actions taken, chain of custody
  - documentation of who is responsible for collection/decisions/enforcement of standards
- **D2.1.3** Requirements for the recording of any alterations that have been intentionally and unintentionally imposed by the investigator
  - documentation of all actions from initial seizure
  - potential inadmissibility of altered data
  - working with copies/images rather than original data/device
- **D2.1.4** Requirements for the creation of visual evidence of findings
  - photos, videos
  - screenshots
  - data-time stamps. metadata
- **D2.1.5** Ensuring the evidence is relevant and not a false positive
  - defining file signatures, search criteria, etc.
  - known/estimated error rates of tools/target data types
  - feedback of false positive data to improve detection method/algorithm
  - alert fatigue for high false positive rates
  - manual review of all positives to filter obvious false ones
  - further investigation/check of filtered positives

**D2.2** Assessing the findings to determine whether or not they:

- **D2.2.1** provide evidence of a crime and/or an incident
  - criminal
  - regulatory breach
  - civil liability, contractual breach
  - non-compliance with internal policy
  - cyber attack
  - negligence, mismanagement, etc.
- **D2.2.2** show that the system has been externally and/or internally compromised
  - unusual traffic
    - inbound
    - outbound
    - from unusual geographical regions
    - DoS/DDoS signs
  - unusual login attempts
  - unusual DNS requests
  - increase in file/data reads
  - increase in file/data requests
  - unusual port usage
  - suspicious changes to files/data
  - suspicious access to/changes to system files/data

**D2.3** Writing security reports on

- **D2.3.1** actions to prevent security incidents from reoccurring in the future
  - general report structure
    - title
    - contents
    - introduction
    - headings and sub-headings
    - consistent use of bullets and numbering
    - conclusions
    - footnotes
    - citations
  - analysis of the incident to identify
    - errors/omissions in procedures
    - unforeseen problems
    - errors/omissions in preventative measures
    - errors/ delays in detection/alerting
    - remedial actions
- **D2.3.2** improvements to the content of IT policies
- **D2.3.3** improvements to security protection measures
  - physical
  - software
  - hardware
  - processes and procedures
  - training
