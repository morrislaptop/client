import { ArtifactId } from '@darkforest_eth/types';
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { isLocatable } from '../../../_types/global/GlobalTypes';
import { CenterBackgroundSubtext, Underline } from '../../Components/CoreUI';
import { useUIManager, useSelectedPlanet } from '../../Utils/AppHooks';
import { ModalHook, ModalName, ModalPane, RECOMMENDED_WIDTH } from '../../Views/ModalPane';
import { ManageArtifactsPane } from './ManageArtifacts';

function HelpContent() {
  return (
    <div>
      <p>
        Using this pane, you can manage the artifacts that are on this planet specifically. You can
        activate a single artifact at a time. Most artifacts have a cooldown period after
        deactivating during which they can not be activated.
      </p>
      <br />
      <p>
        If your planet is a <Underline>Spacetime Rip</Underline>, you can also withdraw and deposit
        artifacts. When you withdraw an artifact, it is transferred to your address as an ERC 721
        token.
      </p>
    </div>
  );
}
/**
 * This is the place where a user can manage all of their artifacts on a
 * particular planet. This includes prospecting, withdrawing, depositing,
 * activating, and deactivating artifacts.
 */
export function ManagePlanetArtifactsPane({
  hook,
  setArtifactDetailsOpen,
}: {
  hook: ModalHook;
  setArtifactDetailsOpen: (open: boolean) => void;
}) {
  const [flip, setFlip] = useState(false);
  const uiManager = useUIManager();
  const planet = useSelectedPlanet(uiManager);
  const onPlanet = uiManager.getArtifactsWithIds(planet.value?.heldArtifactIds || []);

  const openArtifactDetails = useCallback(
    (artifactId: ArtifactId) => {
      uiManager.selectedArtifactId$.publish(artifactId);
      setArtifactDetailsOpen(false);
      setFlip(true);
    },
    [uiManager, setArtifactDetailsOpen]
  );

  // hack which lets us pop the artifact details modal to the top whenever an artifact is clicked
  useLayoutEffect(() => {
    if (flip) {
      setArtifactDetailsOpen(true);
      setFlip(false);
    }
  }, [flip, setArtifactDetailsOpen, setFlip]);

  let content;

  if (planet.value && isLocatable(planet.value)) {
    content = (
      <ManageArtifactsPane
        artifactsOnPlanet={onPlanet}
        planet={planet.value}
        openArtifactDetails={openArtifactDetails}
      />
    );
  } else {
    content = (
      <CenterBackgroundSubtext width='400px' height='75px'>
        Select a Planet
      </CenterBackgroundSubtext>
    );
  }

  return (
    <ModalPane
      hook={hook}
      title='Planet Artifacts'
      name={ModalName.ManageArtifacts}
      width={RECOMMENDED_WIDTH}
      helpContent={HelpContent}
    >
      {content}
    </ModalPane>
  );
}
