import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Toast } from '@openedx/paragon';
import messages from './messages';

const ApiStatusToast = ({
  actionType,
  selectedRowCount,
  isOpen,
  setClose,
  setSelectedRows,
  fileType,
  icon,
}) => {
  const intl = useIntl();
  const handleClose = () => {
    setSelectedRows([]);
    setClose();
  };

  return (
    <Toast
      show={isOpen}
      onClose={handleClose}
    >
      <div className="d-flex align-items-center">
        {icon && <Icon src={icon} className="mr-2" style={{ fontSize: '1.25rem' }} />}
        <span>
          {intl.formatMessage(messages.apiStatusToastMessage, { actionType, selectedRowCount, fileType })}
        </span>
      </div>
    </Toast>
  );
};

ApiStatusToast.propTypes = {
  actionType: PropTypes.string.isRequired,
  selectedRowCount: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setClose: PropTypes.func.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
};

ApiStatusToast.defaultProps = {
  icon: null,
};

export default ApiStatusToast;
