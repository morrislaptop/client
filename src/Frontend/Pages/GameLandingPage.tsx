import _ from "lodash";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import GameManager from "../../Backend/GameLogic/GameManager";
import GameUIManager from "../../Backend/GameLogic/GameUIManager";
import EthConnection from "../../Backend/Network/EthConnection";
import { neverResolves } from "../../Backend/Utils/Utils";
import {
  Wrapper,
  GameWindowWrapper,
  TerminalToggler,
  TerminalWrapper,
} from "../Components/GameLandingPageComponents";
import { TopLevelDivProvider, UIManagerProvider } from "../Utils/AppHooks";
import { unsupportedFeatures, Incompatibility } from "../Utils/BrowserChecks";
import { TerminalTextStyle } from "../Utils/TerminalTypes";
import UIEmitter, { UIEmitterEvent } from "../Utils/UIEmitter";
import { GameWindowLayout } from "../Views/GameWindowLayout";
import { Terminal, TerminalHandle } from "../Views/Terminal";

enum TerminalPromptStep {
  NONE,
  COMPATIBILITY_CHECKS_PASSED,
  FETCHING_ETH_DATA,
  ALL_CHECKS_PASS,
  COMPLETE,
  TERMINATED,
  ERROR,
}

export enum InitRenderState {
  NONE,
  LOADING,
  COMPLETE,
}

