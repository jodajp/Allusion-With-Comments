import { observer } from 'mobx-react-lite';
import React, { useRef, useEffect } from 'react';

import { ClientFile } from '../entities/File';

interface IFileTagProp {
  file: ClientFile;
}

const stopPropagation = (e: React.KeyboardEvent<HTMLTextAreaElement>) => e.stopPropagation();

const CommentField = observer(({ file }: IFileTagProp) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set initial value when textareaRef is defined
    if (textareaRef.current) {
      if (typeof file.comments != 'undefined' && file.comments != 'undefined') {
        textareaRef.current.value = file.comments;
      } else {
        textareaRef.current.value = '';
      }
    }
  }, [file.comments]); // Update when file.comments changes

  const handleChange = async () => {
    if (textareaRef.current) {
      const comment = textareaRef.current.value;
      file.setComment(comment);
    }
  };

  return (
    <textarea
      className="input-comoment"
      name="comment"
      id="comment"
      ref={textareaRef}
      onChange={handleChange}
      onKeyDown={stopPropagation}
    ></textarea>
  );
});

export default CommentField;
