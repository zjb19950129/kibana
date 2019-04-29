/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';

import {
  EuiButton,
  EuiCallOut,
  EuiCard,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
  EuiIcon,
} from '@elastic/eui';

import { Repository, RepositoryType, EmptyRepository } from '../../../../common/types';
import { REPOSITORY_TYPES } from '../../../../common/constants';

import { useAppDependencies } from '../../index';
import { documentationLinksService } from '../../services/documentation';
import { loadRepositoryTypes } from '../../services/http';
import { textService } from '../../services/text';
import { RepositoryValidation } from '../../services/validation';
import { SectionError } from '../section_error';
import { SectionLoading } from '../section_loading';

interface Props {
  repository: Repository | EmptyRepository;
  onNext: () => void;
  updateRepository: (updatedFields: any) => void;
  validation: RepositoryValidation;
}

export const RepositoryFormStepOne: React.FunctionComponent<Props> = ({
  repository,
  onNext,
  updateRepository,
  validation,
}) => {
  const {
    core: {
      i18n: { FormattedMessage },
    },
  } = useAppDependencies();

  // Load repository types
  const {
    error: repositoryTypesError,
    loading: repositoryTypesLoading,
    data: repositoryTypes = [],
  } = loadRepositoryTypes();

  const hasValidationErrors: boolean = !validation.isValid;

  const onTypeChange = (newType: RepositoryType) => {
    if (repository.type === REPOSITORY_TYPES.source) {
      updateRepository({
        settings: {
          delegateType: newType,
        },
      });
    } else {
      updateRepository({
        type: newType,
        settings: {},
      });
    }
  };

  const renderNameField = () => (
    <EuiDescribedFormGroup
      title={
        <EuiTitle size="s">
          <h3>
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.fields.nameDescriptionTitle"
              defaultMessage="Repository name"
            />
          </h3>
        </EuiTitle>
      }
      description={
        <FormattedMessage
          id="xpack.snapshotRestore.repositoryForm.fields.nameDescription"
          defaultMessage="A unique name for the repository."
        />
      }
      idAria="repositoryNameDescription"
      fullWidth
    >
      <EuiFormRow
        label={
          <FormattedMessage
            id="xpack.snapshotRestore.repositoryForm.fields.nameLabel"
            defaultMessage="Name"
          />
        }
        describedByIds={['repositoryNameDescription']}
        isInvalid={Boolean(hasValidationErrors && validation.errors.name)}
        error={validation.errors.name}
        fullWidth
      >
        <EuiFieldText
          defaultValue={repository.name}
          fullWidth
          onChange={e => {
            updateRepository({
              name: e.target.value,
            });
          }}
        />
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );

  const renderTypeCard = (type: RepositoryType, index: number) => {
    const isSelectedType =
      (repository.type === REPOSITORY_TYPES.source
        ? repository.settings.delegateType
        : repository.type) === type;
    const displayName = textService.getRepositoryTypeName(type);

    return (
      <EuiFlexItem
        className="ssrRepositoryFormTypeCardWrapper"
        key={index}
        tabIndex={0}
        onClick={() => onTypeChange(type)}
        onKeyDown={({ key }) => {
          if (key === 'Enter') {
            onTypeChange(type);
          }
        }}
        grow={1}
      >
        <EuiCard
          className={`ssrRepositoryFormTypeCard
            ${isSelectedType ? 'ssrRepositoryFormTypeCard--selected' : ''}`}
          title={displayName}
          description={
            <EuiLink
              onClick={e => e.stopPropagation()}
              onKeyDown={(e: any) => e.stopPropagation()}
              href={documentationLinksService.getRepositoryTypeDocUrl(type)}
              target="_blank"
            >
              <FormattedMessage
                id="xpack.snapshotRestore.repositoryForm.fields.typeDocsLinkText"
                defaultMessage="Learn more"
              />{' '}
              <EuiIcon type="link" />
            </EuiLink>
          }
        />
      </EuiFlexItem>
    );
  };

  const renderTypes = () => {
    if (repositoryTypesError) {
      return (
        <SectionError
          title={
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.loadingRepositoryTypesErrorMessage"
              defaultMessage="Error loading repository types"
            />
          }
          error={repositoryTypesError}
        />
      );
    }

    if (repositoryTypesLoading) {
      return (
        <SectionLoading>
          <FormattedMessage
            id="xpack.snapshotRestore.repositoryForm.loadingRepositoryTypesDescription"
            defaultMessage="Loading repository types…"
          />
        </SectionLoading>
      );
    }

    return (
      <EuiFlexGrid columns={3}>
        {repositoryTypes.map((type: RepositoryType, index: number) => renderTypeCard(type, index))}
      </EuiFlexGrid>
    );
  };

  const renderTypeField = () => {
    return (
      <EuiDescribedFormGroup
        title={
          <EuiTitle size="s">
            <h3>
              <FormattedMessage
                id="xpack.snapshotRestore.repositoryForm.fields.typeDescriptionTitle"
                defaultMessage="Repository type"
              />
            </h3>
          </EuiTitle>
        }
        description={
          <Fragment>
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.fields.typeDescription"
              defaultMessage="Elasticsearch supports file system, read-only URL, and source-only repositories.
                Additional types require plugins. {docLink}"
              values={{
                docLink: (
                  <EuiLink
                    href={documentationLinksService.getRepositoryPluginDocUrl()}
                    target="_blank"
                  >
                    <FormattedMessage
                      id="xpack.snapshotRestore.repositoryForm.fields.typePluginsDocLinkText"
                      defaultMessage="Learn more about plugins."
                    />
                  </EuiLink>
                ),
              }}
            />
          </Fragment>
        }
        idAria="repositoryTypeDescription"
        fullWidth
      >
        <EuiFormRow
          hasEmptyLabelSpace
          describedByIds={['repositoryTypeDescription']}
          fullWidth
          isInvalid={Boolean(hasValidationErrors && validation.errors.type)}
          error={validation.errors.type}
        >
          {renderTypes()}
        </EuiFormRow>
      </EuiDescribedFormGroup>
    );
  };

  const renderSourceOnlyToggle = () => (
    <EuiDescribedFormGroup
      title={
        <EuiTitle size="s">
          <h3>
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.fields.sourceOnlyDescriptionTitle"
              defaultMessage="Source-only snapshots"
            />
          </h3>
        </EuiTitle>
      }
      description={
        <Fragment>
          <FormattedMessage
            id="xpack.snapshotRestore.repositoryForm.fields.sourceOnlyDescription"
            defaultMessage="Creates source-only snapshots that take up to 50% less space. {docLink}"
            values={{
              docLink: (
                <EuiLink
                  href={documentationLinksService.getRepositoryTypeDocUrl(REPOSITORY_TYPES.source)}
                  target="_blank"
                >
                  <FormattedMessage
                    id="xpack.snapshotRestore.repositoryForm.fields.sourceOnlyDocLinkText"
                    defaultMessage="Learn more about source-only repositories."
                  />
                </EuiLink>
              ),
            }}
          />
        </Fragment>
      }
      idAria="sourceOnlyDescription"
      fullWidth
    >
      <EuiFormRow hasEmptyLabelSpace={true} fullWidth describedByIds={['sourceOnlyDescription']}>
        <EuiSwitch
          label={
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.fields.sourceOnlyLabel"
              defaultMessage="Source-only snapshots"
            />
          }
          checked={repository.type === REPOSITORY_TYPES.source}
          onChange={e => {
            if (e.target.checked) {
              updateRepository({
                type: REPOSITORY_TYPES.source,
                settings: {
                  ...repository.settings,
                  delegateType: repository.type,
                },
              });
            } else {
              const {
                settings: { delegateType, ...rest },
              } = repository;
              updateRepository({
                type: delegateType || null,
                settings: rest,
              });
            }
          }}
        />
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );

  const renderActions = () => (
    <EuiButton
      color="primary"
      onClick={onNext}
      fill
      iconType="arrowRight"
      iconSide="right"
      data-test-subj="srRepositoryFormNextButton"
    >
      <FormattedMessage
        id="xpack.snapshotRestore.repositoryForm.nextButtonLabel"
        defaultMessage="Next"
      />
    </EuiButton>
  );

  const renderFormValidationError = () => {
    if (!hasValidationErrors) {
      return null;
    }
    return (
      <Fragment>
        <EuiCallOut
          title={
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryForm.validationErrorTitle"
              defaultMessage="Fix errors before continuing."
            />
          }
          color="danger"
          data-test-subj="repositoryFormError"
        />
        <EuiSpacer size="m" />
      </Fragment>
    );
  };

  return (
    <Fragment>
      {renderNameField()}
      {renderTypeField()}
      {renderSourceOnlyToggle()}
      {renderFormValidationError()}
      {renderActions()}
    </Fragment>
  );
};