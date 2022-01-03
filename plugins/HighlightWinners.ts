import {
  Artifact,
  ArtifactId,
  artifactNameFromArtifact,
  ArtifactRarity,
  ArtifactType,
  LocatablePlanet,
  LocationId,
  Planet,
  PlanetLevel,
} from '@darkforest_eth/types'

import { h, render } from 'preact'
import htm from 'htm'
import { useState, useLayoutEffect } from 'preact/hooks'

import GameManager from '@df/GameManager'
import GameUIManager from '@df/GameUIManager'

import { Table } from './Components/Table';
import { Header, Sub, Title } from './components/Text'
import { PlanetLink } from './components/PlanetLink'
import { PlanetsWithEnergy } from './reports/PlanetsWithEnergy'
import { FullSilver } from './reports/FullSilver'
import { ProspectOrFind } from './reports/ProspectOrFind'
import { Cannons } from './reports/Cannons'
import { Upgradable } from './reports/Upgradable'
import { FoundriesToTake } from './reports/FoundriesToTake'
import { UsefulArtifacts } from './reports/UsefulArtifacts'
import { activateArtifacts } from './strategies/ActivateArtifacts'

import { distributeArtifacts } from './strategies/DistributeArtifacts'

import { withdrawArtifacts } from './strategies/WithdrawArtifacts'

import { prospectAndFind } from './strategies/ProspectAndFind'
import { addHours, formatDistanceToNow, fromUnixTime, isAfter, isBefore, subHours } from 'date-fns'
import { isLocatable } from 'src/_types/global/GlobalTypes'
import { ArtifactTypes, canHaveArtifact, closestToCenter, distToCenter, isActivated, isArtifact, isOwned, isUnowned, PlanetTypes } from './utils'
import { EMPTY_ADDRESS } from '@darkforest_eth/constants'

declare const df: GameManager
declare const ui: GameUIManager

const html = htm.bind(h)

let Button = {
  display: 'block'
}

// export function getWinnerPlanets(all: LocatablePlanet[]) {
//   const winners = new Set()
//   const planets = []
//   const claimed = all.filter(p => p.claimer)

//   for (const planet of claimed) {
//     if (isUnowned(planet)) {
//       planets.push(planet)
//     }
//     else if (! winners.has(planet.owner)) {
//       planets.push(planet)
//       winners.add(planet.owner)
//     }

//     if (planets.length >= 63) break
//   }

//   return planets
// }

// export function l5PlanetesWithNoWormhole(mine: LocatablePlanet[]) {
//   return mine
//     .filter(isLocatable)
//     .filter(p => p.planetLevel >= PlanetLevel.FIVE)
//     .filter(p => p.planetType === PlanetTypes.PLANET)
//     .filter(p => {
//       const artifacts = df.getArtifactsWithIds(p.heldArtifactIds).filter(isArtifact)
//       return ! artifacts.some(a => [ArtifactTypes.Wormhole, ArtifactTypes.PhotoidCannon].includes(a.artifactType))
//     })
// }

// export function planetsWithDoubleRange(all: LocatablePlanet[]) {
//   return all
//     .filter(p => p.planetLevel >= PlanetLevel.SIX)
//     .filter(p => p.planetType === PlanetTypes.PLANET)
//     .filter(p => p.bonus[2]) // range bonus
// }

function all() {
  return Array.from(df.getAllPlanets())
  .filter(isLocatable)
  .filter(p => p.planetLevel >= PlanetLevel.THREE)
  .filter(p => ! p.destroyed)
  .sort(closestToCenter)
}

function mine() {
  return df.getMyPlanets()
}

const ripsL3Plus = {
  name: 'Rips L3+',
  color: 'red',
  planets: [],
  callback: function () {
    return all()
      .filter(p => p.planetLevel >= PlanetLevel.THREE)
      .filter(p => p.planetType === PlanetTypes.RIP)
  }
}

const quasarsL4 = {
  name: 'Quasars L4',
  color: 'green',
  planets: [],
  callback: function () {
    return all()
      .filter(p => p.planetLevel === PlanetLevel.FOUR)
      .filter(p => p.planetType === PlanetTypes.QUASAR)
  }
}

