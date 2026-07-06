(function () {
  "use strict";

  function canBuySeed(player, plant) {
    return player.coins >= plant.seedPrice;
  }

  function buySeed(player, inventory, plant) {
    if (!canBuySeed(player, plant)) {
      return { ok: false, message: "Not enough coins for " + plant.name + " seeds." };
    }

    player.coins -= plant.seedPrice;
    inventory.seeds[plant.id] = (inventory.seeds[plant.id] || 0) + 1;

    return { ok: true, message: "Bought 1 " + plant.name + " seed." };
  }

  window.ShopRules = {
    canBuySeed: canBuySeed,
    buySeed: buySeed
  };
})();
