# Lumen Shift

An interactive adaptive urban lighting concept that connects night photography,
electrical engineering, and sustainable city systems.

## Concept

Many streetlights remain bright all night, even when streets are empty. Lumen
Shift models a lighting system that dims during low-activity hours and responds
to movement from pedestrians or vehicles.

## Project Structure

- `index.html` - portfolio-facing project page
- `src/main.js` - canvas simulation, interaction logic, and energy estimates
- `src/styles.css` - monochrome visual system and responsive layout

## Portfolio Story

Photography interest -> urban observation -> power and energy research ->
adaptive lighting solution -> future electrical engineering direction.

The current visual direction uses a white engineering-grid background, black
typography, and a photography field-study section. The photography layer frames
city night images as evidence: light levels, empty sidewalks, windows, signage,
and street movement become observations that lead into the adaptive lighting
system.

## Connected Project Progression

This project is designed as the third step in a larger application narrative:

1. **Power in Practice** - a research archive about energy inefficiency,
   observation, and visual systems.
2. **SmartEnergy** - a home-energy dashboard using Ontario electricity rates,
   monthly usage, and recommendations.
3. **Lumen Shift** - an adaptive urban lighting system that turns energy
   analysis into a public-space engineering solution.

Together, the projects show a progression from observing energy waste, to
modeling energy behavior, to designing a responsive electrical system.

## System Logic

The prototype models three layers:

- **Sensor layer** - movement and activity detection.
- **Control layer** - adaptive dimming logic based on hour, street flow, and
  base brightness.
- **Impact layer** - estimated energy savings compared with a fixed always-on
  lighting baseline.

## Next Build Ideas

- Add an Arduino prototype using a PIR or ultrasonic sensor and PWM LED control.
- Collect local night-street photos and pair them with engineering notes.
- Add a CSV-based dashboard comparing fixed lighting vs adaptive lighting.
- Build a short research page on smart street lighting and urban energy use.

## Run Locally

```bash
npm install
npm run dev
```
