import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Hyperlink, Icon } from '@openedx/paragon';
import { OpenInNew } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { HelpSidebar } from '../../generic/help-sidebar';
import { useHelpUrls } from '../../help-urls/hooks';
import { getFormattedSidebarMessages } from './utils';
import messages from './messages';

const OutlineSideBar = ({ courseId }) => {
  const intl = useIntl();
  const {
    visibility: learnMoreVisibilityUrl,
    grading: learnMoreGradingUrl,
    outline: learnMoreOutlineUrl,
  } = useHelpUrls(['visibility', 'grading', 'outline']);

  const sidebarMessages = getFormattedSidebarMessages(
    {
      learnMoreGradingUrl,
      learnMoreOutlineUrl,
      learnMoreVisibilityUrl,
    },
    intl,
  );

  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings={false}
      className="outline-sidebar"
      data-testid="outline-sidebar"
    >
      <div className="outline-sidebar-header">
        <h3 className="outline-sidebar-header-title m-0">{intl.formatMessage(messages.sidebar_header)}</h3>
      </div>
      <div className="outline-sidebar-sections">
        {sidebarMessages.map(({ title, descriptions, link }) => (
          <Collapsible
            key={title}
            className="outline-sidebar-section border-0"
            styling="card-lg"
            unmountOnExit={false}
            title={<h4 className="help-sidebar-about-title m-0">{title}</h4>}
          >
            {descriptions.map((description) => (
              <p className="help-sidebar-about-descriptions" key={description}>{description}</p>
            ))}
            {Boolean(link) && Boolean(link.href) && (
              <Hyperlink
                className="outline-sidebar-section-link small d-inline-flex align-items-center"
                destination={link.href}
                target="_blank"
                showLaunchIcon={false}
              >
                {link.text}
                <Icon src={OpenInNew} className="outline-sidebar-section-link-icon" />
              </Hyperlink>
            )}
          </Collapsible>
        ))}
      </div>
    </HelpSidebar>
  );
};

OutlineSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineSideBar;
