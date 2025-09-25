import React from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown } from '@openedx/paragon';

const DurationField = ({
  label,
  helpText,
  value,
  unit,
  valuePlaceholder,
  onChange,
}) => {
  const handleValueChange = (e) => {
    let newValue = e.target.value;

    // Only allow digits
    if (!/^\d*$/.test(newValue)) {
      return;
    }

    // Convert to number
    newValue = Number(newValue);

    // Enforce minimum = 1
    if (newValue < 1 && newValue !== 0) {
      return;
    }

    onChange(newValue, 'durationValue');
  };

  const handleKeyDown = (e) => {
    // Block characters: e, +, -, .
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const durationOptions = ['Days', 'Weeks', 'Months', 'Years'];

  return (
    <Form.Group className="form-group-custom duration-field-row">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex align-items-center position-relative">
        <Form.Control
          type="number"
          min={1}
          value={value}
          placeholder={valuePlaceholder}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          className="duration-value-input me-2"
        />
        <Dropdown className="bg-white duration-unit-dropdown">
          <Dropdown.Toggle variant="outline-primary" id="durationDropdown">
            {unit}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {durationOptions.map((option) => (
              <Dropdown.Item
                key={option}
                onClick={() => onChange(option, 'durationUnit')}
              >
                {option}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {helpText && <Form.Control.Feedback>{helpText}</Form.Control.Feedback>}
    </Form.Group>
  );
};

DurationField.propTypes = {
  label: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  value: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  valuePlaceholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

DurationField.defaultProps = {
  helpText: '',
  valuePlaceholder: '',
};

export default DurationField;
