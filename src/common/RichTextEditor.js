import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Helper: Convert HTML to EditorState
const htmlToEditorState = (html) => {
  if (!html) return EditorState.createEmpty();
  const contentBlock = htmlToDraft(html);
  if (contentBlock) {
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks
    );
    return EditorState.createWithContent(contentState);
  }
  return EditorState.createEmpty();
};

const RichTextEditor = ({
  value,
  onChange,
  error,
  placeholder,
  minHeight = 200,
  maxHeight = 600,
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // ✅ Always update editor when `value` changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setEditorState(htmlToEditorState(value));
    }
  }, [value]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    onChange(html);
  };

  return (
    <div className="mb-4">
      <div
        className={`rounded-lg border ${
          error ? "border-red-500" : "border-gray-300"
        } shadow-sm bg-white`}
      >
        <Editor
          editorState={editorState}
          toolbarClassName="rounded-t-lg border-b border-gray-200 bg-gray-50 sticky top-0 z-10"
          wrapperClassName="rounded-lg"
          editorClassName="px-3 py-2 focus:outline-none"
          onEditorStateChange={handleEditorChange}
          placeholder={placeholder || "Start typing your content..."}
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "list",
              "textAlign",
              "colorPicker",
              "link",
              "emoji",
              "history",
            ],
            inline: {
              options: ["bold", "italic", "underline", "strikethrough"],
            },
            list: { options: ["unordered", "ordered"] },
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Height control via wrapper */}
      <style>{`
        .rdw-editor-main {
          min-height: ${minHeight}px;
          max-height: ${maxHeight}px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
