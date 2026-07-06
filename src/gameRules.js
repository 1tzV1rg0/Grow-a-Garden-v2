(function () {
  "use strict";

  function createEmptyGarden(size) {
    return Array.from({ length: size }, function () {
      return null;
    });
  }

  function sellCrop(player, inventory, plant, amount) {
    var owned = inventory.crops[plant.id] || 0;
    var sellAmount = Math.min(amount, owned);

    if (sellAmount <= 0) {
      return { ok: false, earned: 0, message: "You do not have any " + plant.name + " to sell." };
    }

    var earned = sellAmount * plant.sellValue;
    inventory.crops[plant.id] -= sellAmount;
    player.coins += earned;

    return { ok: true, earned: earned, message: "Sold " + sellAmount + " " + plant.name + " for " + earned + " coins." };
  }

  function saveGame(key, gameState) {
    localStorage.setItem(key, JSON.stringify(gameState));
  }

  function loadGame(key) {
    var saved = localStorage.getItem(key);
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      localStorage.removeItem(key);
      return null;
    }
  }

  window.GameRules = {
    createEmptyGarden: createEmptyGarden,
    sellCrop: sellCrop,
    saveGame: saveGame,
    loadGame: loadGame
  };
})();
