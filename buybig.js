/** @param {NS} ns */
export async function main(ns) {
  const OWNED_SERVERS = ns.getPurchasedServers();
  const PURCHASE_COSTS = [...Array(13).keys()] // 0..=12
    .map(val => val + 8) // 8..=20
    .map(ram_exp => {
      const RAM = Math.pow(2, ram_exp);
      return {
        ram: RAM, // 128..=1_048_576
        cost: ns.getPurchasedServerCost(RAM),
      }
    });

  // MENU 1: BUY OR UPGRADE
  const BUY_OR_UPGRADE = await ns.prompt("Buy or Upgrade?", {
    type: "select",
    choices: ["BUY", "UPGRADE", "CANCEL"]
  });
  switch (BUY_OR_UPGRADE) {
    case "BUY":
      const CHOICES = PURCHASE_COSTS.map(info => {
        return `${ns.formatRam(info.ram)}\n$${ns.formatNumber(info.cost)}`
      })
      // PROMPT RAM SIZE AND COST
      const BUY_SELECTION = await ns.prompt("Select size: ", {
        type: "select",
        choices: CHOICES.concat("CANCEL"),
      });
      // CANCEL OR PURCHASE
      switch (BUY_SELECTION) {
        case "CANCEL":
          ns.exit();
        default:
          const RAM = PURCHASE_COSTS[CHOICES.indexOf(BUY_SELECTION)].ram;
          ns.purchaseServer("sv_" + OWNED_SERVERS.length, RAM);
          break;
      }
      break;
    case "UPGRADE":
      // NO SERVERS
      if (OWNED_SERVERS.length == 0) {
        ns.toast("No servers to upgrade :(", "error",10_000);
        ns.exit();
      }

      // SELECT FROM SERVERS
      const SERVER_CHOICES = OWNED_SERVERS.map(svr =>{
        return `${svr}, RAM:${ns.formatRam(ns.getPurchasedServerMaxRam(svr))}`  
      });
      const SEL_SERVER = await ns.prompt("Select server", {
        type: "select",
        choices: SERVER_CHOICES.concat("CANCEL"),
      })
      switch(SEL_SERVER) {
        case "CANCEL":
          ns.exit();
        default:
          // SELECT UPGRADE AMOUNT
          const SERVER_NAME = OWNED_SERVERS[SERVER_CHOICES.indexOf(SEL_SERVER)];
          const CURRENT_RAM = ns.getServerMaxRam(SERVER_NAME);
          const RAM_SIZES = [...Array(21).keys()] // 0 ..= 20
            .map(r => Math.pow(2,r)) // 2^0 ..= 2^20
            .filter(r => r > CURRENT_RAM);
          const UPGRADE_COSTS = RAM_SIZES.map(sz => ns.getPurchasedServerUpgradeCost(SERVER_NAME, sz));
          const CHOICES = RAM_SIZES.map((sz,i) => {
            return `${ns.formatRam(sz)} $${ns.formatNumber(UPGRADE_COSTS[i])}`;
          });
          const UPGR_SELECTION = await ns.prompt("Select size: ", {
            type: "select",
            choices: CHOICES.concat("CANCEL"),
          });
          switch (UPGR_SELECTION) {
            case "CANCEL":
              ns.exit();
            default:
              const RAM = RAM_SIZES[CHOICES.indexOf(UPGR_SELECTION)];
              ns.upgradePurchasedServer(SERVER_NAME, RAM);
          }
      }
      break;
    case "CANCEL":
      ns.exit();
  }

}