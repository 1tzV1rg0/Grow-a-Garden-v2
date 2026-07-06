(function () {
  "use strict";

  var SAVE_KEY = "grow-a-garden-save-v1";
  var FALLBACK_PLAYER = { name: "New Gardener", coins: 40, gardenSize: 15 };
  var FALLBACK_PLANTS = [
    { id: "carrot", name: "Carrot", emoji: "🥕", seedPrice: 8, growTimeSeconds: 8, sellValue: 16 },
    { id: "strawberry", name: "Strawberry", emoji: "🍓", seedPrice: 14, growTimeSeconds: 14, sellValue: 32 },
    { id: "sunflower", name: "Sunflower", emoji: "🌻", seedPrice: 22, growTimeSeconds: 22, sellValue: 55 },
    { id: "pumpkin", name: "Pumpkin", emoji: "🎃", seedPrice: 35, growTimeSeconds: 34, sellValue: 95 }
  ];
  var FALLBACK_INVENTORY = {
    seeds: { carrot: 3, strawberry: 1, sunflower: 0, pumpkin: 0 },
    crops: { carrot: 0, strawberry: 0, sunflower: 0, pumpkin: 0 }
  };

  var state = {
    player: null,
    plants: [],
    inventory: null,
    garden: [],
    selectedSeedId: null
  };

  var coinsEl = document.getElementById("coins");
  var gardenGridEl = document.getElementById("gardenGrid");
  var shopListEl = document.getElementById("shopList");
  var seedInventoryEl = document.getElementById("seedInventory");
  var cropInventoryEl = document.getElementById("cropInventory");
  var statusTextEl = document.getElementById("statusText");
  var sellAllBtn = document.getElementById("sellAllBtn");
  var clearSaveBtn = document.getElementById("clearSaveBtn");

  // JSON files are starter data. Saved progress lives in localStorage so the
  // game still works when opened directly from the file system.
  Promise.all([
    loadJson("../data/players.json", FALLBACK_PLAYER),
    loadJson("../data/plants.json", FALLBACK_PLANTS),
    loadJson("../data/inventory.json", FALLBACK_INVENTORY)
  ]).then(function (starterData) {
    startGame(starterData[0], starterData[1], starterData[2]);
  });

  function loadJson(path, fallback) {
    return fetch(path)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load " + path);
        }
        return response.json();
      })
      .catch(function () {
        return JSON.parse(JSON.stringify(fallback));
      });
  }

  function startGame(playerData, plantData, inventoryData) {
    var saved = window.GameRules.loadGame(SAVE_KEY);
    state.player = saved ? saved.player : playerData;
    state.plants = plantData;
    state.inventory = saved ? saved.inventory : inventoryData;
    state.garden = saved ? saved.garden : window.GameRules.createEmptyGarden(state.player.gardenSize);

    sellAllBtn.addEventListener("click", sellAllCrops);
    clearSaveBtn.addEventListener("click", resetGame);

    render();
    setStatus("Pick a seed, then click an empty plot to plant it.");

    // A light timer keeps growth bars fresh without making the player click.
    window.setInterval(renderGarden, 1000);
  }

  function render() {
    coinsEl.textContent = state.player.coins;
    renderGarden();
    renderShop();
    renderSeedInventory();
    renderCropInventory();
  }

  function renderGarden() {
    gardenGridEl.innerHTML = "";

    state.garden.forEach(function (plot, index) {
      var plotButton = document.createElement("button");
      plotButton.className = "plot";
      plotButton.type = "button";
      plotButton.addEventListener("click", function () {
        handlePlotClick(index);
      });

      if (!plot) {
        plotButton.innerHTML = "<span>Empty<br>Plot</span>";
      } else {
        var plant = window.PlantRules.getPlantById(state.plants, plot.plantId);
        var progress = window.PlantRules.getGrowthProgress(plot, plant);
        var isReady = window.PlantRules.isReadyToHarvest(plot, plant);

        if (isReady) {
          plotButton.classList.add("ready");
        }

        plotButton.innerHTML =
          '<span><span class="plant-emoji">' + plant.emoji + '</span>' +
          '<span class="plot-name">' + (isReady ? "Harvest " : "") + plant.name + "</span></span>" +
          '<span class="progress"><span style="width:' + progress + '%"></span></span>';
      }

      gardenGridEl.appendChild(plotButton);
    });
  }

  function renderShop() {
    shopListEl.innerHTML = "";

    state.plants.forEach(function (plant) {
      var item = document.createElement("div");
      item.className = "shop-item";

      var canBuy = window.ShopRules.canBuySeed(state.player, plant);
      item.innerHTML =
        "<div>" +
        '<p class="item-name"><span>' + plant.emoji + "</span>" + plant.name + " Seed</p>" +
        '<p class="item-meta">Costs ' + plant.seedPrice + " coins · grows in " + plant.growTimeSeconds + "s · sells for " + plant.sellValue + "</p>" +
        "</div>";

      var buyButton = document.createElement("button");
      buyButton.type = "button";
      buyButton.textContent = "Buy";
      buyButton.disabled = !canBuy;
      buyButton.addEventListener("click", function () {
        buySeed(plant.id);
      });

      item.appendChild(buyButton);
      shopListEl.appendChild(item);
    });
  }

  function renderSeedInventory() {
    seedInventoryEl.innerHTML = "";
    var seedIds = Object.keys(state.inventory.seeds);
    var hasSeeds = seedIds.some(function (seedId) {
      return state.inventory.seeds[seedId] > 0;
    });

    if (!hasSeeds) {
      seedInventoryEl.innerHTML = '<div class="empty">No seeds yet. Visit the shop.</div>';
      return;
    }

    seedIds.forEach(function (seedId) {
      var count = state.inventory.seeds[seedId];
      if (count <= 0) {
        return;
      }

      var plant = window.PlantRules.getPlantById(state.plants, seedId);
      var item = document.createElement("div");
      item.className = "inventory-item";
      item.innerHTML =
        "<div>" +
        '<p class="item-name"><span>' + plant.emoji + "</span>" + plant.name + " Seeds</p>" +
        '<p class="item-meta">Owned: ' + count + "</p>" +
        "</div>";

      var chooseButton = document.createElement("button");
      chooseButton.type = "button";
      chooseButton.className = "seed-choice" + (state.selectedSeedId === seedId ? " selected" : "");
      chooseButton.textContent = state.selectedSeedId === seedId ? "Selected" : "Plant";
      chooseButton.addEventListener("click", function () {
        state.selectedSeedId = seedId;
        setStatus("Selected " + plant.name + ". Click an empty garden plot.");
        renderSeedInventory();
      });

      item.appendChild(chooseButton);
      seedInventoryEl.appendChild(item);
    });
  }

  function renderCropInventory() {
    cropInventoryEl.innerHTML = "";
    var cropIds = Object.keys(state.inventory.crops);
    var hasCrops = cropIds.some(function (cropId) {
      return state.inventory.crops[cropId] > 0;
    });

    sellAllBtn.disabled = !hasCrops;

    if (!hasCrops) {
      cropInventoryEl.innerHTML = '<div class="empty">Harvested crops appear here.</div>';
      return;
    }

    cropIds.forEach(function (cropId) {
      var count = state.inventory.crops[cropId];
      if (count <= 0) {
        return;
      }

      var plant = window.PlantRules.getPlantById(state.plants, cropId);
      var item = document.createElement("div");
      item.className = "inventory-item";
      item.innerHTML =
        "<div>" +
        '<p class="item-name"><span>' + plant.emoji + "</span>" + plant.name + "</p>" +
        '<p class="item-meta">Owned: ' + count + " · " + plant.sellValue + " coins each</p>" +
        "</div>";

      var sellButton = document.createElement("button");
      sellButton.type = "button";
      sellButton.textContent = "Sell";
      sellButton.addEventListener("click", function () {
        sellCrop(cropId);
      });

      item.appendChild(sellButton);
      cropInventoryEl.appendChild(item);
    });
  }

  function handlePlotClick(index) {
    var plot = state.garden[index];

    if (!plot) {
      plantSelectedSeed(index);
      return;
    }

    var plant = window.PlantRules.getPlantById(state.plants, plot.plantId);
    if (!window.PlantRules.isReadyToHarvest(plot, plant)) {
      setStatus(plant.name + " is still growing.");
      return;
    }

    window.PlantRules.harvestPlot(state.garden, state.inventory, index);
    setStatus("Harvested " + plant.name + ".");
    saveAndRender();
  }

  function plantSelectedSeed(index) {
    if (!state.selectedSeedId) {
      setStatus("Choose a seed before planting.");
      return;
    }

    var result = window.PlantRules.plantSeed(state.garden, state.inventory, index, state.selectedSeedId);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }

    var plant = window.PlantRules.getPlantById(state.plants, state.selectedSeedId);
    if (state.inventory.seeds[state.selectedSeedId] <= 0) {
      state.selectedSeedId = null;
    }

    setStatus("Planted " + plant.name + ".");
    saveAndRender();
  }

  function buySeed(plantId) {
    var plant = window.PlantRules.getPlantById(state.plants, plantId);
    var result = window.ShopRules.buySeed(state.player, state.inventory, plant);
    setStatus(result.message);
    saveAndRender();
  }

  function sellCrop(cropId) {
    var plant = window.PlantRules.getPlantById(state.plants, cropId);
    var result = window.GameRules.sellCrop(state.player, state.inventory, plant, 1);
    setStatus(result.message);
    saveAndRender();
  }

  function sellAllCrops() {
    var total = 0;
    Object.keys(state.inventory.crops).forEach(function (cropId) {
      var plant = window.PlantRules.getPlantById(state.plants, cropId);
      var count = state.inventory.crops[cropId];
      if (count > 0) {
        total += window.GameRules.sellCrop(state.player, state.inventory, plant, count).earned;
      }
    });

    setStatus(total > 0 ? "Sold all crops for " + total + " coins." : "No crops to sell.");
    saveAndRender();
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  function saveAndRender() {
    window.GameRules.saveGame(SAVE_KEY, {
      player: state.player,
      inventory: state.inventory,
      garden: state.garden
    });
    render();
  }

  function setStatus(message) {
    statusTextEl.textContent = message;
  }
})();
