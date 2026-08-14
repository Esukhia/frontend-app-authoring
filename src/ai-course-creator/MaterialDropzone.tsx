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
    if (url) { onUploadLink(url); }
    setLinkValue('');
    setIsAddingLink(false);
  };

  const handleCancelLink = () => {
    setLinkValue('');
    setIsAddingLink(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <span className="small font-weight-bold text-uppercase text-muted">
          {intl.formatMessage(messages.materialsHeading)}
        </span>
        <p className="small text-muted mb-0 mt-1" style={{ lineHeight: 1.4 }}>
          Share slides, docs, videos or links and WeBuddhist Academy will build your course around them.
        </p>
      </div>

      {/* File drop zone */}
      <button
        type="button"
        className="d-block w-100 rounded text-center"
        style={{
          padding: '1.25rem 1rem',
          border: `2px dashed ${isDragging ? '#0076BD' : '#ced4da'}`,
          background: isDragging ? 'rgba(0,118,189,0.06)' : '#f8f9fa',
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
            style={{ width: '1.5rem', height: '1.5rem' }}
            className={isDragging ? 'text-primary' : 'text-muted'}
          />
        )}
        <p className="small font-weight-bold mb-0 mt-1">
          {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
        </p>
        <p className="small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
          PDF, DOCX, PPTX, TXT
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

      {/* Divider */}
      <div className="d-flex align-items-center my-3" style={{ gap: '0.5rem' }}>
        <hr className="flex-grow-1 my-0" style={{ borderColor: '#dee2e6' }} />
        <span className="small text-muted px-1">or</span>
        <hr className="flex-grow-1 my-0" style={{ borderColor: '#dee2e6' }} />
      </div>

      {/* Link section */}
      {isAddingLink ? (
        <div>
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
          <p className="small text-muted mb-2" style={{ fontSize: '0.75rem' }}>
            Google Docs, YouTube, Canva, Notion, any public URL
          </p>
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
            <Button variant="tertiary" size="sm" onClick={handleCancelLink}>
              {intl.formatMessage(messages.cancelButton)}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline-primary"
          className="w-100"
          size="sm"
          iconBefore={LinkIcon}
          onClick={() => setIsAddingLink(true)}
        >
          {intl.formatMessage(messages.addLinkButton)}
        </Button>
      )}

      {/* Material list */}
      {materials.length > 0 && (
        <div className="mt-3 border rounded" style={{ overflow: 'hidden' }}>
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
