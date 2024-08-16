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
  'json',
  'jsonc',
  'json5',
  'vue',
  'svelte',
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
          'position: relative;',
          'bottom: 10%;',
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
        let text = editor.document.getText()
        let offset = 0

        if (['json', 'jsonc', 'json5'].includes(editor.document.languageId)) {
          const prefix = 'const x = '
          text = prefix + text
          offset = -prefix.length
        }
        else if (['vue', 'svelte'].includes(editor.document.languageId)) {
          const match = /(<script[^>]*>)([\s\S]*?)<\/script>/.exec(text)

          if (match) {
            const scriptContent = match[2]
            offset = match.index + match[1].length
            text = scriptContent
          }
        }

        const ast = parseSync(
          text,
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
            if (path.node.elements.length < minLength && (path.node.loc!.end.line - path.node.loc!.start.line) < config.minLines) {
              return
            }
            if (!config.allowSpread && path.node.elements.some(el => el?.type === 'SpreadElement')) {
              return
            }
            let hasSpread = false
            path.node.elements.forEach((el, index) => {
              if (!el) {
                return
              }
              const pos = editor.document.positionAt(el.start! + offset)
              items.push({
                range: new Range(pos, pos),
                renderOptions: {
                  before: {
                    contentText: `${hasSpread ? '?' : '#'}${index + indexBase}`,
                  },
                },
              })
              if (el.type === 'SpreadElement') {
                hasSpread = true
              }
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
