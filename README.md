# Lumen Shift

An interactive city-light study that connects night photography, public space,
and adaptive brightness.

## Concept

Many streetlights remain bright all night, even when streets are empty. Lumen
Shift models a lighting system that dims during low-activity hours and responds
to movement from pedestrians or vehicles.

## Project Structure

- `index.html` - project page
- `src/main.js` - canvas simulation, field records, interaction logic, and data table rendering
- `src/styles.css` - monochrome visual system and responsive layout

## Project Thread

Photography interest -> urban observation -> electricity habits -> interactive
lighting field study.

The current visual direction uses a white grid background, black
typography, and a photography field-study section. The photography layer frames
city night images as prompts: light levels, empty sidewalks, windows, signage,
and street movement become observations that lead into the simulator.

## Connected Project Progression

This project sits inside a small set of connected personal projects:

1. **Power in Practice** - research notes about everyday electricity,
   observation, and public data.
2. **SmartEnergy** - a home-energy dashboard using Ontario electricity rates,
   monthly usage, and scenario notes.
3. **NOCTIS** - a Toronto night photography map and light archive.
4. **Lumen Shift** - an adaptive lighting field study that asks how public light
   could respond to actual street activity.

Together, the projects show a progression from noticing light, to mapping it,
to modeling energy behavior, to building a responsive visual field study.

## System Logic

The project tracks three layers:

- **Observation layer** - photo, location, time, lux, activity, and notes.
- **Pattern layer** - comparison across streets, times, and activity levels.
- **Question layer** - whether visible brightness seems aligned with actual use.

## Interaction Features

- Scenario presets for quiet streets, commute hours, event surges, and daylight
  mode.
- A live insight panel that explains the current lighting decision.
- A photography study board where each image observation updates the simulator.
- Scroll reveal animation, progress indicator, and section navigation to make
  the project feel more like an interactive field study.

## Next Build Ideas

- Collect local night-street photos and pair them with lux readings.
- Add a CSV-based dashboard comparing lux, activity, time, and location.
- Build a short research page on smart street lighting and urban energy use.

## Run Locally

```bash
npm install
npm run dev
```
