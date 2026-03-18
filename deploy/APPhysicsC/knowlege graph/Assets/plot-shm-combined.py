import numpy as np
import matplotlib.pyplot as plt

fig = plt.figure(figsize=(8, 9), dpi=100)

# First subplot: x(t), v(t), a(t)
ax1 = fig.add_subplot(2, 1, 1)
t = np.linspace(0, 2*np.pi, 200)
A = 1
omega = 1
x = A * np.cos(omega * t)
v = -A * omega * np.sin(omega * t)
a = -A * omega**2 * np.cos(omega * t)

ax1.plot(t, x, 'b-', linewidth=2, label=r'$x(t) = A\cos(\omega t)$')
ax1.plot(t, v, 'g-', linewidth=2, label=r'$v(t) = -A\omega \sin(\omega t)$')
ax1.plot(t, a, 'r-', linewidth=2, label=r'$a(t) = -A\omega^2 \cos(\omega t)$')
ax1.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax1.set_xticklabels(['$0$', r'$T/4$', r'$T/2$', r'$3T/4$', r'$T$'])
ax1.set_xlabel(r'$t$', fontsize=12)
ax1.set_ylim(-1.3*A*omega**2, 1.3*A*omega**2)
ax1.grid(True, alpha=0.3)
ax1.axhline(y=0, color='k', linewidth=1)
ax1.legend(loc='upper right', fontsize=12)

# Second subplot: Energy vs x
ax2 = fig.add_subplot(2, 1, 2)
x = np.linspace(-A, A, 200)
k = 1
K = 0.5 * k * (A**2 - x**2)
U = 0.5 * k * x**2
E = 0.5 * k * A**2 * np.ones_like(x)

ax2.plot(x, K, 'b-', linewidth=2, label=r'Kinetic Energy $K(x)$')
ax2.plot(x, U, 'r-', linewidth=2, label=r'Potential Energy $U(x)$')
ax2.plot(x, E, 'k--', linewidth=2, label=r'Total Energy $E$')
ax2.set_xticks([-A, 0, A])
ax2.set_xticklabels(['$-A$', '$0$', '$+A$'])
ax2.set_xlabel(r'$x$', fontsize=12)
ax2.set_ylabel('Energy', fontsize=12)
ax2.set_ylim(0, 0.6 * k * A**2)
ax2.grid(True, alpha=0.3)
ax2.legend(loc='upper right', fontsize=12)

fig.tight_layout()
plt.savefig('/home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-combined-mpl.svg', format='svg', bbox_inches='tight')
plt.close()

print("Done! Generated: /home/yorkgf/Documents/Obsidian Vault/AP Physics C/Assets/shm-combined-mpl.svg")
