# Horror Movie Word Search

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A horror-themed word search puzzle game for horror movie fans
- Word grid (15x15) filled with hidden horror movie titles and character names
- List of words to find displayed alongside the grid
- Click/drag selection mechanic to highlight words on the grid
- Words can be hidden horizontally, vertically, and diagonally (forward and backward)
- Visual feedback when a word is found (strikethrough in word list, highlighted in grid)
- Multiple puzzle categories: "Classic Horror", "Slasher Films", "Supernatural Horror", "Horror Icons"
- Score tracking: number of words found vs total
- Timer counting up per puzzle
- New puzzle / reset button
- Completion screen when all words are found
- Horror-themed word bank including: HALLOWEEN, FREDDY, JASON, DRACULA, FRANKENSTEIN, CHUCKY, NIGHTMARE, SCREAM, PSYCHO, CARRIE, SHINING, EXORCIST, OMEN, ROSEMARY, HELLRAISER, CANDYMAN, SUSPIRIA, NOSFERATU, POLTERGEIST, ANNABELLE, CONJURING, HEREDITARY, MIDSOMMAR, SINISTER, INSIDIOUS

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
- Backend: Store puzzle definitions, word lists, categories, and high scores (best time per category)
- Backend: API to get puzzle by category, save score/time
- Frontend: Word search grid component with click-and-drag selection
- Frontend: Word list sidebar showing found/remaining words
- Frontend: Category selector screen
- Frontend: Timer and score display
- Frontend: Win/completion modal
- Frontend: Horror atmospheric styling with dark theme
