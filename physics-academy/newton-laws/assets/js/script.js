// ============================================================
// physics-academy/newton-laws/assets/js/script.js
// Controls the interactive Python calculator with FBD visualization
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const runButton = document.getElementById('run-button');
    const outputDiv = document.getElementById('output');
    const fbdContainer = document.getElementById('fbd-container');

    // ---- The Python code template with placeholders ----
    const pythonCodeTemplate = `
# Physics Calculator: Acceleration on a Rough Horizontal Surface
import matplotlib.pyplot as plt
import io
import base64

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

# --- Free Body Diagram ---
fig, ax = plt.subplots(figsize=(8, 5))
ax.set_xlim(-2, 6)
ax.set_ylim(-2, 3)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('Free Body Diagram', fontsize=14, fontweight='bold', pad=20)

# Draw the object (a box)
rect = plt.Rectangle((1.5, -0.5), 2, 1, fill=True, color='lightblue', edgecolor='black', linewidth=2)
ax.add_patch(rect)
ax.text(2.5, 0, 'm = {mass:.1f} kg', ha='center', va='center', fontsize=10)

# Force: Applied Force (to the right)
arrow_length = min(applied_force / 10, 3)
ax.arrow(3.7, 0, arrow_length, 0, head_width=0.2, head_length=0.15, fc='green', ec='green', linewidth=2)
ax.text(3.7 + arrow_length/2, 0.4, f'F_app = {applied_force:.1f} N', ha='center', color='green', fontsize=10, fontweight='bold')

# Force: Kinetic Friction (to the left)
arrow_length_friction = min(kinetic_friction_force / 10, 3)
if kinetic_friction_force > 0:
    ax.arrow(1.3, 0, -arrow_length_friction, 0, head_width=0.2, head_length=0.15, fc='red', ec='red', linewidth=2)
    ax.text(1.3 - arrow_length_friction/2, -0.5, f'F_friction = {kinetic_friction_force:.1f} N', ha='center', color='red', fontsize=10, fontweight='bold')

# Force: Normal Force (upward)
ax.arrow(2.5, 0.7, 0, 1.0, head_width=0.2, head_length=0.15, fc='blue', ec='blue', linewidth=2)
ax.text(2.5, 1.8, f'N = {normal_force:.1f} N', ha='center', color='blue', fontsize=10, fontweight='bold')

# Force: Gravitational Force (downward)
ax.arrow(2.5, -0.7, 0, -1.0, head_width=0.2, head_length=0.15, fc='purple', ec='purple', linewidth=2)
ax.text(2.5, -1.8, f'F_g = {gravitational_force:.1f} N', ha='center', color='purple', fontsize=10, fontweight='bold')

# Add labels for the forces
ax.text(0, -2.5, 'Directions: Right = Applied Force, Left = Friction', ha='center', color='gray', fontsize=8)
ax.text(0, -2.8, 'Up = Normal Force, Down = Gravitational Force', ha='center', color='gray', fontsize=8)

# Save the figure to a base64 string
buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print("FBD_IMAGE:" + img_base64)
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
            fbdContainer.innerHTML = '';
            return;
        }

        // 3. Inject values into the Python code
        const pythonCode = pythonCodeTemplate
            .replace(/MASS_PLACEHOLDER/g, mass)
            .replace(/FORCE_PLACEHOLDER/g, appliedForce)
            .replace(/FRICTION_PLACEHOLDER/g, coeffFriction);

        // 4. Show loading state
        outputDiv.textContent = '⏳ Loading Python environment... (first time may take 5–10 seconds)';
        fbdContainer.innerHTML = '<p style="color: var(--clr-text-light);">⏳ Generating diagram...</p>';

        try {
            // 5. Load Pyodide (cached after first load)
            const pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'
            });

            // 6. Install matplotlib (required for FBD)
            outputDiv.textContent = '⏳ Loading matplotlib... (this may take a moment)';
            await pyodide.loadPackage('matplotlib');

            // 7. Capture Python print() output
            pyodide.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()
            `);

            // 8. Execute the main code
            pyodide.runPython(pythonCode);

            // 9. Retrieve captured output
            const result = pyodide.runPython(`
output = sys.stdout.getvalue()
sys.stdout = old_stdout
output
            `);

            // 10. Parse the output - look for the FBD_IMAGE marker
            const lines = result.split('\n');
            let textOutput = '';
            let imageBase64 = '';

            for (const line of lines) {
                if (line.startsWith('FBD_IMAGE:')) {
                    imageBase64 = line.substring('FBD_IMAGE:'.length);
                } else {
                    textOutput += line + '\n';
                }
            }

            // 11. Display the text output
            outputDiv.textContent = textOutput.trim();

            // 12. Display the FBD image
            if (imageBase64) {
                fbdContainer.innerHTML = `<img src="data:image/png;base64,${imageBase64}" alt="Free Body Diagram" style="max-width: 100%; border-radius: 8px; border: 1px solid #e9ecef;" />`;
            } else {
                fbdContainer.innerHTML = '<p style="color: var(--clr-text-light);">⚠️ No diagram generated.</p>';
            }

        } catch (error) {
            console.error('Pyodide error:', error);
            outputDiv.textContent = `❌ An error occurred:\n${error.message || error}`;
            fbdContainer.innerHTML = '';
        }
    }

    // ---- Attach event listener ----
    runButton.addEventListener('click', runPythonCode);
});