import React from "react";
import styled from "styled-components";
import { SelectedPlanetHelpContent } from "../Copy/HelpContent";
import { useSelectedPlanet, useUIManager } from "../Utils/AppHooks";
import { ModalHook, ModalPane } from "../Views/ModalPane";
import { PlanetCard } from "../Views/PlanetCard";
import dfstyles from "../Styles/dfstyles";
import { Btn } from "../Components/Btn";
import { Planet } from "@darkforest_eth/types";
import { isLocatable } from "../../_types/global/GlobalTypes";

const StyledSelectedPlanetPane = styled.div`
  width: 22em;
  min-width: 20em;
  height: fit-content;
`;

const Header = styled.div`
  font-size: ${dfstyles.fontSizeXS};
  text-align: center;
  background: ${dfstyles.colors.backgroundlight};
  padding: 0.15em;
  border-top: 1px solid ${dfstyles.colors.subtext};
  border-bottom: 1px solid ${dfstyles.colors.subtext};
`;

const ContextSection = styled.div`
  padding: 0.5em;
`;

export function PlanetContextPane({ hook }: { hook: ModalHook }) {
  const uiManager = useUIManager();
  const s = useSelectedPlanet(uiManager);
  const constants = uiManager.getContractConstants();

  function validPerlin(p: Planet) {
    return (
      p.perlin >= constants.INIT_PERLIN_MIN &&
      p.perlin < constants.INIT_PERLIN_MAX
    );
  }

  let initSection;
  if (s.value) {
    let planet = s.value;
    if (
      planet.planetLevel === 0 &&
      validPerlin(planet) &&
      isLocatable(planet)
    ) {
      let { x, y } = planet.location.coords;
      let url = `https://zkga.me/game1?searchCenter=${x},${y}`;
      initSection = (
        <>
          <Header>Actions</Header>
          <ContextSection>
            <Btn onClick={() => window.open(url)}>Initialize here</Btn>
          </ContextSection>
        </>
      );
    }
  }

  return (
    <ModalPane
      hook={hook}
      title={"Selected Planet"}
      hideClose
      noPadding
      helpContent={SelectedPlanetHelpContent}
    >
      <StyledSelectedPlanetPane>
        <PlanetCard planetWrapper={s} />
        {initSection}
      </StyledSelectedPlanetPane>
    </ModalPane>
  );
}
