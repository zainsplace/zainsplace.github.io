# Unit 2: Cyber Security and Incident Management — Revision Site

BTEC National in Information Technology (Extended Certificate), Pearson — Spec Issue 5 (Nov 2025).
Exam: Section A only, scenario-based, **90 marks**, 2h15. Command words: **State / Explain / Describe / Evaluate**.

## Spec coverage map (Learning Aims A–D)

- **A — Cyber Security Threats & Protection** (largest, Tier 1)
  - A1 threats (internal, external/malware, social engineering, impacts, threat landscape)
  - A2 vulnerabilities + assessment tools, pen testing, passive risk management
  - A3 legal responsibilities (GDPR, Computer Misuse Act)
  - A4 software/hardware security measures, encryption, WLAN protection, secure design
- **B — Networking Architectures & Security** (Tier 1)
  - B1 network types, topologies, architecture, modern trends (cloud/BYOD/IoT)
  - B2 components (hardware, media, software)
  - B3 infrastructure services (TCP/IP, NAT, DNS, DHCP, VPN, segmentation)
- **C — Cyber Security Documentation** (Tier 2)
  - C1 internal policies (password, backup, data protection, incident response, disaster recovery)
- **D — Forensic Procedures** (Tier 1)
  - D1 collection of evidence (confiscation, imaging, chain of custody, network forensics)
  - D2 systematic analysis (snapshots, reliability, signs of compromise, reports)

## Exam question patterns (from the sample paper)
- **1 mark** — State (one point)
- **2 marks** — Explain (a point + a linked expansion) or State two
- **3–4 marks** — Describe (e.g. how an attack works + a countermeasure)
- **9 marks** — Evaluate (levels-based: Level 3 needs BOTH sides + a supported conclusion)

## Editing the site
1. Content lives in `data/*.json` (a–d, flashcards, questions, extended).
2. After editing JSON, run `python build_inline.py` to regenerate `data_inline.js`.
3. Set your exam date in `app.js` (the `EXAM_DATE` constant near the top).
4. Open `index.html` in a browser. Progress is saved in your browser (localStorage, key `u2rev_state`).
