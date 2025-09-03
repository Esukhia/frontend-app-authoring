import React from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import messages from './messages';

const ExtendedCourseDetails = ({
  duration,
  description,
  onChange,
}) => {
  const intl = useIntl();
  const paramsForExtendedFields = [
    {
      value: duration,
      label: intl.formatMessage(messages.extendedDurationLabel),
      helpText: intl.formatMessage(messages.extendedDurationHelpText),
      ariaLabel: intl.formatMessage(messages.extendedDurationAriaLabel),
      controlName: 'duration',
      maxLength: 50,
    },
    {
      value: description,
      label: intl.formatMessage(messages.extendedDescriptionLabel),
      helpText: intl.formatMessage(messages.extendedDescriptionHelpText),
      ariaLabel: intl.formatMessage(messages.extendedDescriptionAriaLabel),
      controlName: 'description',
      maxLength: 1000,
      asTextarea: true,
    },
  ];
  return (
    <>
      {paramsForExtendedFields.map((param) => (
        <Form.Group className="form-group-custom" key={param.label}>
          <Form.Label>{param.label}</Form.Label>
          <Form.Control
            as={param.asTextarea ? TextareaAutosize : 'input'}
            value={param.value}
            name={param.controlName}
            maxLength={param.maxLength}
            onChange={(e) => onChange(e.target.value, param.controlName)}
            aria-label={param.ariaLabel}
          />
          <Form.Control.Feedback>{param.helpText}</Form.Control.Feedback>
        </Form.Group>
      ))}
    </>
  );
};

ExtendedCourseDetails.defaultProps = {
  duration: '',
  description: '',
};

ExtendedCourseDetails.propTypes = {
  duration: PropTypes.string,
  description: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default ExtendedCourseDetails;
