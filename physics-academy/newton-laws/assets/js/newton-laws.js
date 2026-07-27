// ============================================================
// physics-academy/newton-laws/assets/js/newton-laws.js
// Controls Pyodide execution and matplotlib renderings
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  let pyodideInstance = null;

  // Helper to lazily initialize Pyodide
  async function getPyodide() {
    if (!pyodideInstance) {
      pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
      });
      await pyodideInstance.loadPackage("matplotlib");
      await pyodideInstance.loadPackage("numpy");
    }
    return pyodideInstance;
  }

  // ============================================================
  // PROBLEM 1 HANDLER: Friction & FBD
  // ============================================================
  const runButton = document.getElementById("run-button");
  const outputDiv = document.getElementById("output");
  const fbdContainer = document.getElementById("fbd-container");

  const pythonCodeTemplate1 = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64

mass = MASS_PLACEHOLDER
applied_force = FORCE_PLACEHOLDER
coefficient_kinetic_friction = FRICTION_PLACEHOLDER
g = 9.81

gravitational_force = mass * g
normal_force = gravitational_force
kinetic_friction_force = coefficient_kinetic_friction * normal_force

if applied_force <= kinetic_friction_force:
    net_force = 0.0
    acceleration = 0.0
else:
    net_force = applied_force - kinetic_friction_force
    acceleration = net_force / mass

print("=" * 45)
print("     PHYSICS PROBLEM SOLVER (FRICTION)")
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

fig, ax = plt.subplots(figsize=(7, 4))
ax.set_xlim(-2, 6)
ax.set_ylim(-2.5, 2.5)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('Free Body Diagram', fontsize=12, fontweight='bold')

rect = plt.Rectangle((1.5, -0.5), 2, 1, fill=True, color='lightblue', edgecolor='black', linewidth=1.5)
ax.add_patch(rect)
ax.text(2.5, 0, f'm = {mass:.1f} kg', ha='center', va='center', fontsize=9)

arr_app = min(applied_force / 10, 2.5)
ax.arrow(3.5, 0, arr_app, 0, head_width=0.15, head_length=0.1, fc='green', ec='green', linewidth=1.5)
ax.text(3.5 + arr_app/2, 0.25, f'F_app = {applied_force:.1f}N', ha='center', color='green', fontsize=8, fontweight='bold')

arr_fric = min(kinetic_friction_force / 10, 2.5)
if kinetic_friction_force > 0:
    ax.arrow(1.5, 0, -arr_fric, 0, head_width=0.15, head_length=0.1, fc='red', ec='red', linewidth=1.5)
    ax.text(1.5 - arr_fric/2, -0.35, f'f_k = {kinetic_friction_force:.1f}N', ha='center', color='red', fontsize=8, fontweight='bold')

ax.arrow(2.5, 0.5, 0, 0.8, head_width=0.15, head_length=0.1, fc='blue', ec='blue', linewidth=1.5)
ax.text(2.5, 1.45, f'N = {normal_force:.1f}N', ha='center', color='blue', fontsize=8, fontweight='bold')

