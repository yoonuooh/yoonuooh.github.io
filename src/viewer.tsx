import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { auth } from "./firebase";
import "./styles/viewer-style.css"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Document from '@tiptap/extension-document'
import BulletList from "@tiptap/extension-bullet-list"
import Blockquote from "@tiptap/extension-blockquote"
import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Highlight from '@tiptap/extension-highlight'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'

// Pro Extension
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import 'katex/dist/katex.min.css'
import Details from '@tiptap-pro/extension-details'
import DetailsContent from '@tiptap-pro/extension-details-content'
import DetailsSummary from '@tiptap-pro/extension-details-summary'
import { server_ip } from "./main";

// Custom Node
import { CustomImage } from './components/custom-image';

const Viewer = () => {  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      BulletList,
      Blockquote,
      CodeBlock,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      HorizontalRule,
      ListItem,
      OrderedList,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Bold,
      Code,
      Highlight.configure({
        multicolor: true
      }),
      Italic,
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
      Strike,
      Underline,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Dropcursor,
      Mathematics,
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: 'details',
        },
      }),
      DetailsSummary,
      DetailsContent,
      TaskList,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CustomImage,
    ],
  });

  if (!editor) {
    return null;
  }

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [isEditable, setEditable] = useState(false);
  const { category = "" } = useParams<{ category: string }>();
  const { urlId = "" } = useParams<{ urlId: string }>();

  const navigate = useNavigate();
  editor.setEditable(false);

  const goNotice = (id: string) => {
    navigate("/" + category + "/editor/" + id);
  };
  const goCategory = () => {
    navigate("/" + category);
  };

  const loadDataFromBackend = async (id: string, category: string) => {
    try {
      const response = await fetch(`${server_ip}/api/load_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, category }),
      });
      const data = await response.json();
      console.log(data);
      editor.commands.setContent(data.content);
      setTitle(data.title);
      if (name === data.name) {
        setEditable(true);
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.displayName) {
      setName(user.displayName);
      name ? loadDataFromBackend(urlId, category) : null;
    }
  }, [name])

  return (
    <>
      <div className="editor">
        <div className="viewer-top-menu">
          <button onClick={goCategory} className="previous-button">
            &larr;
          </button>
          <span className="viewer-editor-tag">Viewer</span>
          <input
            className="input-title"
            value={title}
            name="title"
            placeholder="Title"
            type="text"
            disabled
          />
          {isEditable ? (
            <button onClick={() => goNotice(urlId)} className="new-page">
              Edit
            </button>
          ) : (
            ""
          )}
        </div>
        <div className="viewer-control-group">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default Viewer;
