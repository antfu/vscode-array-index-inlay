<p align="center">
<img src="https://github.com/antfu/vscode-array-index-inlay/blob/main/res/icon.png?raw=true" height="150">
</p>

<h1 align="center">Array Index Inlay <sup>VS Code</sup></h1>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=antfu.array-index-inlay" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/antfu.array-index-inlay.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23eee?style=flat"  alt="Made with reactive-vscode" /></a>
</p>

<p align="center">
Show array index inlay hints for large arrays.<br>
</p>

<p align="center">
<img width="696" alt="Screenshot" src="https://github.com/user-attachments/assets/6b7af3e5-1186-4526-bb9d-a24a32ffaa24">
</p>

## Configs

<!-- configs -->

| Key                             | Description                                                                                                                                             | Type      | Default          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------- |
| `arrayIndexInlay.enabled`       | Enable inlay hints                                                                                                                                      | `boolean` | `true`           |
| `arrayIndexInlay.minLength`     | Minimum length of array to show inlay hints                                                                                                             | `number`  | `15`             |
| `arrayIndexInlay.minLines`      | Minimum lines of array to show inlay hints                                                                                                              | `number`  | `30`             |
| `arrayIndexInlay.startIndex`    | Start index of the array, default to 0                                                                                                                  | `number`  | `0`              |
| `arrayIndexInlay.allowSpread`   | Show inlay hints even there are spread operators in the array                                                                                           | `boolean` | `false`          |
| `arrayIndexInlay.colorizeDepth` | Colorize the inlay hints based on the depth of the array. Colors can be customized with `arrayIndexInlay.depthColors`                                   | `boolean` | `false`          |
| `arrayIndexInlay.depthColors`   | Custom colors for each level of the array. Supports CSS color formats. Select an equal number of colors to your bracket colors to get the best results. | `array`   | See package.json |

<!-- configs -->

## Supported Languages

- JavaScript
- TypeScript
- JSX
- TSX
- JSON / JSONC / JSON5
- Vue
- Svelte
- Astro

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.png'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [Anthony Fu](https://github.com/antfu)