ax.arrow(2.5, -0.5, 0, -0.8, head_width=0.15, head_length=0.1, fc='purple', ec='purple', linewidth=1.5)
ax.text(2.5, -1.45, f'Fg = {gravitational_force:.1f}N', ha='center', color='purple', fontsize=8, fontweight='bold')

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=130, bbox_inches='tight')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print("FBD_IMAGE:" + img_base64)
`;

  async function runFrictionCode() {
    const mass = parseFloat(document.getElementById("mass").value);
    const appliedForce = parseFloat(document.getElementById("applied-force").value);
    const coeffFriction = parseFloat(document.getElementById("coeff-friction").value);

    if (isNaN(mass) || isNaN(appliedForce) || isNaN(coeffFriction) || mass <= 0 || appliedForce < 0 || coeffFriction < 0) {
      outputDiv.textContent = "⚠️ Please enter valid non-negative numbers.";
      return;
    }

    const pythonCode = pythonCodeTemplate1
      .replace(/MASS_PLACEHOLDER/g, mass)
      .replace(/FORCE_PLACEHOLDER/g, appliedForce)
      .replace(/FRICTION_PLACEHOLDER/g, coeffFriction);

    outputDiv.textContent = "⏳ Initializing Pyodide environment...";
    fbdContainer.innerHTML = '<p style="color: var(--clr-text-light);">⏳ Generating diagram...</p>';

    try {
      const pyodide = await getPyodide();
      pyodide.runPython(`import sys; from io import StringIO; sys.stdout = StringIO()`);
      pyodide.runPython(pythonCode);
      const result = pyodide.runPython(`out = sys.stdout.getvalue(); sys.stdout = sys.__stdout__; out`);

      const lines = result.split("\n");
      let textOutput = "";
      let imageBase64 = "";

      for (const line of lines) {
        if (line.startsWith("FBD_IMAGE:")) {
          imageBase64 = line.substring("FBD_IMAGE:".length);
        } else {
          textOutput += line + "\n";
        }
      }

      outputDiv.textContent = textOutput.trim();
      if (imageBase64) {
        fbdContainer.innerHTML = `<img src="data:image/png;base64,${imageBase64}" alt="Free Body Diagram" style="max-width: 100%; border-radius: 8px;" />`;
      }
    } catch (err) {
      console.error(err);
      outputDiv.textContent = `❌ Error executing script: ${err.message || err}`;
    }
  }

  if (runButton) runButton.addEventListener("click", runFrictionCode);

  // ============================================================
  // PROBLEM 2 HANDLER: Kinematics Trajectory Plot
  // ============================================================
  const trainRunButton = document.getElementById("run-train-button");
  const trainOutputDiv = document.getElementById("train-output");
  const kinematicsPlotContainer = document.getElementById("kinematics-plot-container");

  const pythonCodeTemplate2 = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import io, base64

v1 = V1_PLACEHOLDER
a = ACCEL_PLACEHOLDER
v2_max = V2MAX_PLACEHOLDER

t1 = v2_max / a
x2_1 = 0.5 * a * (t1**2)
x1_1 = v1 * t1

if x1_1 <= x2_1:
    t_catch = np.sqrt(2 * x1_1 / a)
    x_catch = v1 * t_catch
else:
    delta_x = x1_1 - x2_1
    delta_t = delta_x / (v2_max - v1) if v2_max > v1 else float('inf')
    t_catch = t1 + delta_t
    x_catch = v1 * t_catch

print("=" * 45)
print("     KINEMATICS CATCH-UP SOLVER")
print("=" * 45)
print(f"  Train Constant Speed (v1):   {v1:.2f} m/s")
print(f"  Inspection Car Acceleration: {a:.2f} m/s²")
print(f"  Inspection Car Max Speed:    {v2_max:.2f} m/s")
print(f"  Car Accel Phase Duration:    {t1:.2f} s")
print("-" * 45)
if np.isinf(t_catch):
    print("  ► RESULT: Inspection car never catches the train.")
else:
    print(f"  ► CATCH-UP TIME:             {t_catch:.2f} s")
    print(f"  ► CATCH-UP DISTANCE:         {x_catch:.2f} m")
print("=" * 45)

t_max = max(40.0, t_catch * 1.2 if not np.isinf(t_catch) else 50.0)
t_vec = np.linspace(0, t_max, 300)
x1_vec = v1 * t_vec
x2_vec = np.where(t_vec <= t1, 0.5 * a * (t_vec**2), x2_1 + v2_max * (t_vec - t1))

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(t_vec, x1_vec, label="Train", color="crimson", linewidth=2)
ax.plot(t_vec, x2_vec, label="Inspection Car", color="navy", linewidth=2)

if not np.isinf(t_catch):
    ax.axvline(x=t_catch, color="gray", linestyle="--", alpha=0.7)
    ax.plot(t_catch, x_catch, "go", markersize=7, label=f"Catch point ({t_catch:.1f}s, {x_catch:.0f}m)")

ax.set_title("Catch-Up Kinematics Position-Time Graph", fontsize=11, fontweight="bold")
ax.set_xlabel("Time (s)", fontsize=9)
ax.set_ylabel("Position (m)", fontsize=9)
ax.grid(True, linestyle=":", alpha=0.6)
ax.legend(fontsize=8)

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=130, bbox_inches='tight')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

print("PLOT_IMAGE:" + img_base64)
`;

  async function runKinematicsCode() {
    const v1 = parseFloat(document.getElementById("train-speed").value);
    const a = parseFloat(document.getElementById("car-accel").value);
    const v2Max = parseFloat(document.getElementById("car-vmax").value);

    if (isNaN(v1) || isNaN(a) || isNaN(v2Max) || v1 <= 0 || a <= 0 || v2Max <= 0) {
      trainOutputDiv.textContent = "⚠️ Please enter valid positive values for all kinematics inputs.";
      return;
    }

    const pythonCode = pythonCodeTemplate2
      .replace(/V1_PLACEHOLDER/g, v1)
      .replace(/ACCEL_PLACEHOLDER/g, a)
      .replace(/V2MAX_PLACEHOLDER/g, v2Max);

    trainOutputDiv.textContent = "⏳ Computing trajectory vectors...";
    kinematicsPlotContainer.innerHTML = '<p style="color: var(--clr-text-light);">⏳ Generating trajectory plot...</p>';

    try {
      const pyodide = await getPyodide();
      pyodide.runPython(`import sys; from io import StringIO; sys.stdout = StringIO()`);
      pyodide.runPython(pythonCode);
      const result = pyodide.runPython(`out = sys.stdout.getvalue(); sys.stdout = sys.__stdout__; out`);

      const lines = result.split("\n");
      let textOutput = "";
      let imageBase64 = "";

      for (const line of lines) {
        if (line.startsWith("PLOT_IMAGE:")) {
          imageBase64 = line.substring("PLOT_IMAGE:".length);
        } else {
          textOutput += line + "\n";
        }
      }

      trainOutputDiv.textContent = textOutput.trim();
      if (imageBase64) {
        kinematicsPlotContainer.innerHTML = `<img src="data:image/png;base64,${imageBase64}" alt="Kinematics Plot" style="max-width: 100%; border-radius: 8px;" />`;
      }
    } catch (err) {
      console.error(err);
      trainOutputDiv.textContent = `❌ Error executing script: ${err.message || err}`;
    }
  }

  if (trainRunButton) trainRunButton.addEventListener("click", runKinematicsCode);
});