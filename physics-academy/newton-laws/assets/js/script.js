// ============================================================
// physics-academy/newton-laws/assets/js/script.js
// Controls the interactive Python calculator using Pyodide
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const runButton = document.getElementById('run-button');
    const outputDiv = document.getElementById('output');

    // ---- The Python code template with placeholders ----
    const pythonCodeTemplate = `
# Physics Calculator: Acceleration on a Rough Horizontal Surface

# --- Input Parameters (from webpage) ---
mass = MASS_PLACEHOLDER
applied_force = FORCE_PLACEHOLDER
coefficient_kinetic_friction = FRICTION_PLACEHOLDER
g = 9.81

# --- Calculations ---
gravitational_force = mass * g
normal_force = gravitational_force

kinetic_friction_force = coefficient_kinetic_friction * normal_force

if applied_force <= kinetic_friction_force:
    net_force = 0.0
    acceleration = 0.0
else:
    net_force = applied_force - kinetic_friction_force
    acceleration = net_force / mass

# --- Output ---
print("=" * 45)
print("     PHYSICS PROBLEM SOLVER")
print("=" * 45)
print(f"  Mass:                    {mass:.2f} kg")
print(f"  Applied Force:           {applied_force:.2f} N")
print(f"  Coefficient of Friction: {coefficient_kinetic_friction:.2f}")
print(f"  Gravitational Force:     {gravitational_force:.2f} N")
print(f"  Normal Force:            {normal_force:.2f} N")
print(f"  Kinetic Friction Force:  {kinetic_friction_force:.2f} N")
print(f"  Net Force:               {net_force:.2f} N")
print("-" * 45)
print(f"  ► ACCELERATION:          {acceleration:.2f} m/s²")
print("=" * 45)
`;

    // ---- Main calculation function ----
    async function runPythonCode() {
        // 1. Get values from input fields
        const mass = parseFloat(document.getElementById('mass').value);
        const appliedForce = parseFloat(document.getElementById('applied-force').value);
        const coeffFriction = parseFloat(document.getElementById('coeff-friction').value);

        // 2. Validate input
        if (isNaN(mass) || isNaN(appliedForce) || isNaN(coeffFriction) ||
            mass <= 0 || appliedForce < 0 || coeffFriction < 0) {
            outputDiv.textContent = '⚠️ Please enter valid positive numbers for all fields.';
            return;
        }

        // 3. Inject values into the Python code
        const pythonCode = pythonCodeTemplate
            .replace(/MASS_PLACEHOLDER/g, mass)
            .replace(/FORCE_PLACEHOLDER/g, appliedForce)
            .replace(/FRICTION_PLACEHOLDER/g, coeffFriction);

        // 4. Show loading state
        outputDiv.textContent = '⏳ Loading Python environment... (first time may take 5–10 seconds)';

        try {
            // 5. Load Pyodide (cached after first load)
            const pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'
            });

            // 6. Capture Python print() output
            pyodide.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()
            `);

            // 7. Execute the main code
            pyodide.runPython(pythonCode);

            // 8. Retrieve captured output
            const result = pyodide.runPython(`
output = sys.stdout.getvalue()
sys.stdout = old_stdout
output
            `);

            // 9. Display the output
            outputDiv.textContent = result;

        } catch (error) {
            console.error('Pyodide error:', error);
            outputDiv.textContent = `❌ An error occurred:\n${error.message || error}`;
        }
    }

    // ---- Attach event listener ----
    runButton.addEventListener('click', runPythonCode);
});