import React, { useState, useRef } from "react";
import {
  WindowWrapper,
  MainWindow,
  CanvasContainer,
  UpperLeft,
  CanvasWrapper,
} from "../Components/GameWindowComponents";
import ControllableCanvas from "../Game/ControllableCanvas";
import { ArtifactDetailsPane } from "../Panes/ArtifactDetailsPane";
import { CoordsPane } from "../Panes/CoordsPane";
import { ExplorePane } from "../Panes/ExplorePane";
import { HelpPane } from "../Panes/HelpPane";
import { ManagePlanetArtifactsPane } from "../Panes/ManagePlanetArtifacts/ManagePlanetArtifactsPane";
import {
  ModalHelpIcon,
  ModalPluginIcon,
  ModalSettingsIcon,
  ModalArtifactIcon,
  ModalPlanetDetailsIcon,
} from "./ModalIcon";
import { PlanetDetailsPane } from "../Panes/PlanetDetailsPane";
import { PluginLibraryPane } from "../Panes/PluginLibraryPane";
import { SettingsPane } from "../Panes/SettingsPane";
import { Tooltip } from "../Panes/Tooltip";
import { ZoomPane } from "../Panes/ZoomPane";
import { useSelectedPlanet, useUIManager } from "../Utils/AppHooks";
import { NotificationsPane } from "./Notifications";
import { useEffect } from "react";
import { useEmitterValue } from "../Utils/EmitterHooks";
import { keyUp$ } from "../Utils/KeyEmitters";
import {
  TOGGLE_DIAGNOSTICS_PANE,
  TOGGLE_PLANET_ARTIFACTS_PANE,
  TOGGLE_PLANET_DETAILS_PANE,
} from "../Utils/ShortcutConstants";
import { MenuBar, MenuBarSection } from "./MenuBar";
import { PlanetContextPane } from "../Panes/PlanetContextPane";
import { HoverPlanetPane } from "../Panes/HoverPlanetPane";
import { DiagnosticsPane } from "../Panes/DiagnosticsPane";

export function GameWindowLayout() {
  const planetDetHook = useState<boolean>(false);

  const helpHook = useState<boolean>(false);
  const manageArtifactsHook = useState<boolean>(false);
  const settingsHook = useState<boolean>(false);
  const privateHook = useState<boolean>(false);
  const pluginsHook = useState<boolean>(false);
  const modalsContainerRef = useRef<HTMLDivElement | null>(null);
  const uiManager = useUIManager();

  const selected = useSelectedPlanet(uiManager).value;
  const selectedPlanetHook = useState<boolean>(!!selected);
  const diagnosticsHook = useState<boolean>(false);
  const [, setSelectedPlanetVisible] = selectedPlanetHook;

  useEffect(
    () => setSelectedPlanetVisible(!!selected),
    [selected, setSelectedPlanetVisible]
  );

  /* artifact stuff */
  const artifactDetailsHook = useState<boolean>(false);

  const keyUp = useEmitterValue(keyUp$, undefined);
  const lastKeyUp = useRef(keyUp);

  useEffect(() => {
    if (!keyUp) return;
    if (lastKeyUp.current === keyUp) return;
    lastKeyUp.current = keyUp;

    let paneHook;

    if (keyUp.value === TOGGLE_PLANET_DETAILS_PANE) {
      paneHook = planetDetHook;
    } else if (keyUp.value === TOGGLE_PLANET_ARTIFACTS_PANE) {
      paneHook = manageArtifactsHook;
    } else if (keyUp.value === TOGGLE_DIAGNOSTICS_PANE) {
      paneHook = diagnosticsHook;
    }

    if (paneHook) {
      paneHook[1]((value) => !value);
    }
  }, [keyUp, manageArtifactsHook, planetDetHook, diagnosticsHook]);

  return (
    <WindowWrapper>
      <Tooltip />

      {/* all modals rendered into here */}
      <div ref={modalsContainerRef}>
        <PlanetDetailsPane hook={planetDetHook} />
        <HelpPane hook={helpHook} />
        <ManagePlanetArtifactsPane
          hook={manageArtifactsHook}
          setArtifactDetailsOpen={artifactDetailsHook[1]}
        />
        <SettingsPane
          ethConnection={uiManager.getEthConnection()}
          hook={settingsHook}
          privateHook={privateHook}
        />
        <ArtifactDetailsPane hook={artifactDetailsHook} />
        <PlanetContextPane hook={selectedPlanetHook} />
        <DiagnosticsPane hook={diagnosticsHook} />
        {modalsContainerRef.current && (
          <PluginLibraryPane
            modalsContainer={modalsContainerRef.current}
            gameUIManager={uiManager}
            hook={pluginsHook}
          />
        )}
      </div>

      <MainWindow>
        <CanvasContainer>
          <UpperLeft>
            <MenuBar>
              <MenuBarSection>
                <ModalSettingsIcon hook={settingsHook} />
                <ModalHelpIcon hook={helpHook} />
                <ModalPluginIcon hook={pluginsHook} />
              </MenuBarSection>
              <MenuBarSection collapsible>
                <ModalPlanetDetailsIcon hook={planetDetHook} />
                <ModalArtifactIcon hook={manageArtifactsHook} />
              </MenuBarSection>
            </MenuBar>
            <ZoomPane />
          </UpperLeft>

          <CanvasWrapper>
            <ControllableCanvas />
          </CanvasWrapper>

          <NotificationsPane />
          <CoordsPane />
          <ExplorePane />

          <HoverPlanetPane />
        </CanvasContainer>
      </MainWindow>
    </WindowWrapper>
  );
}
