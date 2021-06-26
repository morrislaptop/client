import React from 'react';
import styled from 'styled-components';
import { SelectedPlanetHelpContent } from '../Copy/HelpContent';
import { useSelectedPlanet, useUIManager } from '../Utils/AppHooks';
import { ModalHook, ModalPane } from '../Views/ModalPane';
import { PlanetCard } from '../Views/PlanetCard';

const StyledSelectedPlanetPane = styled.div`
  width: 22em;
  min-width: 20em;
  height: fit-content;
`;

export function PlanetContextPane({
  hook,
}: {
  hook: ModalHook;
}) {
  const uiManager = useUIManager();
  const s = useSelectedPlanet(uiManager);

  return (
    <ModalPane
      hook={hook}
      title={'Selected Planet'}
      hideClose
      noPadding
      helpContent={SelectedPlanetHelpContent}
    >
      <StyledSelectedPlanetPane>
        <PlanetCard planetWrapper={s} />
      </StyledSelectedPlanetPane>
    </ModalPane>
  );
}
