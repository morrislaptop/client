import GameManager from '../../declarations/src/Backend/GameLogic/GameManager'
import GameUIManager from '../../declarations/src/Backend/GameLogic/GameUIManager'
import { LocationId, Planet, PlanetLevel, PlanetType } from '@darkforest_eth/types';
import { ArtifactTypes, availableEnergy, availableSilver, energy, enoughEnergyToProspect, getClosestPlanet, getIncomingMoves, getMinimumEnergyNeeded, getMyPlanets, getMyPlanetsInRange, getPendingEnergy, getPlanetMaxRank, getPlanetRank, getSilverRequiredForNextUpgrade, hasBeenProspected, hasCannon, isAsteroid, isEnemy, isFoundry, isFoundry, isMine, isUnowned, Move, planetCanAcceptMove, planetName, PlanetTypes, planetWillHaveMinEnergyAfterMove } from '../utils';
import { PlanetEventType } from 'src/_types/darkforest/api/ContractsAPITypes';
import { config } from '../config'

declare const df: GameManager
declare const ui: GameUIManager

export function mineAndBigger(from: Planet, candidate: Planet) {
  const isBigger = candidate.planetLevel > from.planetLevel;
  const isPlanet = candidate.planetType === PlanetTypes.PLANET;

  return isMine(candidate) && isBigger && isPlanet
}

// @todo unqueued move doesn't have energyArriving?
function getPlanetIncomingEnergy(planet: Planet) {
  // @ts-ignore
  const future = getIncomingMoves(planet).reduce((total, m) => total + (m.energyArriving), 0)

  return future
}

// energyCap - energy - energyIncoming + energyOutgoing
function maxEnergyToReceive(to: Planet) {
  return Math.ceil(to.energyCap - to.energy - getPlanetIncomingEnergy(to) + getPendingEnergy(to))
}

interface localConfig {
  fromId?: LocationId,
  fromMinLevel: PlanetLevel,
  fromMaxLevel: PlanetLevel,
}
export function attackEnergy(localConfig: localConfig)
{
  const from = getMyPlanets()
    .filter(p => p.planetLevel >= localConfig.fromMinLevel)
    .filter(p => p.planetLevel <= localConfig.fromMaxLevel)
    // .filter(p => ! hasCannon(p))
    .filter(p => {
      const planetOrRip = [PlanetTypes.PLANET, PlanetTypes.RIP, PlanetTypes.ASTEROID].includes(p.planetType)
      const usedFoundry = isFoundry(p) && hasBeenProspected(p)

      return planetOrRip || usedFoundry
    })
    .filter(p => energy(p) > 75)
    .filter(p => ! localConfig.fromId || p.locationId === localConfig.fromId)

  console.log('Attacking energy from', from)

  const movesToMake: Move[] = from.map(from => {

    // When 75% energy, send 50% of it.. 37.5% left optimum for S curve
    const energyFrom = Math.floor(0.5 * from.energy)

    const to = getClosestPlanet(from, p => {
      const unownedAndWant = isUnowned(p) && p.planetLevel >= (from.planetLevel-1) && p.planetType !== PlanetTypes.QUASAR;
      const enemyAndWant = isEnemy(p) && p.planetLevel >= (from.planetLevel-1) && p.planetType !== PlanetTypes.QUASAR;

      return unownedAndWant || enemyAndWant;
    })

    if (! to) return null

    const dist = df.getDist(from.locationId, to.locationId)

    return {
      from,
      to,
      fromName: planetName(from),
      toName: planetName(to),
      energy: energyFrom,
      energyArriving: df.getEnergyArrivingForMove(from.locationId, to.locationId, dist, energyFrom)
    }
  })

  // Make the moves with the MOST energy first.
  const movesToMake2 = movesToMake.filter(m => m).sort((a, b) => b.energyArriving - a.energyArriving)

  console.log('Attacking energy to ', movesToMake2)

  const moves = movesToMake2.map(move => {
    if (
      planetCanAcceptMove(move.to)
      && df.getUnconfirmedMoves().length < 50
    ) {
      console.log(`SENDING ${move.energy} energy to ${planetName(move.to)} (ui.centerLocationId('${move.to.locationId}')) FROM ${planetName(move.from)} (ui.centerLocationId('${move.from.locationId}'))`)
      return df.move(move.from.locationId, move.to.locationId, move.energy, 0);
    }
  })

  return moves
}
