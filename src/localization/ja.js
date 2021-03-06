export default {
  accept: ['ja', 'ja-jp'],
  native: '日本語',
  ll_CC: 'ja_JP',

  menu: {
    language: '言語',
    clone: 'セーブ ロード',
    aboutFeeles: 'この Feeles について',
    showAll: '全てのメニューを表示',
    you: 'あなた',
    version: 'バージョン',
    showAllUrls: '全ての URL を表示'
  },
  cloneDialog: {
    saveTitle: 'セーブ',
    saveHeader: 'ブラウザにデータを保存する',
    loadTitle: 'ロード',
    loadHeader: 'ブラウザからデータを読み込む',
    overwriteSave: '上書きして保存',
    saveInNew: '新しいスロットに保存',
    remove: 'このデータを削除する',
    openOnThisTab: 'このデータをロードする',
    openInNewTab: '新しいタブで開く',
    created: '作成日時',
    updated: '更新日時',
    size: 'データサイズ',
    project: 'プロジェクトを JSON で書き出す',
    save: '保存する',
    cancel: 'キャンセル',
    saveHTML: 'HTMLだけ保存する',
    saveLibrary: 'ライブラリだけ保存する',
    saveAll: 'どちらも保存する',
    failedToSave: 'アプリの保存に失敗しました',
    failedToRemove: 'アプリの削除に失敗しました',
    failedToOpenTab:
      'ポップアップがブロックされたため、アプリの読み込みに失敗しました',
    failedToRename: '同じタイトルのプロジェクトを二つ作ることはできません',
    titleIsRequired: 'プロジェクトにはタイトルを必ずつけてください',
    autoSaved: 'オートセーブされています',
    setTitle: 'タイトルをつけてください'
  },
  saveDialog: {
    title: '',
    description: filename =>
      `上のリンクを右クリックして、「別名でダウンロード」をクリックし、「${filename}」という名前をつけて保存して下さい`,
    cancel: 'キャンセル'
  },
  aboutDialog: {
    title: '',
    coreVersion: 'Feelse のバージョン',
    changeVersion: 'バージョンを変更',
    change: '変更'
  },
  launchDialog: {
    title: '',
    description:
      '途中のデータが残っています。続きから始めたい場合は、「このデータをロードする」をクリックしてください',
    openProject: 'このプロジェクトを開く',
    startNew: '今すぐスタート'
  },
  addDialog: {
    title: '',
    fileName: 'ファイル名',
    add: '作成',
    cancel: 'キャンセル'
  },
  readmeCard: {
    title: '',
    index: '目次'
  },
  shotCard: {
    title: 'マドウショ',
    shoot: '書きかえたら、',
    button: 'コードをおくる',
    restore: '元にもどす'
  },
  hierarchyCard: {
    title: '',
    emptyTrashBox: '空にする'
  },
  credit: {
    writeAuthorName: '作者の名前を入れる',
    credits: 'クレジット',
    whoMade: name => `ファイル "${name}" を作った人は?`,
    website: 'ウェブサイトのURL (なくてもよい)'
  },
  common: {
    close: 'とじる',
    tapTwiceQuickly: 'すばやく２回クリックすると変更できます',
    cannotBeUndone: 'この操作は取り消せません',
    editFile: '書きかえる',
    conflict: '同じ名前のファイルがすでに存在します。上書きしますか？',
    or: 'または',
    wantToOpen: name => `${name} をひらきますか?`
  },
  editorCard: {
    title: '',
    undo: 'もどす',
    play: 'プレイ',
    notice: 'このタブはまだセーブされていません。本当によろしいですか？',
    insert: 'ステージに出す',
    edit: name => `${name} を改造する`,
    stopEditing: name => `${name} の改造をおわる`,
    error: '😇💭 あっ、ちょっと 入力ミスが...',
    restore: 'ミスがおこる まえにもどす',
    deleteLine: '１行消す',
    copyLine: '１行コピー',
    pasteLine: '貼り付ける',
    clickHere: '⭐️ まずは ここをクリック',
    selectedScope: 'に 入れるもの'
  },
  envCard: {
    title: '',
    remove: '削除'
  },
  paletteCard: {
    title: ''
  },
  monitorCard: {
    title: '',
    popout: 'ポップアウト'
  },
  customizeCard: {
    title: '',
    detail: 'くわしくはこちら',
    editor: 'タブや行の折り返しなど',
    style: '文字の色や背景色など'
  },
  creditsCard: {
    title: ''
  },
  mediaCard: {
    title: ''
  }
}
