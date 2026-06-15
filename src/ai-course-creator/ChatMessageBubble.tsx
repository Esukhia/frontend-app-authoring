import { Icon } from '@openedx/paragon';
import { AutoAwesome as SparkleIcon, Person as PersonIcon } from '@openedx/paragon/icons';

interface Props {
  author: 'user' | 'assistant';
  content: string;
}

/**
 * A single chat bubble. Assistant text is shown with preserved whitespace so the
 * one-question-at-a-time, paragraph-style replies read naturally.
 */
const ChatMessageBubble = ({ author, content }: Props) => {
  const isAssistant = author === 'assistant';
  return (
    <div className={`d-flex mb-3 ${isAssistant ? 'justify-content-start' : 'justify-content-end'}`}>
      {isAssistant && (
        <span className="mr-2 mt-1 text-primary" aria-hidden>
          <Icon src={SparkleIcon} />
        </span>
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
