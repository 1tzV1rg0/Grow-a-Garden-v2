(function () {
  "use strict";

  function getPlantById(plants, plantId) {
    return plants.find(function (plant) {
      return plant.id === plantId;
    });
  }

  function plantSeed(garden, inventory, plotIndex, plantId) {
    if (garden[plotIndex]) {
      return { ok: false, message: "That plot already has a plant." };
    }

    if (!inventory.seeds[plantId] || inventory.seeds[plantId] <= 0) {
      return { ok: false, message: "You do not have that seed." };
    }

    inventory.seeds[plantId] -= 1;
    garden[plotIndex] = {
      plantId: plantId,
      plantedAt: Date.now()
    };

    return { ok: true, message: "Seed planted." };
  }

  function getGrowthProgress(plot, plant) {
    if (!plot || !plant) {
      return 0;
    }

    var elapsedSeconds = (Date.now() - plot.plantedAt) / 1000;
    return Math.min(100, Math.floor((elapsedSeconds / plant.growTimeSeconds) * 100));
  }

  function isReadyToHarvest(plot, plant) {
    return getGrowthProgress(plot, plant) >= 100;
  }

  function harvestPlot(garden, inventory, plotIndex) {
    var plot = garden[plotIndex];
    if (!plot) {
      return { ok: false, message: "There is nothing to harvest." };
    }

    inventory.crops[plot.plantId] = (inventory.crops[plot.plantId] || 0) + 1;
    garden[plotIndex] = null;

    return { ok: true, message: "Crop harvested." };
  }

  window.PlantRules = {
    getPlantById: getPlantById,
    plantSeed: plantSeed,
    getGrowthProgress: getGrowthProgress,
    isReadyToHarvest: isReadyToHarvest,
    harvestPlot: harvestPlot
  };
})();
