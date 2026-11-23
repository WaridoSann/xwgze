const resources = {
  ptes: { name: "PTES", url: "https://pentest-standard.readthedocs.io/en/latest/" },
  nmap: { name: "Nmap Documentation", url: "https://nmap.org/book/man.html" },
  whatweb: { name: "WhatWeb", url: "https://github.com/urbanadventurer/WhatWeb" },
  burp: { name: "Burp Suite HTTP History", url: "https://portswigger.net/burp/documentation/desktop/tools/proxy/http-history" },
  samba: { name: "Samba testparm", url: "https://manpages.debian.org/stable/samba-common-bin/testparm.1.en.html", keywords: "SMB configuration" },
  stride: { name: "OWASP Threat Modeling", url: "https://community.owasp.org/Threat_Modeling", keywords: "STRIDE flows trust boundaries" },
  cve: { name: "CVE Program", url: "https://www.cve.org/" },
  pwstorage: { name: "OWASP Password Storage", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html", keywords: "hashing Argon2id scrypt bcrypt PBKDF2" },
  hashcat: { name: "Hashcat", url: "https://hashcat.net/hashcat/", keywords: "hash hashing passwords" },
  xss: { name: "OWASP XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
  cvss: { name: "FIRST CVSS", url: "https://www.first.org/cvss/v4.0/specification-document" },
};

const phases = [
  {
    id: "reconnaissance",
    title: "Reconnaissance",
    tileTitle: "Reconnais\u00adsance",
    references: ["nmap", "whatweb", "burp", "cve", "samba"],
    groups: [
      {
        id: "workflow",
        name: "Workflow",
        note: "Use this workflow on systems you administer or in authorized labs such as Hack The Box.",
        summary: "Network inventory → Web reconnaissance → HTTP review → Advisory review → Linux inventory → Permission review → Reporting",
        steps: [
          {
            id: "workflow-network",
            title: "Network reconnaissance with Nmap",
            description: "Inventory open TCP ports. Check common UDP ports when the system uses UDP services.",
            commandIds: ["tcp-complet", "workflow-udp"],
          },
          {
            id: "workflow-web",
            title: "Web reconnaissance with WhatWeb",
            description: "Identify technologies on your local web application and verify the results against your deployment records.",
            commandIds: ["workflow-whatweb"],
          },
          {
            id: "workflow-burp",
            title: "HTTP review with Burp Suite",
            description: "Use Proxy → HTTP history to review routes, methods, parameters, headers, and cookie attributes from your application. Use Repeater to resend an unchanged request and compare the response with the expected result.",
          },
          {
            id: "workflow-advisories",
            title: "Vulnerability and patch review",
            description: "Compare installed versions and configurations with vendor advisories and CVE records. Run existing regression tests after applying a fix.",
          },
          {
            id: "workflow-linux",
            title: "Linux inventory",
            description: "From an authorized Linux session, confirm the active account, OS, files, processes, and local listeners.",
            commandIds: ["workflow-account", "workflow-os", "workflow-files", "workflow-processes", "local-tcp-services"],
          },
          {
            id: "workflow-permissions",
            title: "Permissions and scheduled tasks",
            description: "Review permissions on the files you administer and verify that scheduled tasks match the host’s intended configuration.",
            commandIds: ["workflow-file-access", "workflow-schedules"],
          },
          {
            id: "workflow-report",
            title: "Validation and documentation",
            description: "Record the account and permissions observed, redacted evidence, root causes, and fixes. Note failed checks and how you resolved them.",
            commandIds: ["save-local-scan"],
          },
        ],
        commands: [
          {
            id: "tcp-complet",
            title: "Discover open local TCP ports",
            code: "nmap -p- --open <local IP address>",
            flags: [
              ["-p-", "Checks TCP ports 1 through 65,535."],
              ["--open", "Shows open or potentially open ports."],
            ],
          },
          { id: "workflow-udp", title: "Check the 20 most common UDP ports", code: "sudo nmap -sU --top-ports 20 <local IP address>" },
          { id: "workflow-whatweb", title: "Identify web technologies", code: 'whatweb "http://<local host>:<port>/"' },
          { id: "workflow-account", title: "Account and groups", code: "whoami\nid\ngroups" },
          { id: "workflow-os", title: "Kernel and OS release", code: "uname -a\ncat /etc/os-release" },
          { id: "workflow-files", title: "Files and local accounts", code: "ls -la\ncat /etc/passwd" },
          { id: "workflow-processes", title: "Process list and hierarchy", code: "ps auxww\nps -ef --forest" },
          { id: "local-tcp-services", title: "Listening TCP ports and processes", code: "ss -lntp" },
          { id: "workflow-file-access", title: "Permissions on a specific path", code: 'ls -ld "<path>"\nnamei -l "<path>"' },
          { id: "workflow-schedules", title: "Cron and systemd schedules", code: "cat /etc/crontab\nsystemctl list-timers --all" },
          {
            id: "save-local-scan",
            title: "Save selected-port results",
            code: "nmap -p <port list> -oA scan_initial <local IP address>",
            flags: [
              ["-p", "Checks the comma-separated ports found in step 1."],
              ["-oA", "Saves scan_initial.nmap, scan_initial.xml, and scan_initial.gnmap."],
            ],
          },
        ],
      },
      {
        name: "Local TCP and UDP scans",
        note: "The -T4 timing template uses faster timings. The --min-rate option requests a minimum send rate in packets per second.",
        commands: [
          { id: "scan-standard", title: "Scan the 1,000 most common TCP ports", code: "nmap <local IP address>" },
          { id: "ports-nmap", title: "Check selected ports", code: "nmap -p <port list> <local IP address>", hint: "Enter a comma-separated port list." },
          { id: "raison-nmap", title: "Explain the states of TCP ports 22 and 80", code: "nmap --reason -p22,80 <local IP address>" },
          { id: "top-tcp", title: "Check the 20 most common TCP ports", code: "nmap --top-ports 20 <local IP address>" },
          { id: "top-udp", title: "Check the 20 most common UDP ports", code: "sudo nmap -sU --top-ports 20 <local IP address>" },
        ],
      },
      {
        name: "Local system and network",
        commands: [
          { id: "adresse-vpn", title: "Show the VPN interface’s IPv4 address", code: "ip -4 addr show <VPN interface>" },
          { id: "linux-release", title: "Read the installed Linux release", code: "cat /etc/os-release" },
        ],
      },
      {
        name: "HTTP",
        commands: [
          { id: "local-web-ports", title: "Check local TCP ports 80, 8080, and 8000", code: "nmap -p80,8080,8000 <local IP address>" },
          { id: "whatweb-local", title: "Identify technologies on your local site", code: 'whatweb "http://<local host>:<port>/"' },
          { id: "reponse-http", title: "Show the response and headers", code: 'curl -i "http://<local host>:<port>/"' },
          { id: "http-detaille", title: "Show request details", code: 'curl -v "http://<local host>:<port>/"' },
          { id: "entetes-web-locaux", title: "Show only the headers", code: 'curl -I "http://<local host>:<port>/"' },
          { id: "telecharger-http", title: "Save a file from the local server", code: 'curl -fS -o "<output file>" "http://<local host>:<port>/<remote path>"' },
          { id: "serveur-http-local", title: "Serve a directory on the loopback interface", code: 'python3 -m http.server <port> --bind <loopback IP address> --directory "<directory path>"' },
        ],
      },
      {
        name: "SMB",
        commands: [
          { id: "local-samba-config", title: "Validate the local Samba configuration", code: "testparm -s", hint: "Run on your Samba host to validate and print its effective configuration." },
        ],
      },
    ],
  },
  {
    id: "modelisation",
    title: "Threat Modeling",
    references: ["stride", "ptes"],
    groups: [
      {
        name: "Project and dependencies",
        commands: [
          { id: "inventaire-repo", title: "List tracked files", code: "git ls-files" },
          { id: "dependances-node", title: "Read declared dependencies", code: "npm pkg get dependencies devDependencies" },
        ],
      },
      {
        name: "Services",
        commands: [
          { id: "ports-modele", title: "List running systemd services", code: "systemctl list-units --type=service --state=running --no-pager" },
        ],
      },
    ],
  },
  {
    id: "vulnerabilites",
    title: "Vulnerability Analysis",
    tileTitle: "Vulnera\u00adbility Analysis",
    references: ["cve", "pwstorage", "hashcat", "xss"],
    groups: [
      {
        name: "Dependencies",
        commands: [
          { id: "audit-npm", title: "Check npm security advisories", code: "npm audit --omit=dev", hint: "Run in your project directory. npm queries the configured registry." },
        ],
      },
      {
        name: "Web",
        commands: [
          { id: "en-tetes-http", title: "Inspect HTTPS response headers", code: 'curl --silent --show-error --head "<HTTPS URL>"' },
        ],
      },
      {
        name: "Permissions",
        commands: [
          { id: "droits-fichier", title: "Read a file’s mode, owner, and group", code: `stat -c '%A %U:%G %n' "<file path>"` },
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
        name: "Control validation",
        commands: [
          { id: "tests-locaux", title: "Rerun existing Python tests", code: "python -m unittest discover -v" },
        ],
      },
      {
        name: "Results",
        commands: [
          { id: "comparer-resultats", title: "Compare expected and observed results", code: 'diff -u "<expected file>" "<observed file>"' },
          { id: "version-testee", title: "Record the tested revision", code: "git rev-parse HEAD\ngit status --short" },
        ],
      },
    ],
  },
  {
    id: "post-exploitation",
    title: "Post-exploitation",
    keywords: "Linux inventory permissions impact",
    references: ["ptes"],
    groups: [
      {
        name: "Accounts and files",
        commands: [
          { id: "identite-linux", title: "Check your identity and groups", code: "whoami\nid" },
          { id: "comptes-linux", title: "List accounts known to the system", code: "getent passwd" },
          { id: "repertoire-actuel", title: "Show the current directory", code: "pwd" },
          { id: "fichiers-caches", title: "List files, including hidden files", code: "ls -la" },
          { id: "type-fichier", title: "Identify a file’s type", code: 'file "<file path>"' },
        ],
      },
      {
        name: "Permissions",
        commands: [
          { id: "permissions-dossier", title: "Read a directory’s permissions", code: 'ls -ld "<directory path>"' },
          { id: "chemin-linux", title: "Read permissions along a path", code: 'namei -l "<file path>"' },
        ],
      },
      {
        name: "Services",
        commands: [
          { id: "services-actifs", title: "List running services", code: "systemctl list-units --type=service --state=running" },
          { id: "configuration-service", title: "Read a systemd unit’s configuration", code: 'systemctl cat "<unit name>"' },
          { id: "configuration-nginx", title: "Read enabled Nginx configurations", code: "cat /etc/nginx/sites-enabled/*" },
        ],
      },
      {
        name: "Scheduled tasks",
        commands: [
          { id: "cron-systeme", title: "Read the system crontab", code: "cat /etc/crontab" },
          { id: "cron-supplementaire", title: "List additional cron files", code: "ls -la /etc/cron.d/" },
          { id: "taches-systemd", title: "List systemd timers", code: "systemctl list-timers --all" },
        ],
      },
      {
        name: "Local SSH keys",
        commands: [
          { id: "paire-ed25519", title: "Generate an Ed25519 key pair", code: 'ssh-keygen -t ed25519 -f "<private key path>"' },
          { id: "cle-publique", title: "Show the public key", code: 'cat "<public key path>"' },
          { id: "permissions-cle", title: "Restrict access to the private key", code: 'chmod 600 "<private key path>"' },
        ],
      },
    ],
  },
  {
    id: "rapport",
    title: "Reporting",
    references: ["cvss", "ptes"],
    groups: [
      {
        name: "Evidence",
        commands: [
          { id: "horodatage-utc", title: "Record a UTC timestamp", code: "date -u +'%Y-%m-%dT%H:%M:%SZ'" },
          { id: "empreinte-preuve", title: "Create and verify a checksum", code: 'sha256sum "<evidence file>" > "<checksum file>"\nsha256sum -c "<checksum file>"' },
        ],
      },
      {
        name: "Writing",
        commands: [
          { id: "modele-constat", title: "Finding template", code: "Finding title\nAsset and version\nStatus and severity\nObservation\nRedacted evidence and UTC timestamp\nImpact and scope\nProposed fix\nRetest criteria" },
          { id: "relire-publication", title: "Review files staged for commit", code: "git diff --cached --name-only\ngit diff --cached" },
        ],
      },
    ],
  },
];
