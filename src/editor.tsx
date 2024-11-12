// src/components/Editor.tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styled from "styled-components"

const Wrapper = styled.div`
  width: 520px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0px;
`;

const Editor: React.FC = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello, this is a TipTap editor in TypeScript!</p>',
  });

  if (!editor) {
    return null; // Editor가 로드되지 않았을 때 null을 반환하여 안전하게 처리
  }

  return (
    <>
      <Wrapper>
        <h2>TipTap Editor</h2>
        <EditorContent editor={editor} />
      </Wrapper>
    </>
  );
};

export default Editor;
