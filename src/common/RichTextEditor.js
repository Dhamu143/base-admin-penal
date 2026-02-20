import { useState, useEffect } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const htmlToEditorState = (html) => {
  if (!html || html === "<p><br></p>") return EditorState.createEmpty();
  const contentBlock = htmlToDraft(html);
  if (contentBlock && contentBlock.contentBlocks) {
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks
    );
    return EditorState.createWithContent(contentState);
  }
  return EditorState.createEmpty();
};

const editorStateToHtml = (editorState) =>
  draftToHtml(convertToRaw(editorState.getCurrentContent()));

const RichTextEditor = ({
  value,
  onChange,
  error,
  placeholder,
  minHeight = 200,
  maxHeight = 600,
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Only update editorState if `value` changed externally
  // useEffect(() => {
  //   if (value !== undefined && value !== null) {
  //     const currentHtml = editorStateToHtml(editorState);
  //     if (currentHtml !== value) {
  //       setEditorState(htmlToEditorState(value));
  //     }
  //   }
  // }, [value]);
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setEditorState((prevState) => {
        const currentHtml = editorStateToHtml(prevState);
        if (currentHtml !== value) {
          return htmlToEditorState(value);
        }
        return prevState;
      });
    }
  }, [value]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    if (onChange) {
      onChange(editorStateToHtml(state));
    }
  };

  return (
    <div className="mb-4">
      <div
        className={`rounded-lg border ${error ? "border-red-500" : "border-gray-300"
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
