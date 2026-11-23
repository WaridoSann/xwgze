const resources = {
  ptes: { name: "PTES", url: "https://pentest-standard.readthedocs.io/en/latest/" },
  nmap: { name: "Documentation Nmap", url: "https://nmap.org/book/man.html" },
  whatweb: { name: "WhatWeb", url: "https://github.com/urbanadventurer/WhatWeb" },
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
    references: ["nmap", "whatweb"],
    groups: [
      {
        name: "Scans TCP et UDP",
        commands: [
          { id: "scan-standard", title: "Scan standard sur les 1 000 ports TCP courants", code: "nmap 127.0.0.1" },
          { id: "tcp-complet", title: "Vérifier tous les ports TCP locaux", code: "nmap -p- 127.0.0.1" },
          { id: "ports-nmap", title: "Vérifier uniquement les ports sélectionnés", code: "nmap -p 22,80,443 127.0.0.1" },
          { id: "raison-nmap", title: "Afficher la raison de l’état de chaque port", code: "nmap -vv --reason 127.0.0.1" },
          { id: "top-tcp", title: "Vérifier les 20 ports TCP les plus courants", code: "nmap --top-ports 20 127.0.0.1" },
          { id: "top-udp", title: "Vérifier les 20 ports UDP les plus courants", code: "sudo nmap -sU --top-ports 20 127.0.0.1" },
        ],
      },
      {
        name: "Réseau local",
        commands: [
          { id: "adresse-vpn", title: "Afficher l’IPv4 de l’interface VPN", code: "ip -4 addr show tun0" },
        ],
      },
      {
        name: "HTTP",
        commands: [
          { id: "reponse-http", title: "Afficher la réponse et les en-têtes", code: "curl -i http://127.0.0.1:1337/" },
          { id: "http-detaille", title: "Afficher le détail de la requête", code: "curl -v http://127.0.0.1:1337/" },
          { id: "entetes-web-locaux", title: "Lire uniquement les en-têtes", code: "curl -I http://127.0.0.1:1337/" },
          { id: "telecharger-http", title: "Enregistrer un fichier depuis le serveur local", code: "curl -fS -o ./fichier http://127.0.0.1:1337/fichier" },
          { id: "serveur-http-local", title: "Servir le dossier public sur la boucle locale", code: "python3 -m http.server 1337 --bind 127.0.0.1 --directory ./public" },
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
    keywords: "Linux inventaire permissions impact",
    references: ["ptes"],
    groups: [
      {
        name: "Comptes et fichiers",
        commands: [
          { id: "identite-linux", title: "Vérifier l’identité et les groupes", code: "whoami\nid" },
          { id: "comptes-linux", title: "Lister les comptes connus du système", code: "getent passwd" },
          { id: "repertoire-actuel", title: "Afficher le répertoire actuel", code: "pwd" },
          { id: "fichiers-caches", title: "Lister aussi les fichiers cachés", code: "ls -la" },
          { id: "type-fichier", title: "Identifier le type d’un fichier", code: "file ./preuve.txt" },
        ],
      },
      {
        name: "Permissions",
        commands: [
          { id: "permissions-dossier", title: "Lire les permissions d’un dossier", code: "ls -ld ./" },
          { id: "chemin-linux", title: "Lire les permissions sur tout le chemin", code: "namei -l ./preuve.txt" },
        ],
      },
      {
        name: "Services",
        commands: [
          { id: "services-actifs", title: "Lister les services actifs", code: "systemctl list-units --type=service --state=running" },
          { id: "configuration-service", title: "Lire la configuration d’un service systemd", code: "systemctl cat NOM_SERVICE", hint: "Remplace NOM_SERVICE par le nom de l’unité." },
          { id: "configuration-nginx", title: "Lire les configurations Nginx activées", code: "cat /etc/nginx/sites-enabled/*" },
        ],
      },
      {
        name: "Tâches planifiées",
        commands: [
          { id: "cron-systeme", title: "Lire le crontab système", code: "cat /etc/crontab" },
          { id: "cron-supplementaire", title: "Lister les fichiers cron supplémentaires", code: "ls -la /etc/cron.d/" },
          { id: "taches-systemd", title: "Lister les timers systemd", code: "systemctl list-timers --all" },
        ],
      },
      {
        name: "Clés SSH locales",
        commands: [
          { id: "paire-ed25519", title: "Générer une paire Ed25519", code: 'ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_audit"' },
          { id: "cle-publique", title: "Afficher la clé publique", code: 'cat "$HOME/.ssh/id_ed25519_audit.pub"' },
          { id: "permissions-cle", title: "Limiter l’accès à la clé privée", code: 'chmod 600 "$HOME/.ssh/id_ed25519_audit"' },
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
