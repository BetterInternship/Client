'use client'
// InitializedMDXEditor.tsx
import { useRef, type ForwardedRef } from 'react'
import '@mdxeditor/editor/style.css'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
} from '@mdxeditor/editor'

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const innerRef = useRef<MDXEditorMethods | null>(null)

  const setRefs = (node: MDXEditorMethods | null) => {
    innerRef.current = node
    if (typeof editorRef === 'function') editorRef(node)
    else if (editorRef) editorRef.current = node
  }

  return (
    // `contents` keeps layout unchanged; the wrapper only catches bubbling clicks.
    <div
      className='contents'
      onMouseDown={(e) => {
        // The editable area only spans its content, so clicks on the empty
        // space around it should still focus the editor.
        const target = e.target as HTMLElement
        if (target.closest('[contenteditable="true"], [role="toolbar"], button, [role="combobox"], [role="listbox"], [role="option"], [role="menu"]')) return
        e.preventDefault()
        innerRef.current?.focus(undefined, { defaultSelection: 'rootEnd' })
      }}
    >
    <MDXEditor
      contentEditableClassName='prose'
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: 'my-classname w-full',
          toolbarContents: () => (
            <div className="relative flex flex-row">
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <ListsToggle />
            </div>
          )
        })
      ]}
      {...props}
      ref={setRefs}
    />
    </div>
  )
}