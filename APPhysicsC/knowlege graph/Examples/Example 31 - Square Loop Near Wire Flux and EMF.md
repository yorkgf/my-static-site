# Example 31: Square Loop Near a Wire — Flux, EMF, and Force

## Problem Statement

(a) Determine the magnetic flux through a square loop of side $a$ if one side is parallel to, and a distance $b$ from, a straight wire that carries a current $I$. (b) If the loop is pulled away from the wire at speed $v$, what emf is induced in it? (c) Does the induced current flow clockwise or counterclockwise? (d) Determine the force $F$ required to pull the loop away.

<img src="../Assets/Figure31.png" width="100%" alt="Figure 31" />
*Figure 31: Square loop (side a) with near side at distance b from a long straight wire carrying current I upward. A ring element dr at distance r is shown.*

---

## Solution

### Part (a): Magnetic Flux

The magnetic field from the wire at distance $r$:
$$B(r) = \frac{\mu_0 I}{2\pi r}$$

Integrating over the square loop (width $a$, near side at $r = b$, far side at $r = b + a$):

$$\Phi = \int_b^{b+a} B(r) \cdot a \, dr = \frac{\mu_0 I a}{2\pi} \int_b^{b+a} \frac{dr}{r}$$

$$\boxed{\Phi = \frac{\mu_0 I a}{2\pi} \ln\!\left(\frac{b+a}{b}\right) = \frac{\mu_0 I a}{2\pi}\ln\!\left(1 + \frac{a}{b}\right)}$$

### Part (b): Induced EMF When Pulled at Speed $v$

As the loop moves away, $b$ increases at rate $\dot{b} = v$:

$$\mathcal{E} = -\frac{d\Phi}{dt} = -\frac{\mu_0 I a}{2\pi} \frac{d}{dt}\left[\ln(b+a) - \ln b\right]$$

$$= -\frac{\mu_0 I a}{2\pi}\left(\frac{v}{b+a} - \frac{v}{b}\right) = -\frac{\mu_0 I a v}{2\pi}\left(\frac{1}{b+a} - \frac{1}{b}\right)$$

$$= -\frac{\mu_0 I a v}{2\pi} \cdot \frac{b - (b+a)}{b(b+a)} = \frac{\mu_0 I a v}{2\pi} \cdot \frac{a}{b(b+a)}$$

$$\boxed{\mathcal{E} = \frac{\mu_0 I a^2 v}{2\pi b(b+a)}}$$

### Part (c): Direction of Induced Current

As the loop moves **away** from the wire:
- The flux $\Phi$ **decreases** (field is weaker farther from the wire)
- By **Lenz's law**, the induced current opposes the decrease — it must maintain the flux
- The wire's field (for current $I$ upward) points **out of the page** to the right of the wire
- To maintain flux **out of the page**, the induced current must create field **out of the page** through the loop
- By the right-hand rule: current flows **counterclockwise** (when viewed from the front)

### Part (d): Force Required to Pull the Loop

The induced current in the loop:
$$I_{ind} = \frac{\mathcal{E}}{R_{loop}}$$

But we can compute force using the power method. The force must overcome the magnetic braking force:

$$P = \mathcal{E}^2 / R_{loop} = F \cdot v$$

$$F = \frac{\mathcal{E}^2}{R_{loop}\, v} = \frac{\mu_0^2 I^2 a^4 v}{4\pi^2 b^2(b+a)^2 R_{loop}}$$

Alternatively, compute forces on individual sides:
- Near side (at $b$, current $I_{ind}$ running **with** $I$): attractive force **toward** wire (opposing the outward motion)
- Far side (at $b+a$, current $I_{ind}$ running **against** $I$): repulsive force **away** from wire (also opposing motion? Let me check)

Actually by Lenz's law, the net force must **oppose** the motion (i.e., directed toward the wire):

$$\boxed{F = \frac{\mu_0^2 I^2 a^4 v}{4\pi^2 b^2(b+a)^2 R_{loop}}}$$

This is the **magnetic braking** force — it equals the power dissipated in the loop ($\mathcal{E}^2/R$) divided by the speed $v$.

---

## Key Concepts

1. **Non-uniform field**: flux requires integration, giving logarithmic result
2. **EMF from motion**: $\mathcal{E} = \mu_0 I a^2 v/[2\pi b(b+a)]$ — decreases as loop moves away
3. **Lenz's law**: induced current is counterclockwise (to maintain outward flux)
4. **Magnetic braking force**: $F \propto v$ — proportional to speed

---

## Related Concepts
- [[Electromagnetic-Induction/Faraday's-Law|Faraday's Law]]
- [[Electromagnetic-Induction/Magnetic-Flux|Magnetic Flux]]
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]

## Related Units
- [[Electromagnetic-Induction/index|Electromagnetic Induction]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 29, Problem 52