export default function GameLandingPage() {
  const terminalHandle = useRef<TerminalHandle>();
  const gameUIManagerRef = useRef<GameUIManager | undefined>();
  const topLevelContainer = useRef<HTMLDivElement | null>(null);
  const [ethConnection] = useState(() => new EthConnection());
  const [gameManager, setGameManager] = useState<GameManager | undefined>();
  const [initRenderState, setInitRenderState] = useState(InitRenderState.NONE);
  const [step, setStep] = useState(TerminalPromptStep.NONE);

  const wait = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const animEllipsis = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      const delay = 0; // TODOPR 250
      for (const _i in _.range(3)) {
        await wait(delay).then(() => terminal.current?.print("."));
      }
      await wait(delay * 1.5);
      return;
    },
    [wait]
  );

  const advanceStateFromNone = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      terminal.current?.printShellLn("df init");
      terminal.current?.println("Initializing Dark Forest...");

      terminal.current?.print("Loading zkSNARK proving key");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "Proving key loaded. (14.3MB)",
        TerminalTextStyle.Blue
      );

      terminal.current?.print("Verifying zkSNARK params");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "28700 constraints verified.",
        TerminalTextStyle.Blue
      );

      terminal.current?.print("Connecting to Ethereum L2");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "Connected to xDAI STAKE.",
        TerminalTextStyle.Blue
      );

      terminal.current?.print("Installing flux capacitor");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "Flux capacitor installed.",
        TerminalTextStyle.Blue
      );

      terminal.current?.println("Initialization complete.");
      terminal.current?.newline();
      const issues = await unsupportedFeatures();

      // $ df check
      terminal.current?.printShellLn("df check");

      terminal.current?.print("Checking compatibility");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "Initiating (3) compatibility checks.",
        TerminalTextStyle.Blue
      );

      terminal.current?.print("Checking if device is compatible");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      if (issues.includes(Incompatibility.MobileOrTablet)) {
        terminal.current?.println(
          "ERROR: Mobile or tablet device detected. Please use desktop.",
          TerminalTextStyle.Red
        );
      } else {
        terminal.current?.println(
          "Desktop detected. Device OK.",
          TerminalTextStyle.White
        );
      }

      terminal.current?.print("Checking if IndexedDB is present");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      if (issues.includes(Incompatibility.NoIDB)) {
        terminal.current?.println(
          "ERROR: IndexedDB not found. Try using a different browser.",
          TerminalTextStyle.Red
        );
      } else {
        terminal.current?.println(
          "IndexedDB detected.",
          TerminalTextStyle.White
        );
      }

      terminal.current?.print("Checking if browser is supported");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      if (issues.includes(Incompatibility.UnsupportedBrowser)) {
        terminal.current?.println(
          "ERROR: Browser unsupported. Try Brave, Firefox, or Chrome.",
          TerminalTextStyle.Red
        );
      } else {
        terminal.current?.println(
          "Browser Supported.",
          TerminalTextStyle.White
        );
      }

      terminal.current?.print("Checking Ethereum Mainnet");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "ERROR: Gas prices too high!",
        TerminalTextStyle.White
      );
      terminal.current?.newline();
      terminal.current?.print("Falling back to L2");
      await animEllipsis(terminal);
      terminal.current?.print(" ");
      terminal.current?.println(
        "Connected to xDAI L2 network.",
        TerminalTextStyle.White
      );

      if (issues.length > 0) {
        terminal.current?.print(
          `${issues.length.toString()} errors found. `,
          TerminalTextStyle.Red
        );
        terminal.current?.println("Please resolve them and refresh the page.");
      } else {
        terminal.current?.println(
          "All checks passed.",
          TerminalTextStyle.Green
        );
        terminal.current?.newline();
        setStep(TerminalPromptStep.COMPATIBILITY_CHECKS_PASSED);
      }
    },
    [animEllipsis]
  );

  const advanceStateFromCompatibilityPassed = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      terminal.current?.printShellLn("df log");
      terminal.current?.newline();

      setStep(TerminalPromptStep.FETCHING_ETH_DATA);
    },
    [ethConnection]
  );

  const advanceStateFromFetchingEthData = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      let newGameManager: GameManager;

      try {
        newGameManager = await GameManager.create(ethConnection, terminal);
      } catch (e) {
        console.error(e);

        setStep(TerminalPromptStep.ERROR);

        terminal.current?.print(
          "Network under heavy load. Please refresh the page, and check ",
          TerminalTextStyle.Red
        );

        terminal.current?.printLink(
          "https://blockscout.com/poa/xdai/",
          () => {
            window.open("https://blockscout.com/poa/xdai/");
          },
          TerminalTextStyle.Red
        );

        terminal.current?.println("");

        return;
      }

      setGameManager(newGameManager);

      window.df = newGameManager;

      const newGameUIManager = await GameUIManager.create(
        newGameManager,
        terminal
      );

      window.ui = newGameUIManager;

      terminal.current?.newline();
      terminal.current?.println("Connected to DarkForestCore contract.");
      gameUIManagerRef.current = newGameUIManager;

      terminal.current?.println("Initializing game...");
      setStep(TerminalPromptStep.ALL_CHECKS_PASS);
    },
    [ethConnection]
  );

  const advanceStateFromAllChecksPass = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      setStep(TerminalPromptStep.COMPLETE);
      setInitRenderState(InitRenderState.COMPLETE);

      terminal.current?.printShellLn("df shell");
      terminal.current?.println(
        "Welcome to the universe of Dark Forest.",
        TerminalTextStyle.Green
      );
    },
    []
  );

  const advanceStateFromError = useCallback(async () => {
    await neverResolves();
  }, []);

  const advanceState = useCallback(
    async (terminal: React.MutableRefObject<TerminalHandle | undefined>) => {
      if (step === TerminalPromptStep.NONE) {
        await advanceStateFromNone(terminal);
      } else if (step === TerminalPromptStep.COMPATIBILITY_CHECKS_PASSED) {
        await advanceStateFromCompatibilityPassed(terminal);
      } else if (step === TerminalPromptStep.FETCHING_ETH_DATA) {
        await advanceStateFromFetchingEthData(terminal);
      } else if (step === TerminalPromptStep.ALL_CHECKS_PASS) {
        await advanceStateFromAllChecksPass(terminal);
      } else if (step === TerminalPromptStep.ERROR) {
        await advanceStateFromError();
      }
    },
    [
      step,
      advanceStateFromAllChecksPass,
      advanceStateFromCompatibilityPassed,
      advanceStateFromError,
      advanceStateFromFetchingEthData,
      advanceStateFromNone,
    ]
  );

  useEffect(() => {
    const uiEmitter = UIEmitter.getInstance();
    uiEmitter.emit(UIEmitterEvent.UIChange);
  }, [initRenderState]);

  useEffect(() => {
    if (terminalHandle.current && topLevelContainer.current) {
      advanceState(terminalHandle);
    }
  }, [terminalHandle, topLevelContainer, advanceState]);

  return (
    <Wrapper initRender={initRenderState}>
      <GameWindowWrapper initRender={initRenderState}>
        {gameUIManagerRef.current && topLevelContainer.current && gameManager && (
          <TopLevelDivProvider value={topLevelContainer.current}>
            <UIManagerProvider value={gameUIManagerRef.current}>
              <GameWindowLayout />
            </UIManagerProvider>
          </TopLevelDivProvider>
        )}
      </GameWindowWrapper>
      <TerminalWrapper initRender={initRenderState}>
        <Terminal ref={terminalHandle} promptCharacter={"$"} />
      </TerminalWrapper>
      <div ref={topLevelContainer}></div>
    </Wrapper>
  );
}
