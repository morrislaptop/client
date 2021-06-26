import React, { useState, useEffect, FormEvent } from 'react';
import { ChangeEvent } from 'react';
import styled from 'styled-components';
import EthConnection from '../../Backend/Network/EthConnection';
import { Chunk } from '../../_types/global/GlobalTypes';
import { Btn } from '../Components/Btn';
import { Spacer } from '../Components/CoreUI';
import { Input } from '../Components/Input';
import { White, Red, Green } from '../Components/Text';
import Viewport, { getDefaultScroll } from '../Game/Viewport';
import dfstyles from '../Styles/dfstyles';
import { useUIManager, useAccount } from '../Utils/AppHooks';
import { BooleanSetting, Setting, MultiSelectSetting } from '../Utils/SettingsHooks';
import { ModalHook, ModalName, ModalPane } from '../Views/ModalPane';

const SCROLL_MIN = 0.0001 * 10000;
const SCROLL_MAX = 0.01 * 10000;
const DEFAULT_SCROLL = Math.round(10000 * (getDefaultScroll() - 1));

const Range = styled.input``;

const StyledSettingsPane = styled.div`
  width: 32em;
  height: 30em;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  color: ${dfstyles.colors.subtext};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: space-between;
  align-items: center;
  margin-top: 8px;

  & > span:first-child {
    flex-grow: 1;
  }
`;

const Section = styled.div`
  padding: 1em 0;
  border-bottom: 1px solid ${dfstyles.colors.subtext};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  text-decoration: underline;
  color: white;
  margin-bottom: 8px;
`;

const ScrollSpeedInput = styled(Input)`
  padding: 2px 2px;
  width: 4em;
  height: min-content;
`;

export function SettingsPane({
  ethConnection,
  hook,
  privateHook,
}: {
  ethConnection: EthConnection;
  hook: ModalHook;
  privateHook: ModalHook;
}) {
  const uiManager = useUIManager();
  const account = useAccount(uiManager);

  const [rpcURLText, setRpcURLText] = useState<string>(ethConnection.getRpcEndpoint());
  const [rpcURL, setRpcURL] = useState<string>(ethConnection.getRpcEndpoint());
  const onChangeRpc = () => {
    ethConnection.setRpcEndpoint(rpcURLText).then(() => {
      const newEndpoint = ethConnection.getRpcEndpoint();
      setRpcURLText(newEndpoint);
      setRpcURL(newEndpoint);
    });
  };

  const [failure, setFailure] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [importMapByTextBoxValue, setImportMapByTextBoxValue] = useState('');
  useEffect(() => {
    if (failure) {
      setSuccess('');
    }
  }, [failure]);
  useEffect(() => {
    if (success) {
      setFailure('');
    }
  }, [success]);
  const onExportMap = async () => {
    if (uiManager) {
      const chunks = uiManager.getExploredChunks();
      const chunksAsArray = Array.from(chunks);
      try {
        const map = JSON.stringify(chunksAsArray);
        await window.navigator.clipboard.writeText(map);
        setSuccess('Copied map!');
      } catch (err) {
        console.error(err);
        setFailure('Failed to export');
      }
    } else {
      setFailure('Unable to export map right now.');
    }
  };
  const onImportMapFromTextBox = async () => {
    try {
      const chunks = JSON.parse(importMapByTextBoxValue);
      await uiManager.bulkAddNewChunks(chunks as Chunk[]);
      setImportMapByTextBoxValue('');
    } catch (e) {
      setFailure('Invalid map data. Check the data in your clipboard.');
    }
  };
  const onImportMap = async () => {
    if (uiManager) {
      let input;
      try {
        input = await window.navigator.clipboard.readText();
      } catch (err) {
        console.error(err);
        setFailure('Unable to import map. Did you allow clipboard access?');
        return;
      }

      let chunks;
      try {
        chunks = JSON.parse(input);
      } catch (err) {
        console.error(err);
        setFailure('Invalid map data. Check the data in your clipboard.');
        return;
      }
      await uiManager.bulkAddNewChunks(chunks as Chunk[]);
      setSuccess('Successfully imported a map!');
    } else {
      setFailure('Unable to import map right now.');
    }
  };

  const clipScroll = (v: number) => Math.max(Math.min(Math.round(v), SCROLL_MAX), SCROLL_MIN);
  const [scrollSpeed, setScrollSpeed] = useState<number>(DEFAULT_SCROLL);
  const onScrollChange = (e: FormEvent) => {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(value)) setScrollSpeed(value);
  };

  useEffect(() => {
    const scroll = localStorage.getItem('scrollSpeed');
    if (scroll) {
      setScrollSpeed(10000 * (parseFloat(scroll) - 1));
    }
  }, [setScrollSpeed]);

  useEffect(() => {
    if (!Viewport.instance) return;
    Viewport.instance.setMouseSensitivty(scrollSpeed / 10000);
  }, [scrollSpeed]);

  return (
    <ModalPane hook={hook} title={'Settings'} name={ModalName.Hats}>
      <StyledSettingsPane>
        <Section>
          <SectionHeader>Export and import explored maps</SectionHeader>
          <em>
            <Red>WARNING:</Red> Maps from others could be altered and are not guaranteed to be
            correct!
          </em>
          <Spacer height={8} />
          <Btn wide onClick={onExportMap}>
            Copy Map to Clipboard
          </Btn>
          <Spacer height={8} />
          <Btn wide onClick={onImportMap}>
            Import Map from Clipboard
          </Btn>
          <Spacer height={16} />
          You can also import a map by pasting from your clipboard into the text input below, and
          clicking the import button below it.
          <Spacer height={8} />
          <Input
            wide
            value={importMapByTextBoxValue}
            placeholder={'Paste map contents here'}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setImportMapByTextBoxValue(e.target.value)
            }
          />
          <Spacer height={8} />
          <Btn
            wide
            onClick={onImportMapFromTextBox}
            disabled={importMapByTextBoxValue.length === 0}
          >
            Import
          </Btn>
          <Spacer height={8} />
          <Green>{success}</Green>
          <Red>{failure}</Red>
        </Section>

        <Section>
          <SectionHeader>Change RPC Endpoint</SectionHeader>
          Current RPC Endpoint: {rpcURL}
          <Spacer height={8} />
          <Row>
            <Input value={rpcURLText} onChange={(e) => setRpcURLText(e.target.value)} />
            <Btn onClick={onChangeRpc}>Change RPC URL</Btn>
          </Row>
        </Section>

        <Section>
          <SectionHeader>Performance</SectionHeader>
          Some performance settings. These will definitely be changed as we zero in on the
          performance bottlenecks in this game.
          <Spacer height={8} />
          <BooleanSetting
            uiManager={uiManager}
            setting={Setting.HighPerformanceRendering}
            settingDescription='toggle performance mode'
          />
        </Section>

        <Section>
          <SectionHeader>Manage other settings.</SectionHeader>
          <Row>
            Scroll speed
            <Range
              type='range'
              value={clipScroll(scrollSpeed)}
              min={SCROLL_MIN}
              max={SCROLL_MAX}
              step={SCROLL_MIN / 10}
              onInput={onScrollChange}
            />
            <ScrollSpeedInput value={scrollSpeed} onInput={onScrollChange} />
          </Row>
        </Section>
      </StyledSettingsPane>
    </ModalPane>
  );
}
