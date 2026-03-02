/**
 * "Stratified Depths"
 *
 * Algorithmic art for "Beyond Shallow Competence: Building Engineering Intuition in the AI Era"
 *
 * A vertical stratigraphy of understanding — surface particles shimmer with
 * shallow competence while deep particles build intricate, lasting networks.
 * Five gravitational anchors (key insights) create wells of accumulated knowledge.
 * The 45-point sentiment divergence drives chromatic tension: warm ambers above,
 * cool teals below, with turbulent mixing at the controversial boundary.
 */
import type p5 from 'p5'
import type { ReadingListArtData } from '../core/types'

// ---------- Internal types (not exported, sketch-local) ----------

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  depth: number // 0 = surface, 1 = deep
  trail: Array<{ x: number; y: number }>
  hue: number
  saturation: number
  brightness: number
  alpha: number
  maxTrailLength: number
  settled: boolean
}

type Anchor = {
  x: number
  y: number
  strength: number
}

// ---------- Sketch ----------

export function sketch(p: p5, data: ReadingListArtData): void {
  const SIZE = 800
  const PARTICLE_COUNT = Math.max(200, (data.hnScore ?? 35) * 15)
  const ANCHOR_COUNT = data.keyPointCount || 5
  const CONTROVERSY = (data.controversyScore ?? 50) / 100 // 0-1
  const SENT_ARTICLE = (data.sentimentArticle ?? 0) / 100 // -1 to 1
  const SENT_COMMUNITY = (data.sentimentCommunity ?? 0) / 100 // -1 to 1
  const DIVERGENCE = Math.abs(SENT_ARTICLE - SENT_COMMUNITY) // 0-2
  const TOPIC_COUNT = data.topics.length || 1

  let particles: Particle[] = []
  let anchors: Anchor[] = []
  let frameCount = 0
  const seed = hashString(data.slug)

  // Warm palette (article sentiment: cautious optimism)
  const WARM_HUES = [25, 30, 35, 40, 15] // ambers, oranges, golds
  // Cool palette (community sentiment: skepticism)
  const COOL_HUES = [190, 200, 210, 220, 180] // teals, slates, deep blues
  // Boundary palette
  const BOUNDARY_HUES = [280, 300, 320, 340] // violets, dusky roses

  function hashString(s: string): number {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  function initAnchors() {
    anchors = []
    for (let i = 0; i < ANCHOR_COUNT; i++) {
      // Distribute anchors with some randomness, biased toward deeper regions
      anchors.push({
        x: p.random(SIZE * 0.15, SIZE * 0.85),
        y: p.random(SIZE * 0.3, SIZE * 0.85),
        strength: p.random(0.3, 1.0),
      })
    }
  }

  function createParticle(): Particle {
    // All particles start near the surface
    const startDepth = p.random(0, 0.15)
    const hueSet = WARM_HUES
    const hue = hueSet[Math.floor(p.random(hueSet.length))]

    return {
      x: p.random(SIZE),
      y: p.random(SIZE * 0.05, SIZE * 0.2),
      vx: p.random(-0.5, 0.5),
      vy: p.random(0.1, 0.5),
      depth: startDepth,
      trail: [],
      hue,
      saturation: p.random(50, 80),
      brightness: p.random(70, 95),
      alpha: p.random(0.3, 0.8),
      maxTrailLength: Math.floor(p.map(startDepth, 0, 1, 3, 40)),
      settled: false,
    }
  }

  function getNoiseFlow(x: number, y: number, depth: number): { fx: number; fy: number } {
    // Surface: high frequency, turbulent
    // Deep: low frequency, coherent
    const surfaceScale = 0.008
    const deepScale = 0.002
    const scale = p.lerp(surfaceScale, deepScale, depth)

    const timeOffset = frameCount * 0.003

    // Base flow
    let angle = p.noise(x * scale, y * scale, timeOffset) * p.TWO_PI * 2

    // Add turbulence at the boundary zone (depth 0.3-0.6)
    const boundaryProximity = 1 - Math.abs(depth - 0.45) / 0.25
    if (boundaryProximity > 0) {
      const turbulence = p.noise(x * 0.015, y * 0.015, timeOffset * 2) * p.TWO_PI
      angle += turbulence * boundaryProximity * CONTROVERSY * 1.5
    }

    const magnitude = p.lerp(1.5, 0.3, depth) // surface = fast, deep = slow

    return {
      fx: p.cos(angle) * magnitude,
      fy: p.sin(angle) * magnitude + p.lerp(0.3, 0.05, depth), // slight downward drift
    }
  }

  function updateParticleColor(particle: Particle) {
    // Color shifts with depth: warm → boundary → cool
    const d = particle.depth

    if (d < 0.3) {
      // Surface: warm ambers
      particle.hue = WARM_HUES[Math.floor(p.random(WARM_HUES.length))]
      particle.brightness = p.lerp(90, 75, d / 0.3)
    } else if (d < 0.6) {
      // Boundary: violets and roses (where views collide)
      const t = (d - 0.3) / 0.3
      particle.hue = BOUNDARY_HUES[Math.floor(p.random(BOUNDARY_HUES.length))]
      particle.saturation = p.lerp(60, 45, t)
      particle.brightness = p.lerp(75, 65, t)
    } else {
      // Deep: cool teals
      particle.hue = COOL_HUES[Math.floor(p.random(COOL_HUES.length))]
      particle.brightness = p.lerp(65, 45, (d - 0.6) / 0.4)
      particle.saturation = p.lerp(50, 70, (d - 0.6) / 0.4)
    }

    // More topics = more chromatic variation
    particle.hue += p.random(-TOPIC_COUNT * 2, TOPIC_COUNT * 2)
  }

  function updateParticle(particle: Particle) {
    // Save trail position
    particle.trail.push({ x: particle.x, y: particle.y })
    if (particle.trail.length > particle.maxTrailLength) {
      particle.trail.shift()
    }

    // Get flow field influence
    const flow = getNoiseFlow(particle.x, particle.y, particle.depth)

    // Anchor attraction (stronger for deeper particles)
    let ax = 0
    let ay = 0
    for (const anchor of anchors) {
      const dx = anchor.x - particle.x
      const dy = anchor.y - particle.y
      const distSq = dx * dx + dy * dy
      const dist = Math.sqrt(distSq)
      if (dist > 10 && dist < 250) {
        const force = (anchor.strength * particle.depth * 0.15) / dist
        ax += dx * force
        ay += dy * force
      }
    }

    // Update velocity with flow + anchors
    particle.vx = particle.vx * 0.92 + flow.fx * 0.06 + ax
    particle.vy = particle.vy * 0.92 + flow.fy * 0.06 + ay

    // Speed limit based on depth
    const maxSpeed = p.lerp(2.0, 0.5, particle.depth)
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
    if (speed > maxSpeed) {
      particle.vx = (particle.vx / speed) * maxSpeed
      particle.vy = (particle.vy / speed) * maxSpeed
    }

    // Update position
    particle.x += particle.vx
    particle.y += particle.vy

    // Gradually deepen over time — some particles descend, others stay shallow
    // Divergence affects how many descend (more divergence = more stratification)
    if (!particle.settled && p.random() < 0.003 * (1 + DIVERGENCE)) {
      particle.depth = Math.min(1, particle.depth + p.random(0.002, 0.008))
      particle.maxTrailLength = Math.floor(p.map(particle.depth, 0, 1, 3, 40))

      // Periodically update color as depth changes
      if (p.random() < 0.1) {
        updateParticleColor(particle)
      }
    }

    // Deep particles near anchors can settle
    if (particle.depth > 0.7) {
      for (const anchor of anchors) {
        const dx = anchor.x - particle.x
        const dy = anchor.y - particle.y
        if (dx * dx + dy * dy < 60 * 60) {
          particle.settled = true
          particle.vx *= 0.95
          particle.vy *= 0.95
          break
        }
      }
    }

    // Wrap edges horizontally, constrain vertically
    if (particle.x < 0) particle.x = SIZE
    if (particle.x > SIZE) particle.x = 0
    if (particle.y < 0) particle.y = 10
    if (particle.y > SIZE) particle.y = SIZE - 10
  }

  function drawParticle(particle: Particle) {
    p.colorMode(p.HSB, 360, 100, 100, 1)

    // Draw trail
    if (particle.trail.length > 1) {
      p.noFill()
      for (let i = 1; i < particle.trail.length; i++) {
        const t = i / particle.trail.length
        const trailAlpha = particle.alpha * t * p.lerp(0.15, 0.5, particle.depth)
        p.stroke(particle.hue, particle.saturation, particle.brightness, trailAlpha)
        p.strokeWeight(p.lerp(0.5, 1.5, particle.depth) * t)
        p.line(
          particle.trail[i - 1].x,
          particle.trail[i - 1].y,
          particle.trail[i].x,
          particle.trail[i].y
        )
      }
    }

    // Draw particle head
    const headSize = p.lerp(1.5, 3, particle.depth)
    const headAlpha = particle.alpha * (particle.settled ? 0.6 : 0.9)
    p.noStroke()
    p.fill(particle.hue, particle.saturation, particle.brightness, headAlpha)
    p.ellipse(particle.x, particle.y, headSize, headSize)
  }

  // ---------- p5 lifecycle ----------

  p.setup = () => {
    p.createCanvas(SIZE, SIZE)
    p.randomSeed(seed)
    p.noiseSeed(seed)
    p.colorMode(p.HSB, 360, 100, 100, 1)

    initAnchors()

    // Initialize particles
    particles = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle())
    }
  }

  p.draw = () => {
    // Very subtle background fade for trail persistence
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.fill(250, 249, 245, 0.04) // Warm near-white with low opacity
    p.noStroke()
    p.rect(0, 0, SIZE, SIZE)

    frameCount++

    // Update and draw all particles
    for (const particle of particles) {
      updateParticle(particle)
      drawParticle(particle)
    }

    // Stop animating after composition stabilizes
    if (frameCount > 600) {
      p.noLoop()
    }
  }
}
