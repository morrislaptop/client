import { LocationId, PlanetLevel, WorldLocation } from "@darkforest_eth/types";
import { QuadTree, Box, Point } from "js-quadtree";
import { QuadTreeConfig } from "js-quadtree/dist/types";
import { Radii } from "./ViewportEntities";

/**
 * For every point in each of the planet quadtrees, we store a pointer to the planet.
 */
interface PlanetPointData {
  locationId: LocationId;
}

/**
 * Data structure which allows us to efficiently query for "which planets between level X and X + n
 * (for positive n) are present in the given world rectangle", as well as, in the future, "which
 * chunks are visible in the vieport".
 */
export class LayeredMap {
  private perLevelPlanetQuadtrees: Map<number, QuadTree>;
  private insertedLocations: Set<LocationId>;

  public constructor(worldRadius: number) {
    // multiply by 3 in case the world expands while you're playing the game. three should be
    // enough.
    worldRadius *= 4;
    const worldSize = new Box(
      -worldRadius,
      -worldRadius,
      worldRadius * 2,
      worldRadius * 2
    );

    this.perLevelPlanetQuadtrees = new Map();
    this.insertedLocations = new Set();

    for (let i = PlanetLevel.MIN; i <= PlanetLevel.MAX; i++) {
      const config: QuadTreeConfig = {
        maximumDepth: i <= 3 ? 15 : 10,
        removeEmptyNodes: true,
      };

      this.perLevelPlanetQuadtrees.set(i, new QuadTree(worldSize, config));
    }
  }

  /**
   * Records the fact that there is a planet at the given world location.
   */
  public insertPlanet(location: WorldLocation, planetLevel: number) {
    if (this.insertedLocations.has(location.hash)) {
      return;
    }
    const quadTree = this.perLevelPlanetQuadtrees.get(planetLevel);
    const newPointData: PlanetPointData = { locationId: location.hash };
    quadTree?.insert(
      new Point(location.coords.x, location.coords.y, newPointData)
    );
    this.insertedLocations.add(location.hash);
  }

  /**
   * Gets the ids of all the planets that are both within the given bounding box (defined by its bottom
   * left coordinate, width, and height) in the world and of a level that was passed in via the
   * `planetLevels` parameter.
   */
  public getPlanets(
    worldX: number,
    worldY: number,
    worldWidth: number,
    worldHeight: number,
    planetLevels: number[],
    planetLevelToRadii: Map<number, Radii>
  ): LocationId[] {
    const result: LocationId[] = [];

    for (const level of planetLevels) {
      const radiusPx = planetLevelToRadii.get(level)?.radiusWorld as number;
      const boundsIncrease = radiusPx * 5;

      const bounds = new Box(
        worldX - boundsIncrease,
        worldY - boundsIncrease,
        worldWidth + boundsIncrease * 2,
        worldHeight + boundsIncrease * 2
      );

      const planets =
        this.perLevelPlanetQuadtrees
          .get(level)
          ?.query(bounds)
          .map((p) => (p.data as PlanetPointData).locationId) || [];

      result.push(...planets);
    }

    return result;
  }
}
