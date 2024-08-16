import { defineExtension, useActiveTextEditor } from 'reactive-vscode'
import type { DecorationOptions } from 'vscode'
import { Range } from 'vscode'
import { parseSync } from '@babel/core'
import traverse from '@babel/traverse'
// @ts-expect-error missing types
import preset from '@babel/preset-typescript'
import { logger } from './utils'
import { config } from './config'
import { useEditorDecorations } from './vendor/decorations'

const SupportedLanguages = [
  'javascript',
  'typescript',
  'javascriptreact',
  'typescriptreact',
  // TODO: more languages
]

const { activate, deactivate } = defineExtension(() => {
  const editor = useActiveTextEditor()

  useEditorDecorations(
    editor,
    {
      opacity: '1; position: relative;',
      before: {
        margin: [
          'auto 0;',
          'position: absolute;',
          'top: 50%;',
          'width: max-content;',
          'text-align: right;',
          'border-radius: 0.2em;',
          'padding: 0 0.3em;',
          'color: var(--vscode-editorInlayHint-foreground, #888);',
          'background: var(--vscode-editorInlayHint-background, #8885);',
          'font-size: 0.7em;',
          'transform: translate(calc(-100% - 0.05em), -50%);',
          'line-height: 1.5em;',
        ].join(' '),
      },
    },
    (editor): DecorationOptions[] => {
      if (!SupportedLanguages.includes(editor.document.languageId)) {
        return []
      }

      const items: DecorationOptions[] = []

      try {
        const ast = parseSync(
          editor.document.getText(),
          {
            filename: editor.document.uri.fsPath,
            presets: [preset],
            babelrc: false,
          },
        )

        if (!ast) {
          return []
        }

        const indexBase = config.startIndex
        const minLength = config.minLength

        traverse(ast, {
          ArrayExpression(path) {
            if (path.node.elements.length < minLength) {
              return
            }
            if (path.node.elements.some(el => el?.type === 'SpreadElement')) {
              return
            }
            path.node.elements.forEach((el, index) => {
              if (!el) {
                return
              }
              const pos = editor.document.positionAt(el.start!)
              items.push({
                range: new Range(pos, pos),
                renderOptions: {
                  before: {
                    contentText: `#${index + indexBase}`,
                  },
                },
              })
            })
          },
        })
      }
      catch (error) {
        logger.error(error)
      }

      return items
    },
  )
})

export { activate, deactivate }
