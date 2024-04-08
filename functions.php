<?php
/*================================================
# アセットURL関数
# この関数は、キャッシュによって古い情報が表示されないように
# バージョン番号を追加してアセットのURLを生成します。
================================================*/
function get_asset_url($path) {
  // テーマの'assets'ディレクトリ内の完全なファイルパスを構築します。
  $file_path = get_template_directory() . '/assets/' . $path;

  // ファイルが存在する場合は、バージョン番号を追加したURLを返します。
  if (file_exists($file_path)) {
    // キャッシュバスティングのために、クエリ文字列としてファイルの変更時間を追加します。
    return get_template_directory_uri() . '/assets/' . $path . '?v=' . filemtime($file_path);
  }

  // ファイルが存在しない場合はnullを返します。
  return null;
}

/*================================================
# テーマCSSファイルの読み込み
================================================*/
function load_css() {
  // 共通のCSSファイルを読み込む
  wp_enqueue_style('common-style', get_asset_url('css/common.css'), array(), '1.0.0', 'all');

  // CSSファイルの配列を定義します。キーはページタイプ、値はそのCSSファイルのパスです。
  $css_files = array(
    'front-page' => 'css/front-page/style.css',
    // 必要に応じて他のページタイプと対応するCSSファイルを追加
  );

  // 各ページタイプに対応するCSSファイルを読み込みます。
  foreach ($css_files as $page_type => $css_file) {
    // 特定のページタイプが現在のページであるかをチェックします。
    if (call_user_func("is_$page_type")) {
      // 条件に一致する場合、そのページタイプのCSSファイルを読み込みます。
      wp_enqueue_style("$page_type-style", get_asset_url($css_file), array(), '1.0.0', 'all');
      break; // 一致したらループを抜けます。
    }
  }
}
add_action('wp_enqueue_scripts', 'load_css');

/*================================================
# テーマJavaScriptファイルの読み込み
================================================*/
function load_js() {
  // 共通のJavaScriptファイルを読み込む
  wp_enqueue_script('common-script', get_asset_url('js/common/index.js'), array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'load_js');
