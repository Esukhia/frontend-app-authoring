<div style={{ background: 'red', color: 'white' }}>
  SHERAB FOOTER ACTIVE
</div>
import React, { useContext, useState } from 'react';
import _ from 'lodash';
import { ensureConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import {
  ActionRow,
  Button,
  Container,
  Hyperlink,
  TransitionReplace,
} from '@openedx/paragon';
import { ExpandLess, ExpandMore, Help } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import sherabLogo from './assets/images/logo.png';

ensureConfig(
  [
    'LMS_BASE_URL',
    'MARKETING_SITE_BASE_URL',
    'PRIVACY_POLICY_URL',
    'SUPPORT_EMAIL',
    'SITE_NAME',
    'STUDIO_BASE_URL',
    'ENABLE_ACCESSIBILITY_PAGE',
  ],
  'Sherab Studio Footer component',
);

const SherabStudioFooter = ({ containerProps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useContext(AppContext);

  const { containerClassName, ...restContainerProps } = containerProps || {};

  return (
    <>
      {/* Help Toggle */}
      <div className="m-0 mt-6 row align-items-center justify-content-center">
        <div className="col border-top mr-2" />
        <Button
          variant="outline-primary"
          onClick={() => setIsOpen(!isOpen)}
          iconBefore={Help}
          iconAfter={isOpen ? ExpandLess : ExpandMore}
          size="sm"
        >
          {isOpen ? 'Hide Help' : 'Show Help'}
        </Button>
        <div className="col border-top ml-2" />
      </div>

      <Container
        size="xl"
        className={classNames('px-4', containerClassName)}
        {...restContainerProps}
      >
        {/* Help Links */}
      <TransitionReplace>
        {isOpen ? (
            <ActionRow key="help-link-button-row" className="py-4">
            <ActionRow.Spacer />
            <Button as="a" href="https://docs.edx.org/" size="sm">
                Documentation
            </Button>
            <Button as="a" href="https://open.edx.org/" size="sm">
                Open edX Portal
            </Button>
            <Button
                as="a"
                href="https://www.edx.org/course/edx101-overview-of-creating-an-edx-course"
                size="sm"
            >
                edX101
            </Button>
            <Button
                as="a"
                href="https://www.edx.org/course/studiox-creating-a-course-with-edx-studio"
                size="sm"
            >
                StudioX
            </Button>
            {!_.isEmpty(config.SUPPORT_EMAIL) && (
                <Button as="a" href={`mailto:${config.SUPPORT_EMAIL}`} size="sm">
                Contact Us
                </Button>
            )}
            <ActionRow.Spacer />
            </ActionRow>
        ) : (
            <div key="empty" />
        )}
      </TransitionReplace>

        {/* Legal Row */}
        <ActionRow className="pt-3 m-0 x-small">
          © {new Date().getFullYear()}{' '}
          <Hyperlink
            destination={config.MARKETING_SITE_BASE_URL}
            target="_blank"
            className="ml-2"
          >
            {config.SITE_NAME}
          </Hyperlink>

          <ActionRow.Spacer />

          {!_.isEmpty(config.TERMS_OF_SERVICE_URL) && (
            <Hyperlink destination={config.TERMS_OF_SERVICE_URL}>
              Terms of Service
            </Hyperlink>
          )}

          {!_.isEmpty(config.PRIVACY_POLICY_URL) && (
            <Hyperlink destination={config.PRIVACY_POLICY_URL}>
              Privacy Policy
            </Hyperlink>
          )}

          {config.ENABLE_ACCESSIBILITY_PAGE === 'true' && (
            <Hyperlink destination={`${config.STUDIO_BASE_URL}/accessibility`}>
              Accessibility
            </Hyperlink>
          )}

          <Hyperlink destination={config.LMS_BASE_URL}>LMS</Hyperlink>
        </ActionRow>
        {/* Sherab Branding Row replacing the openedx branding*/}
            <ActionRow className="mt-3 pb-4 justify-content-center">
            <img
                src={sherabLogo}
                alt="Sherab"
                style={{
                width: '40px',
                display: 'block',
                margin: '0 auto',
                }}
            />
            </ActionRow>
      </Container>
    </>
  );
};

SherabStudioFooter.propTypes = {
  containerProps: PropTypes.shape(Container.propTypes),
};

SherabStudioFooter.defaultProps = {
  containerProps: {},
};

export default SherabStudioFooter;