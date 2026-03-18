import numpy as np
import matplotlib.pyplot as plt

# Set up the figure for x(t), v(t), a(t)
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(8, 7), dpi=100)
t = np.linspace(0, 2*np.pi, 200)
A = 1
omega = 1

x = A * np.cos(omega * t)
v = -A * omega * np.sin(omega * t)
a = -A * omega**2 * np.cos(omega * t)

# Plot x(t)
ax1.plot(t, x, 'b-', linewidth=2)
ax1.set_ylabel('x(t)')
ax1.set_ylim(-1.2 * A, 1.2 * A)
ax1.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax1.set_xticklabels(['0', 'T/4', 'T/2', '3T/4', 'T'])
ax1.grid(True, alpha=0.3)
ax1.axhline(y=0, color='k', linewidth=1)

# Plot v(t)
ax2.plot(t, v, 'g-', linewidth=2)
ax2.set_ylabel('v(t)')
ax2.set_ylim(-1.2 * A * omega, 1.2 * A * omega)
ax2.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax2.set_xticklabels(['0', 'T/4', 'T/2', '3T/4', 'T'])
ax2.grid(True, alpha=0.3)
ax2.axhline(y=0, color='k', linewidth=1)

# Plot a(t)
ax3.plot(t, a, 'r-', linewidth=2)
ax3.set_xlabel('t')
ax3.set_ylabel('a(t)')
ax3.set_ylim(-1.2 * A * omega**2, 1.2 * A * omega**2)
ax3.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax3.set_xticklabels(['0', 'T/4', 'T/2', '3T/4', 'T'])
ax3.grid(True, alpha=0.3)
ax3.axhline(y=0, color='k', linewidth=1)

fig.tight_layout()
plt.savefig('/home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-xva-mpl.svg', format='svg', bbox_inches='tight')
plt.close()

# Now plot energy vs x
fig2, ax = plt.subplots(1, 1, figsize=(8, 4), dpi=100)
x = np.linspace(-1, 1, 200)
k = 1
A = 1
K = 0.5 * k * (A**2 - x**2)
U = 0.5 * k * x**2
E = 0.5 * k * A**2 * np.ones_like(x)

ax.plot(x, K, 'b-', linewidth=2, label='Kinetic Energy K(x)')
ax.plot(x, U, 'r-', linewidth=2, label='Potential Energy U(x)')
ax.plot(x, E, 'k--', linewidth=2, label='Total Energy E')
ax.set_xlabel('x')
ax.set_ylabel('Energy')
ax.set_ylim(0, 0.6 * k * A**2)
ax.grid(True, alpha=0.3)
ax.legend()

fig.tight_layout()
plt.savefig('/home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-energy-mpl.svg', format='svg', bbox_inches='tight')
plt.close()

print("Done! Generated:")
print("- /home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-xva-mpl.svg")
print("- /home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-energy-mpl.svg")
