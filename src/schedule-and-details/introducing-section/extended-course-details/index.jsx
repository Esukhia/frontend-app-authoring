import React from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import DurationField from './DurationField';
import messages from './messages';

const ExtendedCourseDetails = ({
  title,
  duration,
  description,
  durationValue,
  durationUnit,
  onChange,
}) => {
  const intl = useIntl();
  const controlAsFor = (p) => {
    if (p.as) {
      return p.as;
    }
    if (p.asTextarea) {
      return TextareaAutosize;
    }
    return 'input';
  };
  const paramsForExtendedFields = [
    // Note: The 'title' field is repurposed in the UI as 'Course requirement'
    {
      value: title,
      label: intl.formatMessage(messages.extendedTitleLabel),
      helpText: intl.formatMessage(messages.extendedTitleHelpText),
      ariaLabel: intl.formatMessage(messages.extendedTitleAriaLabel),
      controlName: 'title',
      // Use a native textarea to allow manual resizing
      as: 'textarea',
      rows: 3,
      style: { resize: 'vertical' },
      maxLength: 500,
    },
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
      <DurationField
        label={intl.formatMessage(messages.courseDurationLabel)}
        helpText={intl.formatMessage(messages.courseDurationHelpText)}
        value={durationValue}
        unit={durationUnit}
        valuePlaceholder={intl.formatMessage(messages.courseDurationPlaceholder)}
        onChange={onChange}
      />
      {paramsForExtendedFields.map((param) => (
        <Form.Group className="form-group-custom" key={param.label}>
          <Form.Label>{param.label}</Form.Label>
          <Form.Control
            as={controlAsFor(param)}
            value={param.value}
            name={param.controlName}
            maxLength={param.maxLength}
            onChange={(e) => onChange(e.target.value, param.controlName)}
            aria-label={param.ariaLabel}
            rows={param.rows}
            style={param.style}
          />
          <Form.Control.Feedback>{param.helpText}</Form.Control.Feedback>
        </Form.Group>
      ))}
    </>
  );
};

ExtendedCourseDetails.defaultProps = {
  title: '',
  duration: '',
  description: '',
  durationValue: '',
  durationUnit: 'Days',
};

ExtendedCourseDetails.propTypes = {
  title: PropTypes.string,
  duration: PropTypes.string,
  description: PropTypes.string,
  durationValue: PropTypes.number,
  durationUnit: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default ExtendedCourseDetails;
