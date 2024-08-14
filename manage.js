/** @param {NS} ns */
export async function main(ns) {
  // OPEN TAIL WINDOW ON LAUNCH
  ns.tail(); ns.moveTail(1200, 0); ns.setTitle("xX_MANAGE MAIN_Xx");


  // GET SERVERS
  const SCAN_DEPTH = 10;
  var servers1 = ns.scan();
  for (var i = 2; i < SCAN_DEPTH; i++) {
    servers1 = servers1.concat(servers1.flatMap(e => { return ns.scan(e); }));
  }
  const OWNED_SERVERS = ns.getPurchasedServers(); //TODO: use this ram
  const EXCLUDE_LIST = [
    "home",
    "darkweb",
    "CSEC",
    "I.I.I.I",
    "avmnite-02h",
  ].concat(OWNED_SERVERS);

  const SERVERS = [... new Set(servers1)]
    .filter(s => !EXCLUDE_LIST.includes(s))
    .sort((a, b) => {
      return ns.getServerMaxMoney(a) - ns.getServerMaxMoney(b);
    }
    );

  const FILES = ["gogrow.js", "goweaken.js", "gohack.js", "goshare.js"];
  const FILES_RAM = 1.75;

  while (true) {
    const LEVEL = ns.getHackingLevel();
    const RELEVANT_SERVERS = SERVERS.filter((svr) => {
      return ns.getServerRequiredHackingLevel(svr) <= LEVEL;
    });
    for (var i = 0; i < RELEVANT_SERVERS.length; i++) {
      const TARGET = RELEVANT_SERVERS[i];
      if (ns.hasRootAccess(TARGET)) {
        const SVR_RAM_MAX = ns.getServerMaxRam(TARGET);
        const SVR_AVAIL_RAM = SVR_RAM_MAX - ns.getServerUsedRam(TARGET);
        const SVR_AVAIL_THREADS = Math.floor(SVR_AVAIL_RAM / FILES_RAM);

        const HOST_AVAIL_RAM = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
        const HOST_MAX_THREADS = Math.floor((ns.getServerMaxRam("home") - 4.8) / FILES_RAM);
        const HOST_AVAIL_THREADS = Math.floor(HOST_AVAIL_RAM / FILES_RAM);
        const THREAD_BALANCED = Math.floor(HOST_MAX_THREADS / RELEVANT_SERVERS.length);

        if (HOST_AVAIL_THREADS < THREAD_BALANCED) { await ns.sleep(2_000); continue; } //

        const SVR_SEC_MIN = ns.getServerMinSecurityLevel(TARGET);
        const SVR_SEC_CUR = ns.getServerSecurityLevel(TARGET);
        const SEC_TOLERANCE = 0.5;


        if (SVR_SEC_CUR < SVR_SEC_MIN) {
          ns.toast(`LOWER THAN BASE SEC: ${TARGET}`, "warning", 10_000);
        }

        const SVR_MON_MAX = ns.getServerMaxMoney(TARGET);
        if (SVR_MON_MAX == 0) { ns.toast(`SERVER WITH NO MONEY ${TARGET}`, "warning", 5_000); continue; }
        const SVR_MON_CUR = ns.getServerMoneyAvailable(TARGET);

        // TEXT FORMAT
        const SSEC_CUR_FMT = ns.formatNumber(SVR_SEC_CUR);
        const SSEC_MIN_FMT = ns.formatNumber(SVR_SEC_MIN);
        const SMON_CUR_FMT = ns.formatNumber(SVR_MON_CUR);
        const SMON_MAX_FMT = ns.formatNumber(SVR_MON_MAX);


        if (!ns.fileExists("goshare.js", TARGET)) {
          ns.scp(FILES, TARGET);
        }

        const RUN_SETTINGS = {
          threads: THREAD_BALANCED,
          preventDuplicates: true,
        }

        //if (HOST_AVAIL_RAM < 1.75) {continue;}
        if (SVR_SEC_CUR - SVR_SEC_MIN > SEC_TOLERANCE) {
          ns.exec("goweaken.js", "home", RUN_SETTINGS, TARGET, SSEC_CUR_FMT, SSEC_MIN_FMT);
          if (SVR_AVAIL_THREADS == 0) { continue; }
          ns.exec("goweaken.js", TARGET, SVR_AVAIL_THREADS, TARGET);
        } else if (!(SVR_MON_CUR > (SVR_MON_MAX * 0.9) /*| SVR_MON_CUR > 200_000_000)*/)) {
          ns.exec("gogrow.js", "home", RUN_SETTINGS, TARGET, SMON_CUR_FMT, SMON_MAX_FMT);
          if (SVR_AVAIL_THREADS == 0) { continue; }
          ns.exec("gogrow.js", TARGET, SVR_AVAIL_THREADS, TARGET);
        } else {
          const SHARE_THREADS = Math.floor(SVR_AVAIL_RAM / 4);
          if (SHARE_THREADS > 0) {
            ns.exec("goshare.js", TARGET, SHARE_THREADS, TARGET);
          }
          if (THREAD_BALANCED > 0) {
            ns.exec("gohack.js", "home", RUN_SETTINGS, TARGET);
          }
        }

      } else {
        //no root access for vulnerable server
        switch (ns.getServerNumPortsRequired(TARGET)) {
          case 5:
            if (ns.fileExists("SQLInject.exe", "home")) {
              ns.sqlinject(TARGET);
            }
          case 4:
            if (ns.fileExists("HTTPWorm.exe", "home")) {
              ns.httpworm(TARGET);
            }
          case 3:
            if (ns.fileExists("relaySMTP.exe", "home")) {
              ns.relaysmtp(TARGET);
            }
          case 2:
            if (ns.fileExists("FTPCrack.exe", "home")) {
              ns.ftpcrack(TARGET);
            }
          case 1:
            if (ns.fileExists("BruteSSH.exe", "home")) {
              ns.brutessh(TARGET);
            }
          case 0:
            try {
              ns.nuke(TARGET);
            } catch { }
            break;
          default:
            break;
        }
      }
    }
    await ns.sleep(7_000);
  }

}

