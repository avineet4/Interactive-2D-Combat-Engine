# 🥋 Interactive 2D Combat Engine - Codebase Index

## 📋 Overview

This is a comprehensive index of the Interactive 2D Combat Engine codebase, a production-level implementation of classic 2D fighting games inspired by Street Fighter. The engine features a professional component-based architecture with fluid animations, responsive controls, and dynamic gameplay.

## 🏗️ Project Structure

```
/workspace/
├── index.html              # Main HTML entry point with preloaded assets
├── style.css              # Global CSS styles
├── README.md              # Project documentation
├── src/                   # Source code directory
│   ├── index.js          # Application entry point
│   ├── StreetFighterGame.js  # Main game class and game loop
│   ├── constants/        # Game configuration constants
│   ├── engine/          # Core engine systems
│   ├── entities/        # Game entities (fighters, stages, overlays)
│   ├── scene/          # Scene management system
│   ├── states/         # State management
│   └── utils/          # Utility functions
├── public/             # Static assets
│   ├── images/        # Sprite sheets and graphics
│   └── sounds/        # Audio files
└── .vscode/           # VSCode configuration
```

## 🎯 Core Architecture

### Main Game Loop
- **Entry Point**: `src/index.js` - Initializes StreetFighterGame
- **Game Class**: `src/StreetFighterGame.js` - Main game loop, scene management, frame timing
- **Viewport**: 386x224 pixels with scaling support

### Scene System
The game uses a scene-based architecture with seamless transitions:

1. **TitleScene** (`src/scene/TitleScene.js`) - Main menu with options
2. **StageSelectionScene** (`src/scene/stageSelection.js`) - Stage selection carousel
3. **VersusScene** (`src/scene/VersusScene.js`) - Fighter matchup display
4. **BattleScene** (`src/scene/BattleScene.js`) - Main combat arena

## 🎮 Engine Systems

### Input Handler (`src/engine/inputHandler.js`)
- **Keyboard Events**: Key press/release tracking with Set-based storage
- **Control Mapping**: Two-player control schemes (WASD + keys vs Arrow keys + numpad)
- **Input Functions**: Direction checks, attack inputs, combo detection
- **Special Moves**: Control history tracking for special move sequences

### Context Handler (`src/engine/contextHandler.js`)
- **Visual Effects**: Brightness and contrast manipulation for scene transitions
- **Transition Effects**: Glow-up and dim-down animations
- **Global Effects**: Screen-wide visual processing

### Camera System (`src/engine/camera.js`)
- **Dynamic Tracking**: Follows fighter movements
- **Vertical Adjustment**: Adjusts based on fighter positions
- **Smooth Movement**: 60 speed units for fluid camera motion

### Sound Handler (`src/engine/soundHandler.js`)
- **Global Volume**: Centralized volume control (0.5 default)
- **Sound Management**: Play/stop functions with overlap handling
- **Audio Reset**: Automatic sound reset for overlapping effects

### Entity Management (`src/engine/EntityList.js`)
- **Entity Lifecycle**: Add, remove, update, draw operations
- **Batch Processing**: Efficient entity collection management
- **Iterator Support**: forEach functionality for entity operations

## 👊 Fighter System

### Base Fighter Class (`src/entities/fighter/fighter.js`)
- **Physics**: Position, velocity, gravity simulation
- **Animation**: Frame-based sprite animation system
- **State Machine**: Comprehensive fighter states (idle, walk, jump, attack, hurt, etc.)
- **Combat**: Hit/hurt box collision detection
- **Audio Integration**: Attack and hit sound effects
- **Health System**: Damage calculation and health regeneration

### Character Implementations
- **Ryu** (`src/entities/fighter/ryu.js`) - 1190 lines of frames and animations
- **Ken** (`src/entities/fighter/ken.js`) - 1209 lines of frames and animations

### Shared Components (`src/entities/fighter/shared/`)
- **Shadow** - Fighter shadow rendering
- **Hit Effects** - Light, Medium, Heavy hit splash effects
- **Visual Feedback** - Impact visualization system

## 🎭 Stage System

### Stage Implementations (`src/entities/stages/`)
- **RyuStage** - Japanese dojo setting
- **KenStage** - San Francisco bay backdrop  
- **SagatStage** - Thai temple ruins
- **VegasStage** - Casino fighting arena

### Stage Features
- **Background Layers**: Multi-layer parallax backgrounds
- **Floor Rendering**: Dedicated floor graphics
- **Music Integration**: Stage-specific background music
- **Camera Integration**: Responsive to camera movement

## 🎨 UI System

### Status Bar (`src/entities/overlays/StatusBar.js`)
- **Health Bars**: Dual fighter health with damage visualization
- **Timer System**: 99-second countdown with flash effects
- **Score Display**: Numeric and alphabetic character rendering
- **KO Animation**: Victory/defeat state visualization
- **Health Regeneration**: 6-second delay health recovery

## ⚙️ Constants & Configuration

