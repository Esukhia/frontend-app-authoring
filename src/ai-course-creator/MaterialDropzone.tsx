import { useRef, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Form, Icon, Spinner,
} from '@openedx/paragon';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Description as FileIcon,
  FileUpload as UploadIcon,
  Link as LinkIcon,
} from '@openedx/paragon/icons';

import type { MaterialData } from './data/api';
import messages from './messages';

interface Props {
  materials: MaterialData[];
  isUploading: boolean;
  onUploadFile: (file: File) => void;
  onUploadLink: (url: string) => void;
  onDeleteMaterial: (id: number) => void;
}

const MaterialDropzone = ({
  materials, isUploading, onUploadFile, onUploadLink, onDeleteMaterial,
}: Props) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (files && files.length) {
      Array.from(files).forEach(onUploadFile);
    }
  };

  const handleSubmitLink = () => {
    const url = linkValue.trim();
    if (url) {
      onUploadLink(url);
    }
    setLinkValue('');
    setIsAddingLink(false);
  };

  const handleCancelLink = () => {
    setLinkValue('');
    setIsAddingLink(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small font-weight-bold text-muted text-uppercase">
          {intl.formatMessage(messages.materialsHeading)}
        </span>
        {!isAddingLink && (
          <Button variant="link" size="sm" onClick={() => setIsAddingLink(true)} style={{ padding: 0, fontSize: '0.8125rem' }}>
            + {intl.formatMessage(messages.addLinkButton)}
          </Button>
        )}
      </div>

      {isAddingLink && (
        <div className="mb-2">
          <Form.Control
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { handleSubmitLink(); }
              if (e.key === 'Escape') { handleCancelLink(); }
            }}
            placeholder={intl.formatMessage(messages.addLinkPlaceholder)}
            className="mb-2"
          />
          <div className="d-flex" style={{ gap: '0.5rem' }}>
            <Button
              variant="primary"
              size="sm"
              iconBefore={CheckIcon}
              onClick={handleSubmitLink}
              disabled={!linkValue.trim()}
            >
              {intl.formatMessage(messages.addLinkConfirm)}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={handleCancelLink}
            >
              {intl.formatMessage(messages.cancelButton)}
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="d-block w-100 rounded text-center"
        style={{
          padding: '1.5rem 1rem',
          border: `2px dashed ${isDragging ? '#0076BD' : '#ced4da'}`,
          background: isDragging ? 'rgba(0,118,189,0.04)' : '#fafafa',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {isUploading ? (
          <Spinner animation="border" size="sm" screenReaderText="uploading" />
        ) : (
          <Icon
            src={UploadIcon}
            style={{ width: '1.75rem', height: '1.75rem' }}
            className="text-muted"
          />
        )}
        <p className="small text-muted mb-0 mt-1" style={{ lineHeight: 1.3 }}>
          {intl.formatMessage(messages.dropzoneLabel)}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.pptx,.txt,.md"
        className="d-none"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {materials.length > 0 && (
        <div className="mt-2 border rounded" style={{ overflow: 'hidden' }}>
          {materials.map((material, idx) => (
            <div
              key={material.id}
              className="d-flex align-items-center px-2 py-2"
              style={{ borderTop: idx > 0 ? '1px solid #dee2e6' : 'none' }}
            >
              <Icon
                src={material.sourceType === 'link' ? LinkIcon : FileIcon}
                className="text-muted mr-2 flex-shrink-0"
                style={{ width: '1rem', height: '1rem' }}
              />
              <span
                className="small flex-grow-1 text-truncate mr-2"
                title={material.name}
                style={{ minWidth: 0 }}
              >
                {material.name}
              </span>
              <button
                type="button"
                className="btn btn-link p-0 text-muted"
                style={{ flexShrink: 0, lineHeight: 1 }}
                onClick={() => onDeleteMaterial(material.id)}
                aria-label={intl.formatMessage(messages.removeMaterial, { name: material.name })}
              >
                <Icon src={CloseIcon} style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialDropzone;
