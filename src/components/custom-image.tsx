import { Node } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

export const CustomImage = Node.create({
  name: 'customImage',

  group: 'inline',

  inline: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.custom-image-wrapper > img',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'custom-image-wrapper' },
      ['img', HTMLAttributes],
    ];
  },

  addCommands() {
    return {
      setImage:
        ({ src, alt, title }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src, alt, title },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const clipboardData = event.clipboardData;
            const items = clipboardData?.items;

            if (items) {
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith('image/')) {
                  const file = item.getAsFile();
                  if (file) {
                    const reader = new FileReader();

                    reader.onload = () => {
                      const src = reader.result;

                      // Insert the custom image node directly
                      const transaction = view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.customImage.create({
                          src: src,
                          alt: file.name,
                          title: file.name,
                        })
                      );
                      view.dispatch(transaction);
                    };

                    reader.readAsDataURL(file);
                    event.preventDefault(); // 기본 붙여넣기 동작 차단
                    return true;
                  }
                }
              }
            }
            return false; // 기본 붙여넣기 동작을 처리
          },
        },
      }),
    ];
  },
});
