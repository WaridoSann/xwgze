const resources = [
  { id: "ptes", name: "PTES", description: "Le référentiel et ses phases, de la reconnaissance au rapport.", url: "https://pentest-standard.readthedocs.io/en/latest/", category: "Méthode" },
  { id: "nmap", name: "Nmap Reference Guide", description: "Référence officielle des options Nmap et des formats de sortie.", url: "https://nmap.org/book/man.html", category: "Réseau" },
  { id: "microsoft", name: "Microsoft Learn", description: "Documentation de Get-NetTCPConnection et de ses propriétés.", url: "https://learn.microsoft.com/fr-fr/powershell/module/nettcpip/get-nettcpconnection", category: "Windows" },
  { id: "stride", name: "OWASP Threat Modeling", description: "Modéliser les flux, les frontières de confiance et les menaces.", url: "https://community.owasp.org/Threat_Modeling", category: "Méthode" },
  { id: "cve", name: "CVE Program", description: "Rechercher un identifiant CVE et retrouver les avis éditeurs associés.", url: "https://www.cve.org/", category: "Vulnérabilités" },
  { id: "pwstorage", name: "OWASP Password Storage", description: "Comparer Argon2id, scrypt, bcrypt et PBKDF2 pour le stockage de mots de passe.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html", category: "Hachage" },
  { id: "hashcat", name: "Hashcat", description: "Site officiel de l’outil d’audit de mots de passe et point d’entrée vers sa documentation.", url: "https://hashcat.net/hashcat/", category: "Hachage" },
  { id: "xss", name: "OWASP XSS Prevention", description: "Encodage en sortie et mécanismes de protection adaptés au contexte HTML.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html", category: "Web" },
  { id: "cvss", name: "FIRST CVSS", description: "Métriques et vecteurs de sévérité CVSS v4.0.", url: "https://www.first.org/cvss/v4.0/specification-document", category: "Rapport" },
];

