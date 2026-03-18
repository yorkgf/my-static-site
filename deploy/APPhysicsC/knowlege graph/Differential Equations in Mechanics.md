# Differential Equations in Mechanics

Many problems in AP Physics C Mechanics involve solving differential equations to find position, velocity, or other quantities as functions of time. This note covers the two primary methods for solving first-order differential equations encountered in mechanics: separation of variables and integrating factors.

## First-Order Linear Differential Equations

The standard form:
$$\frac{dy}{dt} + P(t)y = Q(t)$$

In mechanics, $y$ often represents velocity $v(t)$ or position $x(t)$, and $t$ is time.

---

## Method 1: Separation of Variables

### When to Use
Use when you can rewrite the equation so that all terms involving $y$ are on one side and all terms involving $t$ are on the other.

### General Form
$$\frac{dy}{dt} = f(y) \cdot g(t)$$

Can be separated as:
$$\frac{dy}{f(y)} = g(t)\, dt$$

### Steps
1. Rearrange: $\frac{dy}{f(y)} = g(t)\, dt$
2. Integrate both sides: $\int \frac{dy}{f(y)} = \int g(t)\, dt$
3. Solve for $y(t)$
4. Apply initial conditions to find constants

### Example 1: Velocity with Linear Drag
A sphere falling through air with drag force $F_d = -bv$:

$$m\frac{dv}{dt} = mg - bv$$

Separating variables:
$$\frac{dv}{mg - bv} = \frac{dt}{m}$$

Integrating:
$$-\frac{1}{b}\ln|mg - bv| = \frac{t}{m} + C$$

With $v(0) = 0$:
$$v(t) = \frac{mg}{b}\left(1 - e^{-\frac{bt}{m}}\right)$$

As $t \to \infty$: $v \to v_{terminal} = \frac{mg}{b}$

### Example 2: Radioactive Decay Analogy
The same mathematics applies to RC circuits and radioactive decay:

$$\frac{dN}{dt} = -\lambda N \quad \Rightarrow \quad N(t) = N_0 e^{-\lambda t}$$

---

## Method 2: Integrating Factors

### When to Use
Use for first-order linear equations of the form:
$$\frac{dy}{dt} + P(t)y = Q(t)$$

When separation is difficult or impossible.

### The Integrating Factor
$$\mu(t) = e^{\int P(t)\, dt}$$

### Steps
1. Identify $P(t)$ and $Q(t)$
2. Calculate integrating factor: $\mu(t) = e^{\int P(t)\, dt}$
3. Multiply both sides by $\mu(t)$:
   $$\mu(t)\frac{dy}{dt} + \mu(t)P(t)y = \mu(t)Q(t)$$
4. Left side becomes $\frac{d}{dt}[\mu(t)y]$:
   $$\frac{d}{dt}[\mu(t)y] = \mu(t)Q(t)$$
5. Integrate both sides:
   $$\mu(t)y = \int \mu(t)Q(t)\, dt + C$$
6. Solve for $y$:
   $$y = \frac{1}{\mu(t)}\left(\int \mu(t)Q(t)\, dt + C\right)$$

### Example: RL Circuit Analogy
In an RL circuit:
$$L\frac{di}{dt} + Ri = \mathcal{E}$$

Standard form:
$$\frac{di}{dt} + \frac{R}{L}i = \frac{\mathcal{E}}{L}$$

Integrating factor:
$$\mu(t) = e^{\int \frac{R}{L} dt} = e^{\frac{Rt}{L}}$$

Solution:
$$i(t) = \frac{\mathcal{E}}{R}\left(1 - e^{-\frac{Rt}{L}}\right)$$

---

## Comparison of Methods

| Method | Best For | Key Step |
|--------|----------|----------|
| Separation of Variables | $\frac{dy}{dt} = f(y)g(t)$ | Separate then integrate |
| Integrating Factor | Linear: $\frac{dy}{dt} + P(t)y = Q(t)$ | Multiply by $\mu(t) = e^{\int P dt}$ |

---

## Key Insights for Mechanics

### Terminal Velocity
Many drag problems lead to solutions of the form:
$$v(t) = v_{\infty} + (v_0 - v_{\infty})e^{-t/\tau}$$

Where:
- $v_{\infty}$ = terminal velocity
- $\tau$ = time constant
- $v_0$ = initial velocity

### Time Constants
The characteristic time $\tau = \frac{m}{b}$ (for linear drag) determines how quickly the system approaches terminal velocity.

- After $t = \tau$: $v$ is within $37\%$ of terminal
- After $t = 3\tau$: $v$ is within $5\%$ of terminal
- After $t = 5\tau$: $v$ is within $1\%$ of terminal

---

## Common Mistakes to Avoid

1. **Forgetting absolute values in logarithms**: $\ln|mg - bv|$, not $\ln(mg - bv)$
2. **Sign errors**: Be consistent with direction (e.g., upward positive)
3. **Initial conditions**: Apply after finding general solution, not before integration
4. **Units**: Check that exponents are dimensionless ($\frac{bt}{m}$ has units of 1)
5. **Assuming separation always works**: Some equations require integrating factors

---

## Worked Examples

### Example 1: Sphere with Air Resistance
- **File:** [[Example 1 - Sphere with Air Resistance]]
- **Method:** Separation of variables
- **Key Equation:** $\frac{dv}{dt} = -g - \frac{b}{m}v$

### Example 2: Box with Time-Varying Force
- **File:** [[Example 2 - Box with Time-Varying Force]]
- **Method:** Direct integration (special case where $\frac{dv}{dt} = f(t)$)
- **Key Equation:** $\frac{dv}{dt} = \frac{F_0}{M}e^{-Bt} - \mu_k g$

### Example 3: Stone in Water
- **File:** [[Example 3 - Stone in Water]]
- **Method:** Separation of variables for velocity-dependent drag
- **Key Equation:** $\frac{dv}{dt} = g - \frac{B}{m} - \frac{k}{m}v$

---

## Related Concepts
- [[Friction Forces]] - Applications in damped motion
- [[Atwood Machine]] - Variable mass systems
- Terminal Velocity
- Exponential Decay
- RC and RL Circuits (electrical analogies)

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]

## Source
AP Physics C - Mechanics
