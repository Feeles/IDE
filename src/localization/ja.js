export default {

  accept: ['ja', 'ja-jp'],
  native: '日本語',

  menu: {
    language: '言語',
    clone: 'セーブ / ロード / クローン',
    aboutFeeles: 'この Feeles について',
    deploy: 'この作品を公開',
    share: 'シェアする',
    copyURL: '公開リンクをコピー',
    tweet: 'ツイートする',
    update: '公開作品をアップデート',
    unlink: '公開作品とのリンクを解除',
    enterPassword: 'パスワードを入力してください',
    failedToDeploy: 'デプロイに失敗してしまいました...😢',
    linkCopied: 'リンクがコピーされました! 📎 ',
    published: 'あなたの作品が公開されました! 🎉 ',
    goToSee: '見に行く 👀',
    confirmUnlink: '⚠️ 注意: 公開した作品は削除されません。',
  },
  cloneDialog: {
    saveTitle: 'セーブ',
    saveHeader: 'ブラウザにデータを保存する',
    loadTitle: 'ロード',
    loadHeader: 'ブラウザからデータを読み込む',
    cloneTitle: 'クローン',
    cloneHeader: 'クローンしてデスクトップに保存する',
    overwriteSave: '上書きして保存',
    saveInNew: '新しいスロットに保存',
    remove: '削除',
    openOnThisTab: 'このタブで開く',
    openInNewTab: '新しいタブで開く',
    created: '作成日時',
    updated: '更新日時',
    size: 'データサイズ',
    embed: 'すべて１つのHTMLファイルにまとめる',
    divide: 'HTMLファイルとライブラリで分ける',
    cdn: 'ライブラリをインターネットから取得する',
    save: '保存する',
    cancel: 'キャンセル',
    saveHTML: 'HTMLだけ保存する',
    saveLibrary: 'ライブラリだけ保存する',
    saveAll: 'どちらも保存する',
    failedToSave: 'アプリの保存に失敗しました',
    failedToRemove: 'アプリの削除に失敗しました',
    failedToOpenTab: 'ポップアップがブロックされたため、アプリの読み込みに失敗しました',
    failedToRename: '同じタイトルのプロジェクトを二つ作ることはできません',
    titleIsRequired: 'プロジェクトにはタイトルを必ずつけてください',
    autoSaved: 'オートセーブされています',
    setTitle: 'タイトルをつけてください',
  },
  saveDialog: {
    title: 'あなたのブラウザはHTML5に対応しないので、手動でダウンロードする必要があります',
    description: (filename) => `上のリンクを右クリックして、「別名でダウンロード」をクリックし、「${filename}」という名前をつけて保存して下さい`,
    cancel: 'キャンセル',
  },
  aboutDialog: {
    title: 'この Feeles について',
    coreVersion: 'Feelse のバージョン',
    changeVersion: 'バージョンを変更',
    change: '変更',
  },
  launchDialog: {
    title: 'プロジェクトが見つかりました',
    openProject: 'このプロジェクトを開く',
    startNew: 'あたらしく始める',
  },
  metaDialog: {
    back: 'もどる',
    next: '次へ',
    creator: 'クリエータについて',
    title: 'タイトル',
    description: '説明文',
    creatorConfirm: '入力は任意です。個人情報は書かないで下さい！',
    nickname: 'ニックネーム',
    twitterId: 'ツイッター ID',
  },
  addDialog: {
    title: 'ファイルを追加する',
    mimeType: 'MIME タイプ',
    fileName: 'ファイル名',
    add: '作成',
    cancel: 'キャンセル',
  },
  readmeCard: {
    title: 'トリセツ',
    index: '目次',
  },
  shotCard: {
    title: 'クイック',
    shoot: '書きかえたら、コードを送る',
    restore: '元に戻す',
  },
  hierarchyCard: {
    title: 'フォルダ',
    emptyTrashBox: '空にする',
  },
  credit: {
    writeAuthorName: '作者の名前を入れる',
    credits: 'クレジット',
    whoMade: (name) => `ファイル "${name}" を作った人は?`,
    website: 'ウェブサイトのURL (なくてもよい)',
  },
  common: {
    tapTwiceQuickly: 'すばやく２回クリック',
    cannotBeUndone: 'この操作は取り消せません',
    editFile: '書きかえる',
    conflict: '同じ名前のファイルがすでに存在します。上書きしますか？',
    or: 'または',
  },
  editorCard: {
    title: 'エディタ',
    undo: 'もどす',
    save: 'セーブ',
    play: 'プレイ',
    notice: 'このタブはまだセーブされていません。本当によろしいですか？',
    insert: '中に入れる',
  },
  envCard: {
    title: 'スイッチ',
    remove: '削除',
  },
  paletteCard: {
    title: 'カラー',
  },
  monitorCard: {
    title: 'ガメン',
  },
  customizeCard: {
    title: 'カスタマイズ',
    detail: `くわしくはこちら`,
    editor: `タブや行の折り返しなど`,
    style: `文字の色や背景色など`,
  },
  creditsCard: {
    title: 'クレジット',
  },
  mediaCard: {
    title: 'メディア',
  },

};
