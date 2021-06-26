import _ from 'lodash';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { SortBy } from './SortBy';
import { ArtifactsList } from './ArtifactsList';
import { isActivated } from '../../../Backend/GameLogic/ArtifactUtils';
import { Spacer } from '../../Components/CoreUI';
import { Artifact, ArtifactId, LocatablePlanet, Upgrade } from '@darkforest_eth/types';

function anyArtifactMaybeActive(artifacts: Array<Artifact | undefined>) {
  return !!artifacts.find(
    (a) => (a !== undefined && a.unconfirmedActivateArtifact) || isActivated(a)
  );
}

export function ManageArtifactsPane({
  planet,
  artifactsOnPlanet,
  openArtifactDetails,
}: {
  planet: LocatablePlanet;
  artifactsOnPlanet: Array<Artifact | undefined>;
  openArtifactDetails: (artifactId: ArtifactId) => void;
}) {
  const [sortBy, setSortBy] = useState<keyof Upgrade | undefined>();

  return (
    <>
      <SortBy sortBy={sortBy} setSortBy={setSortBy} />
      <Spacer height={4} />
      <ArtifactsList
        artifacts={artifactsOnPlanet}
        sortBy={sortBy}
        openArtifactDetails={openArtifactDetails}
      />
      <Spacer height={4} />
      <SelectArtifactsContainer>
        <SelectArtifactList
          selected={true}
          onClick={() => {
            setSortBy(undefined);
          }}
        >
          Artifacts On This Planet
        </SelectArtifactList>
      </SelectArtifactsContainer>
    </>
  );
}

const SelectArtifactsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const SelectArtifactList = styled.span`
  ${({ selected }: { selected?: boolean }) => css`
    ${selected && 'text-decoration: underline;'}
    cursor: pointer;
  `}
`;
