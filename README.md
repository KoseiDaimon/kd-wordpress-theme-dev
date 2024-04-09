<p align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" width="100" />
</p>
<p align="center">
    <h1 align="center">WORDPRESS-THEME-VITE</h1>
</p>
<p align="center">
    <em>WordPress Theme Development with Vite</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/KoseiDaimon/wordpress-theme-vite?style=flat&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/KoseiDaimon/wordpress-theme-vite?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/KoseiDaimon/wordpress-theme-vite?style=flat&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/KoseiDaimon/wordpress-theme-vite?style=flat&color=0080ff" alt="repo-language-count">
<p>
<p align="center">
		<em>Developed with the software and tools below.</em>
</p>
<p align="center">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" alt=".ENV">
	<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=flat&logo=HTML5&logoColor=white" alt="HTML5">
	<img src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white" alt="PostCSS">
	<img src="https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=flat&logo=Autoprefixer&logoColor=white" alt="Autoprefixer">
	<br>
	<img src="https://img.shields.io/badge/Sass-CC6699.svg?style=flat&logo=Sass&logoColor=white" alt="Sass">
	<img src="https://img.shields.io/badge/sharp-99CC00.svg?style=flat&logo=sharp&logoColor=white" alt="sharp">
	<img src="https://img.shields.io/badge/PHP-777BB4.svg?style=flat&logo=PHP&logoColor=white" alt="PHP">
	<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
	<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
</p>
<hr>

## Overview

WORDPRESS-THEME-VITE は、Vite を使用した WordPress テーマ開発のテンプレートです。
Vite ですが、タスクの自動化（タスクランナー）を主な機能としております。

WordPress 環境は、別途構築する必要があります。
このファイルを `/wp-content/themes/` の直下に配置するだけです。
導入しやすいように、php 側で特別な設定は一切必要ないようにしました。

## Features

- **シンプルなディレクトリ構成**
  Vite に関するファイルは、`./vite/` ディレクトリにまとめ、とにかくわかりやすいディレクトリ構成にしました。
  Vite をあまり知らなくても、使いやすくて汎用性は高いと思います。

- **ホットリロード**
  開発中にブラウザを手動で更新することなく、最新の状態を確認できます。

- **Sass のコンパイル**
  Sass をコンパイルします。Dart Sass 対応です。
  コンパイルした CSS を圧縮できます。

- **画像の圧縮・最適化**
  画像を自動的に圧縮・最適化できます。

- **JavaScript のバンドリング**
  JavaScript をバンドルおよび最適化します。

- **オプション（環境変数）**
  `.env` ファイルを編集することで、Vite の知識が無くても多少カスタマイズできるようにしています。

## Repository Structure

```sh
└── wordpress-theme-vite/
    ├── 404.php
    ├── README.md
    ├── archive.php
    ├── footer.php
    ├── front-page.php
    ├── functions.php
    ├── header.php
    ├── home.php
    ├── index.php
    ├── page.php
    ├── sidebar.php
    ├── single.php
    ├── style.css
    └── vite
        ├── .browserslistrc
        ├── .env
        ├── config
        │   ├── env.js
        │   ├── images.js
        │   ├── sass.js
        │   └── utils
        │       ├── copyDir.js
        │       ├── handleError.js
        │       ├── removeDir.js
        │       └── syncDir.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── src
        │   ├── images
        │   │   ├── common
        │   │   │   └── logo.png
        │   │   └── front-page
        │   │       └── test.png
        │   ├── js
        │   │   ├── components
        │   │   │   ├── scroll-to-top.js
        │   │   │   └── smooth-scroll.js
        │   │   └── main.js
        │   └── scss
        │       ├── _global
        │       │   ├── _functions.scss
        │       │   ├── _index.scss
        │       │   └── _variables.scss
        │       ├── common
        │       │   ├── common.scss
        │       │   ├── foundation
        │       │   ├── layout
        │       │   └── object
        │       └── front-page
        │           ├── foundation
        │           ├── front-page.scss
        │           ├── layout
        │           └── object
        └── vite.config.js
```

## Getting Started

**_必須環境_**

以下の環境が必要です。

- **Node.js :** `version 14.18.0 以上`
- **npm or yarn :** `version 4.x.x`

### Installation

1. wordpress-theme-vite を Clone または、[ダウンロード](https://github.com/KoseiDaimon/wordpress-theme-vite/archive/refs/heads/main.zip)します。

コマンドで行う場合 :
構築済みの WordPress 環境の、`/wp-content/themes/` にて下記コマンドを実行してください。

```sh
git clone https://github.com/KoseiDaimon/wordpress-theme-vite
```

コマンドで行わない場合 :
[こちら](https://github.com/KoseiDaimon/wordpress-theme-vite/archive/refs/heads/main.zip)から、ダウンロードしてください。
ダウンロードしたら解凍してください。
構築済みの WordPress 環境の`/wp-content/themes/`直下に、解凍したディレクトリ内の `wordpress-theme-vite-main`を移動してください。

2. WordPress テーマの基本設定

設置した`wordpress-theme-vite-main`ディレクトリ名を、自作テーマ名に変更します。
そして、`style.css`内の下記に自作テーマ名を入力します。

```
/*
Theme Name: [自作テーマ名]
*/
```

3. `vite`ディレクトリ内で、必要なパッケージをインストールします。

```sh
cd vite
npm i
```

### Running wordpress-theme-vite

Use the following command to run wordpress-theme-vite:

```sh
> INSERT-RUN-COMMANDS
```

### Tests

To execute tests, run:

```sh
> INSERT-TEST-COMMANDS
```

## Project Roadmap

- [x] `► INSERT-TASK-1`
- [ ] `► INSERT-TASK-2`
- [ ] `► ...`

## Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Submit Pull Requests](https://github.com/KoseiDaimon/wordpress-theme-vite/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github.com/KoseiDaimon/wordpress-theme-vite/discussions)**: Share your insights, provide feedback, or ask questions.
- **[Report Issues](https://github.com/KoseiDaimon/wordpress-theme-vite/issues)**: Submit bugs found or log feature requests for Wordpress-theme-vite.

<details closed>
    <summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a Git client.
   ```sh
   git clone https://github.com/KoseiDaimon/wordpress-theme-vite
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to GitHub**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

Once your PR is reviewed and approved, it will be merged into the main branch.

</details>

## License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

## Acknowledgments

- List any resources, contributors, inspiration, etc. here.

[**Return**](#-quick-links)
