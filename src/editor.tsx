import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { server_ip } from "./main";
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import "./styles/editor-style.css"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
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
import DragHandle from '@tiptap-pro/extension-drag-handle-react'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import 'katex/dist/katex.min.css'
import Details from '@tiptap-pro/extension-details'
import DetailsContent from '@tiptap-pro/extension-details-content'
import DetailsSummary from '@tiptap-pro/extension-details-summary'

// Custom Node
import { CustomImage } from './components/custom-image';

const Editor = () => {
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
      TaskItem.configure({
        nested: true,
      }),
      CustomImage,
    ],
  });

  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const url = window.prompt('Enter a image URL.')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    // cancelled
    if (url === null) {
      return
    }
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()
      return
    }
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])


  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const { category = "" } = useParams<{ category: string }>();
  const { urlId = "" } = useParams<{ urlId: string }>();

  const navigate = useNavigate();

  useEffect(() => {
    loadDataFromBackend(urlId, category);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setName(user.displayName);
      } else {
        setName("No user name info.");
      }
    });

    return () => unsubscribe();
  }, [])
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlId === "") {
      insertDataToBackend(title, name, category);
      const ok = confirm("Save Complete!");
      ok ? navigate("/" + category) : null;
    } else {
      updateDataToBackend(urlId, title, category);
      const ok = confirm("Update Complete!");
      ok ? navigate("/" + category) : null;
    }
  }
  const goCategory = () => {
    navigate("/" + category);
  };
  
  const insertDataToBackend = async (title: string, name: string, category: string) => {
    const content = editor.getJSON();
    console.log(content);
    try {
      const response = await fetch(`${server_ip}/api/insert_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, title, content, category }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error sending data to sever:', error);
    }
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

      return data.name
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  const updateDataToBackend = async (id: string, title: string, category: string) => {
    const content = editor.getJSON();
    console.log(content);
    try {
      const response = await fetch(`${server_ip}/api/update_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title, content, category }),
      });
      const data = await response.json();
      console.log('Response from server:', data);
    } catch (error) {
      console.error('Error sending data to sever:', error);
    }
  }

  return (
    <>
      <div className="editor">
        <form onSubmit={onSubmit} className="editor-top-menu">
          <button onClick={goCategory} className="previous-button">
            &larr;
          </button>
          <span className="viewer-editor-tag">Editor</span>
          <input
            className="input-title"
            onChange={onChange}
            value={title}
            name="title"
            placeholder="Title"
            type="text"
            required
          />
          <input
            className="submit-button"
            type="submit"
            value={urlId !== "" ? "Update" : "Save"}
          />
        </form>
        <div className="control-group">
          <div className="button-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "is-active" : ""}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5"/>
              </svg>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.321 1.5L4 20h5M4 5l2-1v6m-2 0h4"/>
              </svg>
            </button>

            <button
              onClick={() =>
                editor.chain().focus().sinkListItem("listItem").run()
              }
              disabled={!editor.can().sinkListItem("listItem")}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h12M6 18h12m-5-8h5m-5 4h5M6 9v6l3.5-3L6 9Z"/>
              </svg>
            </button>

            <button
              onClick={() =>
                editor.chain().focus().liftListItem("listItem").run()
              }
              disabled={!editor.can().liftListItem("listItem")}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h12M6 18h12m-5-8h5m-5 4h5M9.5 9v6L6 12l3.5-3Z"/>
              </svg>
            </button>

            <button
              onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-h-1">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M19 18v-8l-2 2" />
                <path d="M4 6v12" />
                <path d="M12 6v12" />
                <path d="M11 18h2" />
                <path d="M3 18h2" />
                <path d="M4 12h8" />
                <path d="M3 6h2" />
                <path d="M11 6h2" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-h-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M17 12a2 2 0 1 1 4 0c0 .591 -.417 1.318 -.816 1.858l-3.184 4.143l4 0" />
                <path d="M4 6v12" />
                <path d="M12 6v12" />
                <path d="M11 18h2" />
                <path d="M3 18h2" />
                <path d="M4 12h8" />
                <path d="M3 6h2" />
                <path d="M11 6h2" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-h-3">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M19 14a2 2 0 1 0 -2 -2" />
                <path d="M17 16a2 2 0 1 0 2 -2" />
                <path d="M4 6v12" />
                <path d="M12 6v12" />
                <path d="M11 18h2" />
                <path d="M3 18h2" />
                <path d="M4 12h8" />
                <path d="M3 6h2" />
                <path d="M11 6h2" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={editor.isActive('taskList') ? 'is-active' : ''}
            >
              <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
            >
              <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"></path>
              </svg>
            </button>

            <button onClick={addImage}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
              </svg>
            </button>

            <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"/>
              </svg>
            </button>

            <button
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M13.2131 9.78732c-.6359-.63557-1.4983-.99259-2.3974-.99259-.89911 0-1.76143.35702-2.39741.99259l-3.4253 3.42528C4.35719 13.8485 4 14.7108 4 15.61c0 .8992.35719 1.7616.99299 2.3974.63598.6356 1.4983.9926 2.39742.9926.89912 0 1.76144-.357 2.39742-.9926l.32157-.3043m-.32157-4.4905c.63587.6358 1.49827.993 2.39747.993.8991 0 1.7615-.3572 2.3974-.993l3.4243-3.42528c.6358-.63585.993-1.49822.993-2.39741 0-.89919-.3572-1.76156-.993-2.39741C17.3712 4.357 16.509 4 15.6101 4c-.899 0-1.7612.357-2.397.9925l-1.0278.96062m7.3873 14.04678-1.7862-1.7862m0 0L16 16.4274m1.7864 1.7863 1.7862-1.7863m-1.7862 1.7863L16 20"/>
              </svg>
            </button>
            
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'is-active' : ''}
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
              </svg>
            </button>
            
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 12h14"/>
                <path stroke="currentColor" strokeLinecap="round" d="M6 9.5h12m-12-2h12m-12-2h12m-12 13h12m-12-2h12m-12-2h12"/>
              </svg>
            </button>

            <button onClick={() => editor.chain().focus().setDetails().run()} disabled={!editor.can().setDetails()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 4m0 1a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1z" />
                <path d="M4 8l16 0" />
                <path d="M8 4l0 4" />
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().unsetDetails().run()} disabled={!editor.can().unsetDetails()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 4h11a1 1 0 0 1 1 1v11m-.288 3.702a1 1 0 0 1 -.712 .298h-14a1 1 0 0 1 -1 -1v-14c0 -.276 .112 -.526 .293 -.707" />
                <path d="M4 8h4m4 0h8" />
                <path d="M3 3l18 18" />
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h10.5M3 15v-4m0 4h11M3 11V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5M3 11h18m0 0v1M8 11v8m4-8v8m4-8v2m1 4h2m0 0h2m-2 0v2m0-2v-2"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v14m-8-7h2m0 0h2m-2 0v2m0-2v-2m12 1h-6m6 4h-6M4 19h16c.5523 0 1-.4477 1-1V6c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Z"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().deleteColumn().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5v14m-6-8h6m-6 4h6m4.506-1.494L15.012 12m0 0 1.506-1.506M15.012 12l1.506 1.506M15.012 12l-1.506-1.506M20 19H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1Z"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().addRowBefore().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3M3 15V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9M3 15h18M8 15v4m4-4v4m4-4v4m-6-9h2m0 0h2m-2 0v2m0-2V8"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().addRowAfter().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44771 1 1v3M3 9v9c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1V9M3 9h18M8 9V5m4 4V5m4 4V5m-6 9h2m0 0h2m-2 0v-2m0 2v2"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().deleteRow().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3M3 15V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9M3 15h18M8 15v4m4-4v4m4-4v4m-5.5061-7.4939L12 10m0 0 1.5061-1.50614M12 10l1.5061 1.5061M12 10l-1.5061-1.50614"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().deleteTable().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h10.5M3 15v-4m0 4h11M3 11V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5M3 11h18m0 0v1M8 11v8m4-8v8m4-8v2m1.8956 5.9528 1.5047-1.5047m0 0 1.5048-1.5048m-1.5048 1.5048 1.4605 1.4604m-1.4605-1.4604-1.4604-1.4605"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().mergeCells().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18v2H4V4h6v2m4 12v2h6V4h-6v2m-6.49543 8.4954L10 12m0 0L7.50457 9.50457M10 12H4.05191m12.50199 2.5539L14 12m0 0 2.5539-2.55392M14 12h5.8319"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().splitCell().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18v2h6V4H4v2m16 12v2h-6V4h6v2M6.49545 14.4954 4.00003 12m0 0 2.49542-2.49543M4.00003 12h5.94809m7.49798 2.5539L20 12m0 0-2.5539-2.55392M20 12h-5.8319"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v14m6-8h-6m6 4h-6m-9-3h1.99093M4 19h16c.5523 0 1-.4477 1-1V6c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Zm8-7c0 1.1046-.8954 2-2 2-1.10457 0-2-.8954-2-2s.89543-2 2-2c1.1046 0 2 .8954 2 2Z"/>
              </svg>
            </button>
            <button onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3M3 15V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9M3 15h18M8 15v4m4-4v4m4-4v4m-7-9h1.9909M15 10c0 1.1046-.8954 2-2 2s-2-.8954-2-2c0-1.10457.8954-2 2-2s2 .89543 2 2Z"/>
              </svg>
            </button>
          </div>
          {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="button-group">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 20H5.5c-.27614 0-.5-.2239-.5-.5v-3c0-.2761.22386-.5.5-.5h13c.2761 0 .5.2239.5.5v3c0 .2761-.2239.5-.5.5H18m-6-1 1.42 1.8933c.04.0534.12.0534.16 0L15 19m-7-6 3.9072-9.76789c.0335-.08381.1521-.08381.1856 0L16 13m-8 0H7m1 0h1.5m6.5 0h-1.5m1.5 0h1m-7-3.00001h4"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
              >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16C6 18.2091 7.79086 20 10 20H14C16.2091 20 18 18.2091 18 16C18 13.7909 16.2091 12 14 12M18 8C18 5.79086 16.2091 4 14 4H10C7.79086 4 6 5.79086 6 8M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h8m-8 4h12M6 14h8m-8 4h12"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h8M6 10h12M8 14h8M6 18h12"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6h-8m8 4H6m12 4h-8m8 4H6"/>
                </svg>
              </button>

              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6H6m12 4H6m12 4H6m12 4H6"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "is-active" : ""}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1Zm0 0v2a4 4 0 0 1-4 4H5m14-6V8a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1Zm0 0v2a4 4 0 0 1-4 4h-1"/>
                </svg>
              </button>
            </div>
          </BubbleMenu>}
          <DragHandle editor={editor} tippyOptions={{ placement: 'left' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            </svg>
          </DragHandle>
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default Editor;
