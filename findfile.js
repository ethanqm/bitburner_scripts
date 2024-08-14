/** @param {NS} ns */
export async function main(ns) {
  const FILENAME = await ns.prompt("Enter Filename: ",{type: "text"});

  // GET SERVERS
  const SCAN_DEPTH = 10;
  var servers1 = ns.scan();
  for (var i = 2; i < SCAN_DEPTH; i++) {
    servers1 = servers1.concat(servers1.flatMap(e => { return ns.scan(e); }));
  }
  const SERVERS = [... new Set(servers1)];

  SERVERS.forEach(svr => {
    const FILES = ns.ls(svr);
    if (FILES.includes(FILENAME)) {
      ns.toast(`Found file ${FILENAME} on server ${svr}`,"success",null);
    }
  });

}