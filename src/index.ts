import { defineExtension, useActiveTextEditor, useCommand, useEditorDecorations, useStatusBarItem } from 'reactive-vscode'
import type { DecorationOptions } from 'vscode'
import { ConfigurationTarget, Range, StatusBarAlignment } from 'vscode'
import { parseSync } from '@babel/core'
import traverse from '@babel/traverse'
// @ts-expect-error missing types
import presetTs from '@babel/preset-typescript'
// @ts-expect-error missing types
import presetJsx from '@babel/preset-react'
import { logger } from './utils'
import { config } from './config'
import { commands, name } from './generated/meta'

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
  'astro',
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
      if (!config.enabled)
        return []
      if (!SupportedLanguages.includes(editor.document.languageId))
        return []

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
        else if (['astro'].includes(editor.document.languageId)) {
          const match = /(---)([\s\S]*?)---/.exec(text)

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
            presets: [presetTs, presetJsx],
            babelrc: false,
          },
        )

        if (!ast) {
          return []
        }

        const indexBase = config.startIndex
        const minLength = config.minLength
        const minLines = config.minLines
        const colorizeDepth = config.colorizeDepth

        const depthColors = config.depthColors.map(c => c.trim()).filter(c => c !== '')
        const depthBackgroundColors = depthColors.map(color => `color-mix(in srgb, ${color} 10%, transparent)`)

        let depth = 0
        const trackDepth = {
          enter: () => { depth++ },
          exit: () => { depth-- },
        }

        traverse(ast, {
          ObjectExpression: trackDepth,
          BlockStatement: trackDepth,
          ArrowFunctionExpression: trackDepth,
          NewExpression: trackDepth,
          ArrayExpression: {
            enter() {
              depth++
            },
            exit: (path) => {
              depth--

              if (path.node.elements.length < minLength && (path.node.loc!.end.line - path.node.loc!.start.line) < minLines) {
                return
              }
              if (!config.allowSpread && path.node.elements.some(el => el?.type === 'SpreadElement')) {
                return
              }

              const colorIndex = depth % depthColors.length
              const colors = colorizeDepth
                ? {
                    color: depthColors[colorIndex],
                    backgroundColor: depthBackgroundColors[colorIndex],
                  }
                : {}
              const digits = path.node.elements.length.toString().length
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
                      ...colors,
                      contentText: `${hasSpread ? '?' : ''}#${index + indexBase}`.padStart(digits + 1, ' '),
                    },
                  },
                })
                if (el.type === 'SpreadElement') {
                  hasSpread = true
                }
              })
            },
          },
        })
      }
      catch (error) {
        logger.error(error)
      }

      return items
    },
  )

  useCommand(
    commands.toggle,
    () => config.$update('enabled', !config.enabled, ConfigurationTarget.Global),
  )

  useStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 100,
    id: name,
    text: () => config.enabled ? '[#23]' : '[   ]',
    tooltip: () => `${config.enabled ? 'Disable' : 'Enable'} array index inlay hints`,
    command: commands.toggle,
  }).show()
})

export { activate, deactivate }
