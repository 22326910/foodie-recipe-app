# Foodie Recipes

An original Expo and React Native recipe app based on the supplied feature brief and screen references. Browse a public recipe catalog, read ingredients and instructions, save favorites, and create, edit, or delete recipes on your device.

The public sample catalog uses [DummyJSON Recipes](https://dummyjson.com/docs/recipes), which provides ingredients, instructions, preparation time, servings, calories per serving, and difficulty for each recipe. Recipes you add and favorites are stored locally with AsyncStorage and are not shared with other users.

## Run locally

Requirements: Node.js 22.13 or newer and the Expo Go app or a web browser.

```bash
npm install
npm start
```

For the web version, run `npm run web`. For a phone, scan the QR code printed by Expo with Expo Go.

## Review in Snack

Open [Foodie in Snack](https://snack.expo.dev/@git/github.com/22326910/foodie-recipe-app), or choose **Project → Import git repository** at [snack.expo.dev](https://snack.expo.dev/) and enter `https://github.com/22326910/foodie-recipe-app`. Select the Web preview or run it in Expo Go. The project targets Expo SDK 54 for Snack compatibility.

## Features

- Main feed with public recipes, search, and horizontal categories
- Recipe details with image, ingredients, instructions, preparation time, servings, calories, and difficulty
- Favorites saved on this device
- Personal recipes with a photo or image URL, edit, and delete
- Back navigation on secondary screens
- Offline access to saved personal recipes and favorites

The public feed needs an internet connection. Your own recipes and favorites stay available on this device offline. DummyJSON supplies sample data, not a shared user database.

