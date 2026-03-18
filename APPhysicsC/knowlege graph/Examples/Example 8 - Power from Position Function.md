# Example 8: Power and Work from Position Function

## Problem Statement

The position of a 280-g object is given (in meters) by:
$$x = 4.0t^3 - 8.0t^2 - 44t$$
where $t$ is in seconds.

Determine:
- **(a)** The net rate of work done on this object at $t = 2.0$ s
- **(b)** The net rate of work done on this object at $t = 4.0$ s
- **(c)** The average net power input during the interval from $t = 0$ s to $t = 2.0$ s, and in the interval from $t = 2.0$ s to $t = 4.0$ s

---

## Solution

### Given Information
- Mass: $m = 280$ g $= 0.280$ kg
- Position: $x(t) = 4.0t^3 - 8.0t^2 - 44t$ (meters)

### Step 1: Find Velocity and Acceleration

**Velocity:**
$$v = \frac{dx}{dt} = 12.0t^2 - 16.0t - 44 \text{ m/s}$$

**Acceleration:**
$$a = \frac{dv}{dt} = 24.0t - 16.0 \text{ m/s}^2$$

### Step 2: Find Force

Using Newton's second law:
$$F = ma = 0.280(24.0t - 16.0) = 6.72t - 4.48 \text{ N}$$

---

## Part (a): Power at $t = 2.0$ s

**Instantaneous power:**
$$P = F \cdot v$$

At $t = 2.0$ s:
$$v(2.0) = 12.0(4) - 16.0(2) - 44 = 48 - 32 - 44 = -28 \text{ m/s}$$

$$F(2.0) = 6.72(2.0) - 4.48 = 13.44 - 4.48 = 8.96 \text{ N}$$

$$P(2.0) = (8.96)(-28) = -251 \text{ W}$$

$$\boxed{P(2.0\text{ s}) = -2.5 \times 10^2 \text{ W} = -250 \text{ W (approx)}}$$

The negative sign indicates that the force is doing negative work (opposing the motion).

---

## Part (b): Power at $t = 4.0$ s

At $t = 4.0$ s:
$$v(4.0) = 12.0(16) - 16.0(4) - 44 = 192 - 64 - 44 = 84 \text{ m/s}$$

$$F(4.0) = 6.72(4.0) - 4.48 = 26.88 - 4.48 = 22.4 \text{ N}$$

$$P(4.0) = (22.4)(84) = 1882 \text{ W}$$

$$\boxed{P(4.0\text{ s}) = 1.9 \times 10^3 \text{ W} = 1900 \text{ W (approx)}}$$

The positive sign indicates that the force is doing positive work (in the direction of motion).

---

## Part (c): Average Power

**Average power:**
$$P_{avg} = \frac{W}{\Delta t} = \frac{\Delta K}{\Delta t}$$

First, find velocities at key times:

At $t = 0$:
$$v(0) = -44 \text{ m/s}$$

At $t = 2.0$:
$$v(2.0) = -28 \text{ m/s}$$

At $t = 4.0$:
$$v(4.0) = 84 \text{ m/s}$$

### Interval $t = 0$ to $t = 2.0$ s:

$$\Delta K = \frac{1}{2}m(v_2^2 - v_0^2) = \frac{1}{2}(0.280)[(-28)^2 - (-44)^2]$$
$$\Delta K = 0.140[784 - 1936] = 0.140(-1152) = -161 \text{ J}$$

$$P_{avg} = \frac{-161}{2.0} = -80.5 \text{ W}$$

$$\boxed{P_{avg}(0 \to 2.0\text{ s}) = -81 \text{ W}}$$

### Interval $t = 2.0$ to $t = 4.0$ s:

$$\Delta K = \frac{1}{2}m(v_4^2 - v_2^2) = \frac{1}{2}(0.280)[(84)^2 - (-28)^2]$$
$$\Delta K = 0.140[7056 - 784] = 0.140(6272) = 878 \text{ J}$$

$$P_{avg} = \frac{878}{2.0} = 439 \text{ W}$$

$$\boxed{P_{avg}(2.0 \to 4.0\text{ s}) = 4.4 \times 10^2 \text{ W}}$$

---

## Summary of Results

| Quantity | Value |
|----------|-------|
| Power at $t = 2.0$ s | $-250$ W |
| Power at $t = 4.0$ s | $+1900$ W |
| Average power (0 to 2.0 s) | $-81$ W |
| Average power (2.0 to 4.0 s) | $+440$ W |

---

## Key Concepts

1. **Instantaneous Power:** $P = \vec{F} \cdot \vec{v} = Fv$ (for 1D motion)
2. **Average Power:** $P_{avg} = \frac{W}{\Delta t} = \frac{\Delta K}{\Delta t}$
3. **Work-Energy Theorem:** The net work equals the change in kinetic energy
4. **Sign Convention:** Positive power means force does work on object; negative means force opposes motion

---

## Related Concepts
- [[Conservation of Energy]]
- Work-Energy Theorem
- Power in Mechanics
- [[Differential Equations in Mechanics]]

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
