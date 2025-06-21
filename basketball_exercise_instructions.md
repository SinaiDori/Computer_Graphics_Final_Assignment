# Computer Graphics - Exercise 5

## Interactive Basketball Court with WebGL

Spring Semester 2025

## Overview

In this exercise, you will implement an interactive 3D basketball court
scene using WebGL and Three.js. You will create a realistic basketball
court with hoops, an animated basketball that can be controlled by the
user, and physics-based interactions.

### MANDATORY REQUIREMENTS - HW05 INFRASTRUCTURE

Your implementation **MUST** include ALL of the following infrastructure
elements:

1.  A properly sized basketball court with at least the following court
    markings:
    -   Center circle
    -   Three-point lines for both sides
    -   Center line
2.  Two basketball hoops, each with:
    -   Backboard (white, partially transparent)
    -   Rim (orange) at the correct regulation height
    -   Net implemented with line segments
    -   Support structure (pole and arms) correctly positioned behind
        the backboard
3.  A static basketball with:
    -   Proper orange color and black seams
    -   Positioned at center court
    -   Proper size and geometry
4.  Camera and lighting infrastructure:
    -   Appropriate lighting with shadows
    -   Interactive camera controls (orbit)
    -   Appropriate initial camera positioning
5.  Basic UI framework:
    -   HTML container elements for future score display
    -   HTML container elements for future controls display
    -   Basic CSS styling for UI elements

**Note:** Interactive controls, physics-based movement, basketball
shooting mechanics, rotation animations, and the scoring system will be
implemented in the next exercise (HW06).

### SPECIFIC IMPLEMENTATION DETAILS

Your basketball court must meet these specific requirements:

#### 1. Court Dimensions and Appearance

-   Court floor should be a wooden color (e.g., brown)
-   Court should be rectangular with proportions approximately 2:1
    (length:width)
-   Court lines must be white and clearly visible
-   Three-point lines must be properly curved arcs at both ends
-   Center circle must be correctly positioned at center court

#### 2. Basketball Hoops

-   Rim height must be significantly higher than the court level
    (representing 10 feet height)
-   Backboard must be rectangular, white, and partially transparent
-   Support structures must be positioned BEHIND the backboard, not on
    the court
-   Hoops must face toward center court
-   Each hoop must include at least one support arm connecting the pole
    to the backboard
-   Nets must be created using at least 8 line segments

#### 3. Static Basketball

-   Ball must be orange with black seam lines
-   Ball must be positioned at center court
-   Ball must have proper size and spherical geometry
-   Ball texture/material should be realistic

#### 4. UI Framework Preparation

-   Create HTML containers for future score display
-   Create HTML containers for future controls instructions
-   Implement basic CSS styling for UI elements
-   Position UI elements appropriately on screen
-   Ensure camera controls are toggleable with \'O\' key
:::

### CONTROLS FOR HW05 INFRASTRUCTURE

Your HW05 implementation **MUST** support this control:

-   [O Key]{.highlight}: Toggle orbit camera controls

**Note:** Interactive basketball controls (Arrow Keys, W/S Keys,
Spacebar, R Key) will be implemented in the next exercise (HW06).

### Getting Started with the Starter Code

The starter code provides you with the following:

-   Basic THREE.js setup (scene, camera, renderer)
-   Basic lighting setup with shadows enabled
-   A simple brown court surface without any markings
-   Orbit camera controls that can be toggled with the \'O\' key
-   Basic animation loop

Your task is to build upon this foundation by adding all the required
elements.

### Step-by-Step Implementation Guide

1.  **Study the existing code**

    Examine the starter code to understand the scene setup, camera
    positioning, and orbit controls.

2.  **Add court lines**

    Implement the center line, three-point lines, and center circle as
    white lines on the court surface.

3.  **Create the basketball hoops**

    Implement two hoops with backboards, rims, nets, and support
    structures at both ends of the court.

4.  **Create the static basketball**

    Implement a basketball with proper appearance positioned at center
    court.

5.  **Set up UI framework**

    Create HTML containers and CSS styling for future interactive
    elements.

### Grading Criteria

  Component           Points   Requirements
  ------------------- -------- --------------------------------------------------------------------------
  Basketball Court    20       Proper implementation of court with all required markings
  Basketball Hoops    20       Correct implementation of hoops with all required components
  Static Basketball   20       Properly modeled basketball with correct appearance and positioning
  Camera Controls     10       Orbit camera controls properly implemented and toggleable
  UI Framework        15       HTML containers and CSS styling prepared for future interactive elements
  Code Quality        5        Well-organized, commented, and efficient code

### Additional Infrastructure Challenges (Optional) - Bonus: 10 Points

For students seeking additional challenges in HW05, consider
implementing any of these features for up to 10 bonus points:

-   More detailed court markings (free throw lines, key areas)
-   Textured surfaces for court and basketball
-   Enhanced lighting setup with multiple light sources
-   More detailed hoop models (chain nets, branded backboards)
-   Stadium environment (bleachers, scoreboard)
-   Multiple camera preset positions

**Note:** Physics, interactive controls, and scoring features will be
the focus of the next exercise (HW06).

### Helpful Resources

-   [Three.js Documentation](https://threejs.org/docs/)
-   [Three.js Examples](https://threejs.org/examples/)
-   [Discover Three.js](https://discoverthreejs.com/)

### Submission Requirements

Submit your completed exercise in one of the following ways:

-   **RECOMMENDED: Link to a public GitHub repository** containing your
    code and screenshots
-   Alternative: Zip file containing all files

Your submission must include:

-   All source code files
-   A README.md file explaining:
    -   **MANDATORY: Full names of all group members**
    -   How to run your implementation
    -   Any additional features you implemented
    -   Any known issues or limitations
    -   Sources of any external assets used
-   **MANDATORY: Screenshots of your implementation showing:**
    -   Overall view of the basketball court with hoops
    -   Close-up view of basketball hoops with nets
    -   View showing the basketball positioned at center court
    -   View demonstrating camera controls functionality

**Due Date:** June 22, 2025, 23:59