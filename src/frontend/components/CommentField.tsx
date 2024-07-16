import { observer } from 'mobx-react-lite';
import React, { useRef, useEffect } from 'react';

import { useStore } from '../contexts/StoreContext';
import { ClientFile } from '../entities/File';

interface IFileTagProp {
  file: ClientFile;
}

const CommentField = observer(({ file }: IFileTagProp) => {
  const { commentStore } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set initial value when textareaRef is defined
    if (textareaRef.current) {
      textareaRef.current.value = file.comments;
    }
  }, [file.comments]); // Update when file.comments changes

  const handleChange = async () => {
    if (textareaRef.current) {
      const comment = textareaRef.current.value;
      console.log(comment);
      await commentStore.setComment(file, comment);
      file.setComment(comment);
    }
  };

  return (
    <>
      <textarea
        className="input-comoment"
        name="comment"
        id="comment"
        ref={textareaRef}
        onChange={handleChange}
      ></textarea>
    </>
  );
});

export default CommentField;
