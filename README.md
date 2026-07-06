# Grow a Garden

Grow a Garden is a small browser game where you buy seeds, plant them in a garden grid, wait for them to grow, harvest crops, and sell those crops for coins.

## How to Run

Open `public/index.html` in a web browser.

The game tries to load starter data from the JSON files in `data`. Some browsers limit JSON loading when a page is opened directly from a file, so the game also includes matching fallback starter data in `public/script.js`. Saved progress is stored in the browser with `localStorage`.

## Folder Structure

- `public/` contains the browser files players open: `index.html`, `style.css`, and `script.js`.
- `src/` contains game logic and rules.
- `data/` contains starter JSON data for the player, plants, and inventory.
- `README.md` explains the project.

## Game Rules Files

- `src/gameRules.js` handles garden creation, crop selling, saving, and loading.
- `src/plantRules.js` handles planting, growth progress, harvest readiness, and harvesting.
- `src/shopRules.js` handles buying seeds and checking whether the player has enough coins.

## JSON Data Files

- `data/players.json` stores the starting player name, starting coins, and garden size.
- `data/plants.json` stores plant stats, including seed price, grow time, sell value, and display emoji.
- `data/inventory.json` stores starting seed inventory and harvested crop inventory.

JSON files are data only. They should not contain game logic.

## How to Add New Plants

1. Add a new plant object to `data/plants.json`.
2. Give it a unique `id`, plus `name`, `emoji`, `seedPrice`, `growTimeSeconds`, and `sellValue`.
3. Add the same plant `id` to both `seeds` and `crops` in `data/inventory.json`.
4. Add the same plant to the fallback data arrays in `public/script.js` if you want the plant to appear when the browser blocks local JSON loading.

Example:

```json
{
  "id": "tomato",
  "name": "Tomato",
  "emoji": "🍅",
  "seedPrice": 18,
  "growTimeSeconds": 18,
  "sellValue": 40
}
```

## Saving and Loading

Starter data comes from the JSON files. After the first load, progress is saved in the browser using `localStorage`, including coins, inventory, and planted garden plots.

Use the `New Game` button in the browser to clear the saved progress and reload the starter data.

<!-- Trigger GitHub Pages redeploy -->