const quasarsL6 = {
  name: 'Quasars L6',
  color: 'blue',
  planets: [],
  callback: function () {
    return all()
      .filter(p => p.planetLevel === PlanetLevel.SIX)
      .filter(p => p.planetType === PlanetTypes.QUASAR)
  }
}

const doubleRange = {
  name: 'Double Range',
  color: 'yellow',
  planets: [],
  callback: function () {
    return all()
      .filter(p => p.planetLevel >= PlanetLevel.FOUR)
      // .filter(p => p.planetType === PlanetTypes.PLANET)
      .filter(p => p.bonus[2]) // range bonus
  }
}
const foundries = {
  name: 'Foundries',
  color: 'orange',
  planets: [],
  callback: function () {
    return all().filter(canHaveArtifact).filter(p => p.planetLevel >= 3)
  }
}

const readyToFire = {
  name: 'Fire!',
  color: 'red',
  planets: [],
  callback: function readyToFire() {
      return mine()
        .filter(p => {
          return df.getArtifactsWithIds(p.heldArtifactIds).some(a => {
            const isCannon = a!.artifactType === ArtifactTypes.PhotoidCannon
            const lastActivated = fromUnixTime(a!.lastActivated)
            const readyAt = addHours(lastActivated, 4)
            return isCannon && isActivated(a!) && isAfter(new Date, readyAt)
          })
        })
    }
}

function Toggle({ obj })
{
  const [active, setActive] = useState(false)

  function onClick() {
    if (active) {
      obj.planets = []
      setActive(false)
    }
    else {
      obj.planets = obj.callback()
      setActive(true)
    }
  }

  const ButtonActive = Object.assign({}, Button, {
    backgroundColor: obj.color
  })

  return html`
    <button style=${active ? ButtonActive : Button} onClick=${onClick}>
        ${obj.name}
    </button>
  `;
}

function App() {
  console.log('Running Highlight Winners')

  return html`
    <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
      <${Toggle} all=${all} mine=${mine} obj=${ripsL3Plus}/>
      <${Toggle} all=${all} mine=${mine} obj=${quasarsL4}/>
      <${Toggle} all=${all} mine=${mine} obj=${quasarsL6}/>
      <${Toggle} all=${all} mine=${mine} obj=${doubleRange}/>
      <${Toggle} all=${all} mine=${mine} obj=${foundries}/>
      <${Toggle} all=${all} mine=${mine} obj=${readyToFire}/>
    </div>
  `;
}

function circlePlanet(ctx: CanvasRenderingContext2D, planet: LocatablePlanet, color: string, mul: number = 2)
{
  const viewport = ui.getViewport();

  const radius = ui.getRadiusOfPlanetLevel(planet.planetLevel)

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.setLineDash([15, 5])
  ctx.beginPath();
  ctx.arc(
    viewport.worldToCanvasX(planet.location.coords.x),
    viewport.worldToCanvasY(planet.location.coords.y),
    viewport.worldToCanvasDist(radius * mul),
    0,
    2 * Math.PI
  );
  ctx.stroke();
  ctx.closePath();
}

class HighlightWinners implements DFPlugin {

  container: HTMLDivElement

  constructor() {}

  drawObj(ctx, obj) {
    obj.planets.map(p => circlePlanet(ctx, p, obj.color))
  }

  draw(ctx) {
    ctx.save();

    this.drawObj(ctx, ripsL3Plus)
    this.drawObj(ctx, quasarsL4)
    this.drawObj(ctx, doubleRange)
    this.drawObj(ctx, quasarsL6)
    this.drawObj(ctx, foundries)
    this.drawObj(ctx, readyToFire)

    ctx.restore();
  }

  /**
   * Called when plugin is launched with the "run" button.
   */
  async render(container: HTMLDivElement) {
      this.container = container

      container.style.width = '320px';

      render(html`<${App} />`, container)
  }

  /**
   * Called when plugin modal is closed.
   */
  destroy() {
    render(null, this.container)
    clearInterval(this.loop)
  }
}

/**
 * And don't forget to export it!
 */
export default HighlightWinners;
