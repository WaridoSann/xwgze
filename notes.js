const resources = {
  nmap: { name: "Nmap Reference Guide", url: "https://nmap.org/book/man.html" },
  whatweb: { name: "WhatWeb Documentation", url: "https://github.com/urbanadventurer/WhatWeb" },
  burp: { name: "Burp Suite HTTP History", url: "https://portswigger.net/burp/documentation/desktop/tools/proxy/http-history" },
  cve: { name: "CVE Program", url: "https://www.cve.org/" },
  cvss: { name: "FIRST CVSS", url: "https://www.first.org/cvss/" },
  ptes: { name: "Pentest Execution Standard", url: "https://pentest-standard.readthedocs.io/en/latest/" },
};

const stages = [
  {
    id: "reconnaissance",
    title: "Reconnaissance",
    tileTitle: "Reconnais\u00adsance",
    purpose: "Discover exposed ports and identify the services behind them.",
    when: "Start with an authorized host. If you identify HTTP or HTTPS, continue to Web Enumeration.",
    references: ["nmap"],
    commands: [
      {
        id: "tcp-complet", title: "Discover all TCP ports", code: "nmap -p- -T4 --min-rate=2000 <local IP address>",
        description: "Checks all TCP ports with faster timings and a requested minimum of 2,000 packets per second.",
      },
      {
        id: "nmap-services", title: "Identify services and versions", code: "nmap -sC -sV -p <port list> <local IP address>",
        description: "Runs the default NSE scripts and version probes against the comma-separated ports you found.",
      },
      {
        id: "nmap-version-all", title: "Investigate an unidentified service", code: "nmap -sV --version-all -p <port> <local IP address>",
        when: "Use when the first scan leaves a service unidentified.",
        description: "Tries all version-detection probes on the selected port.",
      },
      {
        id: "workflow-udp", title: "Check the 20 most common UDP ports", code: "sudo nmap -sU --top-ports 20 <local IP address>",
        when: "Use when the host is expected to expose UDP services.",
        description: "Checks the 20 UDP ports ranked most common by Nmap.",
      },
    ],
    sections: [
      {
        id: "nmap-advanced", title: "Advanced Nmap checks", purpose: "Adapt the scan to host discovery and OS identification.",
        commands: [
          {
            id: "nmap-os", title: "Estimate the operating system", code: "sudo nmap -O --osscan-guess <local IP address>",
            when: "Use when you need to compare a network fingerprint with the host inventory.",
            description: "Reports likely OS matches.",
          },
          {
            id: "nmap-no-discovery", title: "Scan a known host that does not answer discovery", code: "nmap -Pn -n -sC -sV <local IP address>",
            when: "Use when you have confirmed the test host is online.",
            description: "Skips host discovery and DNS resolution, then runs default scripts and version checks.",
          },
        ],
      },
    ],
  },
  {
    id: "web-enumeration",
    title: "Web Enumeration",
    purpose: "Identify web technologies and review the application’s HTTP behavior.",
    when: "Open this stage when you find HTTP or HTTPS. Choose a subsection for the evidence you need.",
    references: ["whatweb", "burp"],
    commands: [
      {
        id: "whatweb-local", title: "Identify web technologies", code: 'whatweb "<local URL>"',
        description: "Reports technologies visible in the response from your local web application.",
      },
    ],
    sections: [
      {
        id: "directory-discovery", title: "Directory & File Discovery", purpose: "Check files and routes against the intended deployment.",
        when: "Use when a resource is missing from navigation or you need to review the web root. Gobuster and ffuf are alternative tools for wordlist-based discovery.",
        commands: [
          { id: "inventaire-repo", title: "List tracked files", code: "git ls-files", description: "Run in your application repository to compare files with the intended deployment." },
        ],
      },
      {
        id: "virtual-host-discovery", title: "Virtual Host Discovery", purpose: "Review configured site names and their DNS records.",
        when: "Use when several sites share an IP address. Identify the base domain and check its DNS resolution. HTTP virtual hosts select a site by hostname, and DNS records map names to addresses. Account for default pages and redirects when comparing responses.",
        commands: [
          { id: "vhost-dns", title: "Check the base domain’s DNS record", code: 'dig +short "<base domain>"', description: "Shows the address or record returned by DNS." },
          {
            id: "configuration-nginx", title: "List configured Nginx server names",
            code: "nginx -T 2>/dev/null | grep -E '^[[:space:]]*server_name[[:space:]]'",
            description: "Run on your Nginx host to see the names in its configuration.",
          },
        ],
      },
      {
        id: "workflow-burp", title: "HTTP Analysis", purpose: "Inspect known requests, response headers, and status codes.",
        when: "Use Burp Proxy and HTTP History to review traffic from your application. Use Repeater to resend a known request. Intruder can repeat test cases across different input values in your own application.",
        commands: [
          { id: "whatweb-detail", title: "Probe web technologies in more detail", code: 'whatweb -a 3 "<local URL>"', when: "Use on your local app when the basic check leaves a technology unidentified.", description: "Sends additional technology-specific probes." },
          { id: "entetes-web-locaux", title: "Read response headers", code: 'curl -I "<local URL>"', description: "Sends a HEAD request to show the status and headers." },
        ],
      },
    ],
  },
  {
    id: "vulnerabilites",
    title: "Vulnerability Research",
    tileTitle: "Vulnera\u00adbility Research",
    purpose: "Match observed versions and configurations to security advisories.",
    when: "Use after identifying a component. Check the vendor’s affected versions and whether the installed package includes a backported fix.",
    references: ["cve"],
    commands: [
      { id: "package-version", title: "Read an installed package version", code: 'dpkg-query -W "<package name>"', description: "Reports the package version on a Debian-based host." },
      { id: "audit-npm", title: "Review project dependency advisories", code: "npm audit --omit=dev", description: "Checks production dependencies in your project against its configured npm registry." },
    ],
  },
  {
    id: "exploitation",
    title: "Initial Exploitation",
    purpose: "Validate the expected security behavior in an isolated environment.",
    when: "Use the application’s existing security tests to confirm a finding or check a fix.",
    commands: [
      { id: "tests-locaux", title: "Run existing Python regression tests", code: "python -m unittest discover -v", description: "Runs the project’s existing tests and reports individual outcomes." },
    ],
  },
  {
    id: "post-exploitation",
    title: "Post-Exploitation Enumeration",
    tileTitle: "Post-exploitation",
    purpose: "Record the account, operating system, processes, and listeners in a Linux session.",
    when: "Use once you have an authorized Linux session and need a baseline of the host.",
    commands: [
      { id: "identite-linux", title: "Show the current account", code: "whoami", description: "Prints the effective username." },
      { id: "account-id", title: "Show user and group IDs", code: "id", description: "Shows the effective user and group IDs and group memberships." },
      { id: "account-groups", title: "List group memberships", code: "groups", description: "Prints the groups of the current account." },
      { id: "linux-kernel", title: "Read kernel and architecture details", code: "uname -a", description: "Reports kernel and machine information." },
      { id: "linux-release", title: "Read the Linux distribution release", code: "cat /etc/os-release", description: "Shows the distribution and release recorded by the OS." },
      { id: "workflow-processes", title: "List processes with full arguments", code: "ps auxww", description: "Shows processes, owners, and full command lines." },
      { id: "local-tcp-services", title: "List listening TCP sockets", code: "ss -lntp", description: "Shows local TCP listeners and process details available to the account." },
      { id: "home-directories", title: "Review home directory entries", code: "ls -la /home/", description: "Shows directory names, owners, and permissions." },
    ],
  },
  {
    id: "internal-services",
    title: "Internal Service Enumeration",
    tileTitle: "Internal Services",
    purpose: "Identify local services and verify their network bindings.",
    when: "Use from the host to identify listeners and units you cannot verify from the network.",
    commands: [
      { id: "services-actifs", title: "List running systemd services", code: "systemctl list-units --type=service --state=running", description: "Lists services that systemd reports as active and running." },
      { id: "local-udp-services", title: "List local UDP sockets", code: "ss -lunp", description: "Shows listening UDP sockets and available process details." },
      { id: "configuration-service", title: "Read a systemd unit", code: 'systemctl cat "<unit name>"', description: "Shows the unit and its drop-in configuration." },
    ],
  },
  {
    id: "privesc",
    title: "Privilege Escalation",
    purpose: "Review administrative permissions and scheduled tasks for misconfiguration.",
    when: "Use when auditing the expected access of an account and the configuration of a host you administer.",
    commands: [
      { id: "sudo-policy", title: "Review the current account’s sudo policy", code: "sudo -l", description: "Lists allowed sudo commands for the current account." },
      { id: "workflow-file-access", title: "Review permissions along a path", code: 'namei -l "<path>"', description: "Shows permissions and ownership for each path component." },
      { id: "cron-systeme", title: "Read the system crontab", code: "cat /etc/crontab", description: "Shows system-wide cron entries and the users they run as." },
      { id: "taches-systemd", title: "List systemd timers", code: "systemctl list-timers --all", description: "Shows configured timers and their scheduled services." },
    ],
  },
  {
    id: "verification",
    title: "Verification",
    purpose: "Compare observations with expected results and record the tested revision.",
    when: "Use after reproducing a safe check or applying a fix.",
    commands: [
      { id: "comparer-resultats", title: "Compare expected and observed output", code: 'diff -u "<expected file>" "<observed file>"', description: "Shows the differences in a compact, line-by-line format." },
      { id: "version-testee", title: "Record the tested Git revision", code: "git rev-parse HEAD", description: "Prints the commit ID for your test record." },
    ],
  },
  {
    id: "rapport",
    title: "Reporting",
    purpose: "Capture reproducible findings, redacted evidence, and remediation.",
    when: "Use when a finding is ready to document. Record the scope, observed behavior, impact, fix, and retest criteria.",
    references: ["ptes", "cvss"],
    commands: [
      { id: "save-local-scan", title: "Save selected-port results", code: "nmap -p <port list> -oA scan_initial <local IP address>", description: "Writes normal, XML, and grepable output with the scan_initial prefix." },
      { id: "horodatage-utc", title: "Record a UTC timestamp", code: "date -u +'%Y-%m-%dT%H:%M:%SZ'", description: "Captures the time for your evidence record." },
      { id: "empreinte-preuve", title: "Record a checksum for an evidence file", code: 'sha256sum "<evidence file>"', description: "Prints a digest you can use to verify the file later." },
    ],
  },
];
