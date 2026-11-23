const resources = {
  ptes: { name: "PTES", url: "https://pentest-standard.readthedocs.io/en/latest/" },
  nmap: { name: "Documentation Nmap", url: "https://nmap.org/book/man.html" },
  whatweb: { name: "WhatWeb", url: "https://github.com/urbanadventurer/WhatWeb" },
  microsoft: { name: "Microsoft Learn", url: "https://learn.microsoft.com/fr-fr/powershell/module/nettcpip/get-nettcpconnection" },
  stride: { name: "OWASP Threat Modeling", url: "https://community.owasp.org/Threat_Modeling", keywords: "STRIDE flux frontières de confiance" },
  cve: { name: "CVE Program", url: "https://www.cve.org/" },
  pwstorage: { name: "OWASP Password Storage", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html", keywords: "hachage Argon2id scrypt bcrypt PBKDF2" },
  hashcat: { name: "Hashcat", url: "https://hashcat.net/hashcat/", keywords: "hash hachage mots de passe" },
  xss: { name: "OWASP XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
  cvss: { name: "FIRST CVSS", url: "https://www.first.org/cvss/v4.0/specification-document" },
};

const phases = [
  {
    id: "reconnaissance",
    title: "Reconnaissance",
    tileTitle: "Reconnais\u00adsance",
    references: ["nmap", "whatweb", "microsoft"],
    groups: [
      {
        name: "DNS",
        commands: [
          { id: "adresses-dns", title: "Relever les adresses IPv4 et IPv6", code: "dig +short example.org A\ndig +short example.org AAAA" },
        ],
      },
      {
        name: "Ports et services locaux",
        commands: [
          { id: "ports-nmap", title: "Nmap — vérifier trois ports sur la boucle locale", code: "nmap -sT -p 80,443,8000 127.0.0.1" },
          { id: "interfaces-nmap", title: "Nmap — afficher les interfaces et les routes", code: "nmap --iflist" },
          { id: "ports-linux", title: "Ports à l’écoute sous Linux", code: "ss -lntp" },
          { id: "ports-windows", title: "Ports et PID sous Windows", code: "Get-NetTCPConnection -State Listen |\n  Sort-Object LocalPort |\n  Select-Object LocalAddress, LocalPort, OwningProcess" },
          { id: "service-windows", title: "Relier un PID à un service Windows", code: "$servicePid = 1234\nGet-CimInstance Win32_Service |\n  Where-Object ProcessId -eq $servicePid |\n  Select-Object Name, DisplayName, StartName", hint: "Remplace 1234 par le PID relevé." },
        ],
      },
      {
        name: "Empreinte web",
        commands: [
          { id: "whatweb-local", title: "WhatWeb — identifier les technologies du site local", code: "whatweb http://127.0.0.1:8000/" },
          { id: "entetes-web-locaux", title: "curl — lire les en-têtes du site local", code: "curl -sSI http://127.0.0.1:8000/" },
        ],
      },
    ],
  },
  {
    id: "modelisation",
    title: "Modélisation des menaces",
    tileTitle: "Modélisa\u00adtion des menaces",
    references: ["stride", "ptes"],
    groups: [
      {
        name: "Projet et dépendances",
        commands: [
          { id: "inventaire-repo", title: "Lister les fichiers versionnés", code: "git ls-files" },
          { id: "dependances-node", title: "Lire les dépendances déclarées", code: "npm pkg get dependencies devDependencies" },
        ],
      },
      {
        name: "Services",
        commands: [
          { id: "ports-modele", title: "Lister les services actifs avec systemd", code: "systemctl list-units --type=service --state=running --no-pager" },
        ],
      },
    ],
  },
  {
    id: "vulnerabilites",
    title: "Analyse des vulnérabilités",
    tileTitle: "Analyse des vulnéra\u00adbilités",
    references: ["cve", "pwstorage", "hashcat", "xss"],
    groups: [
      {
        name: "Dépendances",
        commands: [
          { id: "audit-npm", title: "Consulter les avis npm", code: "npm audit --omit=dev", hint: "Depuis ton projet. npm interroge le registre configuré." },
        ],
      },
      {
        name: "Web",
        commands: [
          { id: "en-tetes-http", title: "Inspecter les en-têtes HTTPS", code: "curl --silent --show-error --head https://example.org/" },
        ],
      },
      {
        name: "Permissions",
        commands: [
          { id: "droits-fichier", title: "Lire le mode, le propriétaire et le groupe d’un fichier", code: "stat -c '%A %U:%G %n' ./configuration.ini" },
        ],
      },
    ],
  },
  {
    id: "exploitation",
    title: "Exploitation",
    references: ["xss", "ptes"],
    groups: [
      {
        name: "Validation des contrôles",
        commands: [
          { id: "tests-locaux", title: "Relancer les tests Python existants", code: "python -m unittest discover -v" },
        ],
      },
      {
        name: "Résultats",
        commands: [
          { id: "comparer-resultats", title: "Comparer le résultat prévu au résultat observé", code: "diff -u attendu.txt observe.txt" },
          { id: "version-testee", title: "Relever la révision testée", code: "git rev-parse HEAD\ngit status --short" },
        ],
      },
    ],
  },
  {
    id: "post-exploitation",
    title: "Post-exploitation",
    keywords: "privesc élévation de privilèges impact",
    references: ["ptes"],
    groups: [
      {
        name: "Identité et permissions",
        commands: [
          { id: "identite-linux", title: "Confirmer l’identité Linux", code: "whoami\nid\ngroups" },
          { id: "chemin-linux", title: "Lire les droits le long d’un chemin", code: "namei -l ./preuve.txt" },
        ],
      },
      {
        name: "Journaux",
        commands: [
          { id: "journaux-linux", title: "Relire les avertissements du jour", code: "journalctl --since today --priority warning --no-pager" },
        ],
      },
    ],
  },
  {
    id: "rapport",
    title: "Rapport",
    references: ["cvss", "ptes"],
    groups: [
      {
        name: "Preuves",
        commands: [
          { id: "horodatage-utc", title: "Horodater un relevé en UTC", code: "date -u +'%Y-%m-%dT%H:%M:%SZ'" },
          { id: "empreinte-preuve", title: "Calculer et vérifier une empreinte", code: "sha256sum preuve.txt > preuve.txt.sha256\nsha256sum -c preuve.txt.sha256" },
        ],
      },
      {
        name: "Rédaction",
        commands: [
          { id: "modele-constat", title: "Modèle de constat", code: "Titre du constat\nActif et version\nStatut et sévérité\nObservation\nPreuve expurgée et horodatage UTC\nImpact et portée\nCorrection proposée\nCritère de validation" },
          { id: "relire-publication", title: "Relire les fichiers préparés pour le commit", code: "git diff --cached --name-only\ngit diff --cached" },
        ],
      },
    ],
  },
];