const phases = [
  {
    id: "reconnaissance", title: "Reconnaissance", icon: "radar", color: "mint",
    summary: "Inventorier les interfaces, les ports et les services.",
    introduction: "Relie chaque port à une adresse d’écoute et, quand c’est possible, à un processus. Note la source de l’information et l’heure du relevé.",
    checks: [
      "Distinguer une écoute sur la boucle locale d’une écoute sur toutes les interfaces.",
      "Associer le PID au processus ou au service qui détient le port.",
      "Consigner les hypothèses quand l’identification du service reste incertaine.",
    ],
    reminder: "Une écoute sur 127.0.0.1 reste sur la machine locale. Une écoute sur 0.0.0.0 couvre toutes les interfaces IPv4, avec une accessibilité effective qui dépend aussi du pare-feu.",
    links: ["nmap", "microsoft"],
    commands: [
      { id: "ports-linux", title: "Ports à l’écoute sous Linux", shell: "Bash", code: "ss -lntp", description: "Affiche les ports TCP en écoute sur ta machine et les processus visibles avec tes droits." },
      { id: "ports-windows", title: "Ports et PID sous Windows", shell: "PowerShell", code: "Get-NetTCPConnection -State Listen |\n  Sort-Object LocalPort |\n  Select-Object LocalAddress, LocalPort, OwningProcess", description: "Repère l’adresse d’écoute et le PID propriétaire de chaque port TCP sur ton poste." },
      { id: "interfaces-nmap", title: "Interfaces et routes vues par Nmap", shell: "Bash", code: "nmap --iflist", description: "Affiche les interfaces et routes de ton poste telles que Nmap les interprète." },
      { id: "service-windows", title: "Associer un PID à un service Windows", shell: "PowerShell", code: "$servicePid = 1234\nGet-CimInstance Win32_Service |\n  Where-Object ProcessId -eq $servicePid |\n  Select-Object Name, DisplayName, StartName", description: "Remplace 1234 par un PID observé. Si le PID correspond à System, HTTP.sys peut gérer plusieurs enregistrements HTTP." },
    ],
  },
  {
    id: "modelisation", title: "Modélisation des menaces", icon: "nodes", color: "blue",
    summary: "Cartographier les actifs et les frontières de confiance.",
    introduction: "Trace les flux entre utilisateurs, applications et systèmes. Sur chaque frontière, indique l’identité attendue et les décisions de contrôle d’accès.",
    checks: [
      "Identifier les données sensibles et leur propriétaire.",
      "Relever les entrées, les sorties, les comptes de service et les limites de confiance.",
      "Utiliser STRIDE pour formuler les scénarios et associer un contrôle à chacun.",
    ],
    reminder: "Pour chaque flux, note la source, la destination, le protocole, la donnée et le contrôle attendu.",
    links: ["stride", "ptes"],
    commands: [
      { id: "inventaire-repo", title: "Inventorier les fichiers versionnés", shell: "Bash", code: "git ls-files", description: "Dans ton dépôt, repère les manifestes, fichiers de configuration et points d’entrée à placer sur le schéma." },
      { id: "dependances-node", title: "Lire les dépendances déclarées", shell: "Bash", code: "npm pkg get dependencies devDependencies", description: "Depuis un projet Node.js, distingue les dépendances d’exécution et de développement indiquées dans package.json." },
      { id: "ports-modele", title: "Inventorier les unités de service locales", shell: "Bash", code: "systemctl list-units --type=service --state=running --no-pager", description: "Sur ton système Linux équipé de systemd, relève les services actifs à inclure dans ton modèle." },
    ],
  },
  {
    id: "vulnerabilites", title: "Analyse des vulnérabilités", icon: "shield", color: "amber",
    summary: "Vérifier les versions, la configuration et les avis éditeurs.",
    introduction: "Compare l’état réellement déployé aux préconditions des avis de sécurité et aux règles de configuration. Conserve les éléments qui justifient chaque constat.",
    checks: [
      "Identifier la version déployée et vérifier les éventuels correctifs rétroportés.",
      "Lire l’avis de l’éditeur pour établir les conditions d’applicabilité.",
      "Documenter la configuration concernée et la portée du constat.",
    ],
    reminder: "Pour les mots de passe, relève l’algorithme, la présence d’un sel et les paramètres de coût à partir de la configuration prévue pour l’audit.",
    links: ["cve", "pwstorage", "hashcat", "xss"],
    commands: [
      { id: "en-tetes-http", title: "Lire les en-têtes HTTP", shell: "Bash", code: "curl --silent --show-error --head https://example.org/", description: "Observe le statut et les en-têtes renvoyés pour une requête HEAD. L’exemple utilise le domaine réservé example.org." },
      { id: "audit-npm", title: "Consulter les avis des dépendances npm", shell: "Bash", code: "npm audit --omit=dev", description: "Dans ton projet avec un fichier de verrouillage, consulte les avis sur les dépendances d’exécution. npm interroge le registre configuré." },
      { id: "droits-fichier", title: "Vérifier les droits d’un fichier", shell: "Bash", code: "stat -c '%A %U:%G %n' ./configuration.ini", description: "Depuis ton projet Linux, remplace configuration.ini par le fichier dont tu veux vérifier le mode, le propriétaire et le groupe." },
    ],
  },
  {
    id: "exploitation", title: "Exploitation", icon: "terminal", color: "coral",
    summary: "Valider les contrôles et documenter les résultats observés.",
    introduction: "Définis un résultat attendu avant le test. Appuie la validation sur des tests existants, une preuve minimale et la comparaison des résultats.",
    checks: [
      "Écrire l’hypothèse, la condition initiale et le critère d’acceptation.",
      "Conserver le résultat observé, l’heure UTC et la version testée.",
      "Donner un statut à l’hypothèse et préciser les limites de la preuve.",
    ],
    reminder: "Un ACK indique un acquittement du protocole. Pour conclure sur un contrôle, relève l’effet observable correspondant au critère de test.",
    links: ["xss", "ptes"],
    commands: [
      { id: "tests-locaux", title: "Relancer les tests Python du projet", shell: "Bash", code: "python -m unittest discover -v", description: "Dans ton projet Python, relance la suite unittest déjà écrite pour vérifier le comportement attendu." },
      { id: "comparer-resultats", title: "Comparer résultats attendu et observé", shell: "Bash", code: "diff -u attendu.txt observe.txt", description: "Compare tes deux fichiers de texte locaux. Le code de retour 1 indique qu’une différence a été trouvée." },
      { id: "version-testee", title: "Relever la révision testée", shell: "Bash", code: "git rev-parse HEAD\ngit status --short", description: "Note le commit et les éventuelles modifications locales qui influencent la reproductibilité du résultat." },
    ],
  },
  {
    id: "post-exploitation", title: "Post-exploitation", icon: "activity", color: "lavender",
    summary: "Qualifier l’impact, les droits observés et les traces.",
    introduction: "Consigne les accès réellement observés et la limite des permissions. Identifie les traces qui corroborent le résultat et fais l’inventaire des artefacts de test.",
    checks: [
      "Consigner l’identité et les groupes du compte qui a réalisé la vérification.",
      "Distinguer les permissions de lecture, d’écriture et d’exécution.",
      "Vérifier les événements associés et relever les artefacts de test à retirer.",
    ],
    reminder: "Sous Linux, la traversée d’un répertoire dépend du bit x sur chaque composant du chemin.",
    links: ["ptes"],
    commands: [
      { id: "identite-linux", title: "Confirmer l’identité Linux", shell: "Bash", code: "whoami\nid\ngroups", description: "Relève l’utilisateur effectif, ses identifiants et ses groupes dans ta session." },
      { id: "chemin-linux", title: "Lire les droits le long d’un chemin", shell: "Bash", code: "namei -l ./preuve.txt", description: "Sur ta machine Linux, affiche les permissions de chaque composant du chemin de ton fichier de preuve." },
      { id: "journaux-linux", title: "Relire les avertissements du jour", shell: "Bash", code: "journalctl --since today --priority warning --no-pager", description: "Sur ton système équipé de systemd, vérifie les avertissements et erreurs accessibles à ton compte." },
    ],
  },
  {
    id: "rapport", title: "Rapport", icon: "file", color: "sand",
    summary: "Rédiger les constats, les preuves et les correctifs.",
    introduction: "Donne à chaque constat un titre, les actifs concernés, son impact, une preuve expurgée et une recommandation concrète.",
    checks: [
      "Distinguer les constats confirmés des éléments restant à vérifier.",
      "Anonymiser les preuves destinées à la diffusion et référencer leur horodatage.",
      "Prioriser les correctifs et définir les conditions du nouveau test.",
    ],
    reminder: "Une empreinte SHA-256 permet de vérifier l’intégrité d’un fichier de preuve. Donne le vecteur CVSS si tu utilises un score.",
    links: ["cvss", "ptes"],
    commands: [
      { id: "horodatage-utc", title: "Horodater un relevé en UTC", shell: "Bash", code: "date -u +'%Y-%m-%dT%H:%M:%SZ'", description: "Ajoute aux preuves un horodatage uniforme au format ISO 8601." },
      { id: "empreinte-preuve", title: "Calculer et vérifier une empreinte", shell: "Bash", code: "sha256sum preuve.txt > preuve.txt.sha256\nsha256sum -c preuve.txt.sha256", description: "Sur Linux, crée le fichier d’empreinte pour une preuve locale, puis vérifie que son contenu correspond." },
      { id: "relire-publication", title: "Relire les fichiers préparés", shell: "Bash", code: "git diff --cached --name-only\ngit diff --cached", description: "Vérifie le contenu indexé du dépôt avant le commit, en particulier les preuves, identifiants et données client." },
    ],
    template: "Titre du constat\nActif et version\nStatut et sévérité\nObservation et contexte\nPreuve expurgée et horodatage UTC\nImpact et portée\nCorrection proposée\nCritère de validation après correction",
  },
];

const quickCommands = ["ports-linux", "ports-windows", "identite-linux"];
