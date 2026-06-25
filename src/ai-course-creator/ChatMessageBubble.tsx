import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Form, Icon, IconButton,
} from '@openedx/paragon';
import {
  AutoAwesome as SparkleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

interface Props {
  author: 'user' | 'assistant';
  content: string;
  canEdit?: boolean;
  onEdit?: (newContent: string) => void;
}

/**
 * A single chat bubble. Assistant text is shown with preserved whitespace so the
 * one-question-at-a-time, paragraph-style replies read naturally. User messages
 * can be edited in place (when ``canEdit``); saving resends from that point and
 * discards the replies that followed.
 */
const ChatMessageBubble = ({
  author, content, canEdit = false, onEdit,
}: Props) => {
  const intl = useIntl();
  const isAssistant = author === 'assistant';
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const startEditing = () => {
    setDraft(content);
    setIsEditing(true);
  };

  const submitEdit = () => {
    const text = draft.trim();
    if (!text) { return; }
    setIsEditing(false);
    onEdit?.(text);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(content);
  };

  if (isEditing) {
    return (
      <div className="d-flex mb-3">
        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
          <Form.Control
            as="textarea"
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
              }
            }}
            className="w-100"
            style={{ resize: 'none', minHeight: '7rem' }}
            autoFocus
          />
          <small className="text-muted mt-1">{intl.formatMessage(messages.editWarning)}</small>
          <div className="d-flex mt-2 justify-content-end" style={{ gap: '0.5rem' }}>
            <Button variant="tertiary" size="sm" onClick={cancelEdit}>
              {intl.formatMessage(messages.cancelEdit)}
            </Button>
            <Button variant="primary" size="sm" onClick={submitEdit} disabled={!draft.trim()}>
              {intl.formatMessage(messages.saveEdit)}
            </Button>
          </div>
        </div>
        <span className="ml-2 mt-1 text-gray-500" aria-hidden>
          <Icon src={PersonIcon} />
        </span>
      </div>
    );
  }

  return (
    <div className={`ai-chat-bubble-row d-flex mb-3 align-items-start ${isAssistant ? 'justify-content-start' : 'justify-content-end'}`}>
      {isAssistant && (
        <span className="mr-2 mt-1 text-primary" aria-hidden>
          <Icon src={SparkleIcon} />
        </span>
      )}
      {!isAssistant && canEdit && (
        <IconButton
          src={EditIcon}
          iconAs={Icon}
          size="sm"
          alt={intl.formatMessage(messages.editMessage)}
          onClick={startEditing}
          className="ai-chat-edit-btn align-self-center mr-1"
        />
      )}
      <div
        className={`p-3 rounded ${isAssistant ? 'bg-light text-dark' : 'bg-primary text-white'}`}
        style={{ maxWidth: '80%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
      </div>
      {!isAssistant && (
        <span className="ml-2 mt-1 text-gray-500" aria-hidden>
          <Icon src={PersonIcon} />
        </span>
      )}
    </div>
  );
};

export default ChatMessageBubble;
