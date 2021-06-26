import {
  Planet,
  PlanetType,
  UpgradeBranchName,
  SpaceType,
} from "@darkforest_eth/types";
import React from "react";
import { useMemo } from "react";
import { ProcgenUtils } from "../../Backend/Procedural/ProcgenUtils";
import { Wrapper } from "../../Backend/Utils/Wrapper";
import { StatIdx } from "../../_types/global/GlobalTypes";
import {
  DefenseIcon,
  EnergyGrowthIcon,
  EnergyIcon,
  RangeIcon,
  SilverGrowthIcon,
  SilverIcon,
  SpeedIcon,
} from "../Components/Icons";
import {
  DefenseText,
  EnergyGrowthText,
  PlanetEnergyLabel,
  LevelRankTextEm,
  PlanetBiomeTypeLabelAnim,
  PlanetOwnerLabel,
  RangeText,
  SilverGrowthText,
  PlanetSilverLabel,
  SpeedText,
} from "../Components/Labels/PlanetLabels";
import { PlanetPreview } from "../Components/PlanetPreview";
import { Red } from "../Components/Text";
import { TooltipName } from "../Game/WindowManager";
import { PlanetIcons } from "../Renderers/PlanetscapeRenderer/PlanetIcons";
import { useUIManager, useActiveArtifact } from "../Utils/AppHooks";
import {
  StyledPlanetCard,
  PreviewSection,
  PlanetTag,
  IconsWrapper,
  StatSection,
  BigStatCell,
  RowTip,
  Small,
  StatRow,
  TitleBar,
  TopRow,
  PCStatIcon,
  ArtifactSection,
  PlanetActiveArtifact,
  DestroyedMarker,
} from "./PlanetCardComponents";
import { getPlanetMaxRank } from "../../Backend/Utils/Utils";

function planetCanUpgrade(planet: Planet | undefined): boolean {
  if (!planet) return false;
  const totalRank = planet.upgradeState.reduce((a, b) => a + b);
  if (planet.spaceType === SpaceType.NEBULA && totalRank >= 3) return false;
  if (planet.spaceType === SpaceType.SPACE && totalRank >= 4) return false;
  if (planet.spaceType === SpaceType.DEEP_SPACE && totalRank >= 5) return false;
  if (planet.spaceType === SpaceType.DEAD_SPACE && totalRank >= 5) return false;
  return planet.planetLevel !== 0 && planet.planetType === PlanetType.PLANET;
}

const DestroyedLabel = () => (
  <>
    <Red>DESTROYED</Red>{" "}
  </>
);

/** Preview basic planet information - used in `PlanetContextPane` and `HoverPlanetPane` */
export function PlanetCard({
  planetWrapper: p,
}: {
  planetWrapper: Wrapper<Planet | undefined>;
}) {
  const uiManager = useUIManager();
  const active = useActiveArtifact(p, uiManager);
  const planet = p.value;

  const isSilverMine = useMemo(
    () => p.value?.planetType === PlanetType.SILVER_MINE,
    [p.value?.planetType]
  );

  const destroyed = p.value?.destroyed;

  let canUpgrade = planetCanUpgrade(planet);
  let upgrades;
  if (canUpgrade) {
    const maxRank = getPlanetMaxRank(planet);
    const maxBranchRank = Math.min(4, maxRank);
    const defenseUpgradeState =
      (planet && planet.upgradeState[UpgradeBranchName.Defense]) || 0;
    const rangeUpgradeState =
      (planet && planet.upgradeState[UpgradeBranchName.Range]) || 0;
    const speedUpgradeState =
      (planet && planet.upgradeState[UpgradeBranchName.Speed]) || 0;
    upgrades = (
      <StatRow>
        <Small planet={planet}>Upgrades:</Small>
        <Small planet={planet}>
          {defenseUpgradeState} of {maxBranchRank}
          <DefenseIcon />
        </Small>
        <Small planet={planet}>
          {speedUpgradeState} of {maxBranchRank}
          <SpeedIcon />
        </Small>
        <Small planet={planet}>
          {rangeUpgradeState} of {maxBranchRank}
          <RangeIcon />
        </Small>
      </StatRow>
    );
  }
  return (
    <StyledPlanetCard>
      <TitleBar>
        <p>
          {destroyed && <DestroyedLabel />}
          {ProcgenUtils.getPlanetName(planet)}
        </p>
        <p>
          <PlanetOwnerLabel planet={planet} showYours color />
        </p>
      </TitleBar>
      <PreviewSection>
        {destroyed && <DestroyedMarker />}
        <PlanetPreview planet={planet} size={"5em"} res={100} />
        <PlanetTag planet={planet}>
          <p>
            <PlanetBiomeTypeLabelAnim planet={planet} />
          </p>
          <p>
            <LevelRankTextEm
              planet={planet}
              delim={" / "}
              canUpgrade={canUpgrade}
            />
          </p>
        </PlanetTag>
        <IconsWrapper>
          <PlanetIcons planet={planet} />
        </IconsWrapper>
      </PreviewSection>
      <StatSection>
        <TopRow>
          <BigStatCell>
            <PCStatIcon planet={planet} stat={StatIdx.EnergyCap}>
              <EnergyIcon />
            </PCStatIcon>
            <PlanetEnergyLabel planet={planet} />
          </BigStatCell>
          <BigStatCell>
            <RowTip name={TooltipName.Silver}>
              <SilverIcon />
            </RowTip>
            <PlanetSilverLabel planet={planet} />
          </BigStatCell>
        </TopRow>
        <StatRow>
          <Small planet={planet}>
            <PCStatIcon planet={planet} stat={StatIdx.EnergyGro}>
              <EnergyGrowthIcon />
            </PCStatIcon>
            <EnergyGrowthText planet={planet} />
          </Small>
          {isSilverMine && (
            <Small planet={planet}>
              <RowTip name={TooltipName.SilverGrowth}>
                <SilverGrowthIcon />
              </RowTip>
              <SilverGrowthText planet={planet} />
            </Small>
          )}
          <Small planet={planet}>
            <PCStatIcon planet={planet} stat={StatIdx.Defense}>
              <DefenseIcon />
            </PCStatIcon>
            <DefenseText planet={planet} />
          </Small>
          <Small planet={planet}>
            <PCStatIcon planet={planet} stat={StatIdx.Speed}>
              <SpeedIcon />
            </PCStatIcon>
            <SpeedText planet={planet} />
          </Small>
          <Small planet={planet}>
            <PCStatIcon planet={planet} stat={StatIdx.Range}>
              <RangeIcon />
            </PCStatIcon>
            <RangeText planet={planet} />
          </Small>
        </StatRow>
        {upgrades}
      </StatSection>
      {active && (
        <ArtifactSection>
          <PlanetActiveArtifact artifact={active} planet={planet} />
        </ArtifactSection>
      )}
    </StyledPlanetCard>
  );
}