### Fighter Constants (`src/constants/fighter.js`)
- **States**: 25+ fighter states (idle, attacks, hurt states, etc.)
- **Attack System**: Light/Medium/Heavy attack strengths with damage values
- **Collision Boxes**: Push boxes, hurt boxes, hit boxes with precise coordinates
- **Physics**: Friction, slide velocity, frame timing

### Control Mapping (`src/constants/control.js`)
- **Player 1**: Arrow keys + Right Ctrl/Shift/Enter for attacks
- **Player 2**: WASD + E/R/T/F/3/4 for attacks
- **Attack Types**: 6 attack buttons per player (3 punches, 3 kicks)

### Battle System (`src/constants/battle.js`)
- **Health**: 144 max HP, 45 critical threshold
- **Timing**: Frame-based timing with 60 FPS
- **Visual Effects**: KO flash sequences, health colors

### Game Settings (`src/constants/game.js`)
- **Performance**: 60 FPS, 16.67ms frame time
- **Speed Control**: Game speed multiplier support

## 🎵 Assets Catalog

### Audio Assets (`public/sounds/`)
#### Music (OGG format)
- `Title-Theme.ogg` (283KB) - Main menu music
- `stage-Select.ogg` (570KB) - Stage selection music
- `Versus-Screen.ogg` (60KB) - Versus screen music
- `kens-theme.ogg` (2.0MB) - Ken's stage music
- `Ryus-Theme.ogg` (1.6MB) - Ryu's stage music
- `Sagats-Theme.ogg` (1.8MB) - Sagat's stage music
- `Balrogs-Theme.ogg` (1.7MB) - Vegas stage music

#### Sound Effects (OGG format)
- Attack sounds: `light-attack.ogg`, `medium-attack.ogg`, `heavy-attack.ogg`
- Hit sounds: Separate punch/kick sounds for each strength level
- Special: `hadouken.ogg`, `land.ogg`

### Visual Assets (`public/images/`)
#### Character Sprites (PNG format)
- `Ryu.png` (555KB) - Complete Ryu sprite sheet
- `Ken.png` (738KB) - Complete Ken sprite sheet

#### Stage Graphics (PNG/JPG format)
- Stage backgrounds: `ryu-stage.png`, `ken-stage.png`, `sagat-stage.png`, `vegas-stage.png`
- Preview images: `ryuStagePre.png`, `KenStagePre.jpg`, etc.

#### UI Elements (PNG format)
- `hud.png` (20KB) - Health bars, timer, score elements
- `TitleScene.png` (84KB) - Title screen graphics
- `versusScene.png` (266KB) - Versus screen layout
- `winnerText.png` (674B) - Victory text
- `shadow.png`, `decals.png` - Game effects

## 🔧 Utility Functions

### Collision Detection (`src/utils/collision.js`)
- **Rectangle Overlap**: Basic AABB collision detection
- **Box Overlap**: Object-oriented collision checking
- **Dimension Calculation**: Direction-aware box positioning

## 📊 State Management

### Game State (`src/states/gameState.js`)
- **Fighter States**: Persistent fighter data (ID, score, health)
- **Default Configuration**: Ryu vs Ken setup

### Fighter State (`src/states/fighterState.js`)
- **Health Management**: Max hit points integration
- **Score Tracking**: Battle performance metrics
- **State Factory**: Default fighter state creation

## 🎯 Key Features

### Combat System
- **6-Button Layout**: Light/Medium/Heavy punches and kicks
- **Hit Detection**: Precise collision boxes for head, body, feet
- **Damage System**: Strength-based damage (12/20/28 HP)
- **Knockback**: Velocity-based hit reactions
- **Health Regeneration**: 6-second delay recovery system

### Animation System
- **Frame-Based**: Sprite sheet animation with timing control
- **State-Driven**: Animation tied to fighter states
- **Smooth Transitions**: Frame delay management for fluid movement

### Audio Integration
- **Contextual Audio**: Attack sounds vary by strength
- **Hit Feedback**: Different sounds for punch/kick hits
- **Music Management**: Scene-appropriate background music
- **Volume Control**: Global and individual sound control

### Visual Effects
- **Hit Splashes**: Visual impact feedback (Light/Medium/Heavy)
- **Screen Shake**: Impact-based screen effects
- **Transition Effects**: Scene change animations
- **Health Visualization**: Dynamic health bar updates

## 🚀 Performance Considerations

- **60 FPS Target**: Consistent frame timing
- **Efficient Collision**: Optimized hit detection algorithms
- **Asset Preloading**: HTML-based asset preloading
- **Memory Management**: Efficient entity lifecycle management

## 🎮 Development Setup

### VSCode Configuration (`.vscode/settings.json`)
- **Live Server**: Local development server configuration
- **File Associations**: Proper file type handling

### Browser Compatibility
- **Modern Browsers**: ES6+ module support required
- **Canvas API**: HTML5 canvas rendering
- **Audio API**: Web Audio support for sound effects

---

This index provides a comprehensive overview of the Interactive 2D Combat Engine codebase, covering all major systems, components, and assets. The engine demonstrates professional game development practices with clean architecture, efficient performance, and extensible design patterns.