import React from "react";
import styled from "styled-components";
import { Upgrade, Planet, UpgradeBranchName } from "@darkforest_eth/types";
import { RightarrowIcon } from "../Components/Icons";
import { Red, Green, Sub } from "../Components/Text";
import dfstyles from "../Styles/dfstyles";
import {
  getPlanetRank,
  getPlanetMaxRank,
  upgradeName,
} from "../../Backend/Utils/Utils";

const StyledUpgradePreview = styled.div`
  min-width: 15em;
  width: 100%;
`;

const StatRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 4px;

  & > span {
    margin-left: 0.2em;

    &:nth-child(1) {
      color: ${dfstyles.colors.subtext};
      margin-left: 0;
      width: 9em;
    }
    &:nth-child(2),
    &:nth-child(4) {
      text-align: center;
      width: 6em;
      flex-grow: 1;
    }
    &:nth-child(3) {
      // arrow
      text-align: center;
      width: 1.5em;
      & svg path {
        fill: ${dfstyles.colors.subtext};
      }
    }
    &:nth-child(5) {
      width: 5em;
      text-align: right;
    }
  }

  &.upgrade-willupdate {
    background: ${dfstyles.colors.backgroundlight};
  }
`;

const StatRowFilled = ({
  planet,
  title,
  stat,
  className,
}: {
  planet: Planet | undefined;
  title: string;
  stat: string;
  className?: string;
}) => {
  const getStat = (stat: string): number => {
    if (!planet) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mySelected = planet as any;

    if (stat === "silverGrowth") return mySelected[stat] * 60;
    else return mySelected[stat];
  };
  const statNow = (stat: string): string => {
    const num = getStat(stat);
    if (num % 1.0 === 0) return num.toFixed(0);
    else return num.toFixed(2);
  };

  return (
    <StatRow className={[className, stat].join(" ")}>
      <span>{title}</span>
      <span>{statNow(stat)}</span>
    </StatRow>
  );
};

export function UpgradePreview({
  planet,
  branchName,
}: {
  planet: Planet | undefined;
  branchName: UpgradeBranchName | undefined;
}) {
  const branchStrName = branchName !== undefined && upgradeName(branchName);
  const maxRank = getPlanetMaxRank(planet);
  const maxBranchRank = Math.min(4, maxRank);
  const branchUpgradeState =
    (branchName && planet && planet.upgradeState[branchName]) || 0;

  return (
    <StyledUpgradePreview>
      <StatRowFilled planet={planet} stat="energyCap" title="Energy Cap" />
      <StatRowFilled
        planet={planet}
        stat="energyGrowth"
        title="Energy Growth"
      />
      <StatRowFilled planet={planet} title="Range" stat="range" />
      <StatRowFilled planet={planet} title="Speed" stat="speed" />
      <StatRowFilled planet={planet} title="Defense" stat="defense" />
      <StatRow className="upgrade-willupdate">
        <span>{branchStrName} Rank</span>
        <span>
          {branchUpgradeState} of {maxBranchRank} <Sub>max</Sub>
        </span>
      </StatRow>
      <StatRow className="upgrade-willupdate">
        <span>Planet Rank</span>
        <span>
          {getPlanetRank(planet)} of {maxRank} <Sub>max</Sub>
        </span>
      </StatRow>
    </StyledUpgradePreview>
  );
}
