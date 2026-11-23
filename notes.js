const resources = {
  nmap: { name: "Nmap Reference Guide", url: "https://nmap.org/book/man.html" },
};

const stages = [
  {
    id: "reconnaissance",
    title: "Reconnaissance",
    purpose: "Discover exposed ports and identify the services behind them.",
    when: "Start with an authorized host. Discover its ports, then identify the services on the ports you found.",
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
];
