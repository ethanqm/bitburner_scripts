/** @param {NS} ns */
export async function main(ns) {
  const scan_depth = 10;
  var servers1 = ns.scan();
  for (var i = 2; i < scan_depth; i++) {
    servers1 = servers1.concat(servers1.flatMap(e => { return ns.scan(e); }));

  }
  const THIS_SERVER = ns.getHostname();
  const blacklist = ["home", "s1", "darknet", THIS_SERVER];

  const servers = [... new Set(servers1)].filter(s => !blacklist.includes(s));
  //ns.tprint(servers);

  const RUN_RAM = ns.getScriptRam("gorun.js");

  const levels = servers.map(e => { return ns.getServerRequiredHackingLevel(e) });
  var running = servers.map(_ => false);

  while (true) {
    const level = ns.getHackingLevel();
    // skip self server
    for (var i = 1; i < servers.length; i++) {
      const target = servers[i];
      if (levels[i] <= level) {
        if (ns.hasRootAccess(target)) {
          
          if (running[i] != true) {
            const ok = ns.run("gohack.js", 1, target);
            if (ok > 0) {
              running[i] = true;
            }
          } else {
            const AV_RAM = ns.getServerMaxRam(THIS_SERVER) - ns.getServerUsedRam(THIS_SERVER);
            if (AV_RAM > RUN_RAM * 2) {
              ns.run("gogrow.js", 1, target);
              if (ns.getServerBaseSecurityLevel(target) - ns.getServerSecurityLevel(target) > 1) {
                ns.run("goweaken.js", 1, target);
              }
            }
          }
          
        } else {
          switch (ns.getServerNumPortsRequired(target)) {
            case 2:
              if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(target);
              }
            case 1:
              if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(target);
              }
            case 0:
            try {
              ns.nuke(target);
            } catch {}
              break;
            default:
              break;
          }
        }
      }
    }
    await ns.sleep(10_000);
  }
}