export default {
  accept: ['ja', 'ja-jp'],
  native: '日本語',
  ll_CC: 'ja_JP',

  menu: {
    language: '言語',
    clone: 'セーブ ロード',
    aboutFeeles: 'この Feeles について',
    upload: '作品を公開',
    deploySelf: 'このアカウントで作品を公開',
    deployAnonymous: 'とりあえず公開',
    showAll: '全てのメニューを表示',
    share: 'この作品をシェア',
    you: 'あなた',
    login: 'ログイン',
    logout: 'ログアウト',
    loggedIn: 'ログインしました! 🎉 ',
    update: '公開作品をアップデート',
    create: 'あたらしい作品として公開',
    unlink: '公開作品とのリンクを解除',
    failedToDeploy: 'デプロイに失敗してしまいました...😢',
    linkCopied: 'リンクがコピーされました! 📎 ',
    published: 'あなたの作品が公開されました! 🎉 ',
    goToSee: '見に行く 👀',
    viewTwitter: 'サイトを見に行く',
    version: 'バージョン',
    showAllUrls: '全ての URL を表示',
    withTwitter: 'Twitterでログイン',
    withLine: 'LINEでログイン',
    withFacebook: 'Facebookでログイン',
    withGoogle: 'Googleでログイン'
  },
  cloneDialog: {
    saveTitle: 'セーブ',
    saveHeader: 'ブラウザにデータを保存する',
    loadTitle: 'ロード',
    loadHeader: 'ブラウザからデータを読み込む',
    overwriteSave: '上書きして保存',
    saveInNew: '新しいスロットに保存',
    remove: '削除',
    openOnThisTab: 'このタブで開く',
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
    title:
      'あなたのブラウザはHTML5に対応しないので、手動でダウンロードする必要があります',
    description: filename =>
      `上のリンクを右クリックして、「別名でダウンロード」をクリックし、「${filename}」という名前をつけて保存して下さい`,
    cancel: 'キャンセル'
  },
  aboutDialog: {
    title: 'この Feeles について',
    coreVersion: 'Feelse のバージョン',
    changeVersion: 'バージョンを変更',
    change: '変更'
  },
  launchDialog: {
    title: 'プロジェクトが見つかりました',
    openProject: 'このプロジェクトを開く',
    startNew: 'あたらしく始める'
  },
  metaDialog: {
    back: 'もどる',
    next: '次へ',
    creator: 'クリエータについて',
    title: 'タイトル',
    description: '説明文',
    creatorConfirm: 'ここは書かなくてもOK! 本名はぜったいに書かないで下さい',
    nickname: 'ニックネーム',
    homepage: 'ホームページ (もしあれば)',
    twitterId: 'ツイッター ID (もしあれば)'
  },
  addDialog: {
    title: 'ファイルを追加する',
    fileName: 'ファイル名',
    add: '作成',
    cancel: 'キャンセル'
  },
  readmeCard: {
    title: 'トリセツ',
    index: '目次'
  },
  shotCard: {
    title: 'クイック',
    shoot: '書きかえたら、',
    button: 'コードをおくる',
    restore: '元にもどす'
  },
  hierarchyCard: {
    title: 'フォルダ',
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
    tapTwiceQuickly: 'すばやく２回クリック',
    cannotBeUndone: 'この操作は取り消せません',
    editFile: '書きかえる',
    conflict: '同じ名前のファイルがすでに存在します。上書きしますか？',
    or: 'または',
    wantToOpen: name => `${name} をひらきますか?`
  },
  editorCard: {
    title: 'エディタ',
    undo: 'もどす',
    save: 'セーブ',
    play: 'プレイ',
    notice: 'このタブはまだセーブされていません。本当によろしいですか？',
    insert: '中に入れる',
    error: '😇💭 あっ、ちょっと 入力ミスが...',
    restore: 'ミスがおこる まえにもどす',
    clickHere: '⭐️ まずは ここをクリック'
  },
  envCard: {
    title: 'スイッチ',
    remove: '削除'
  },
  paletteCard: {
    title: 'カラー'
  },
  monitorCard: {
    title: 'ガメン',
    popout: 'ポップアウト'
  },
  customizeCard: {
    title: 'カスタマイズ',
    detail: 'くわしくはこちら',
    editor: 'タブや行の折り返しなど',
    style: '文字の色や背景色など'
  },
  creditsCard: {
    title: 'クレジット'
  },
  mediaCard: {
    title: 'メディア'
  },
  screenShotCard: {
    title: 'スクショ',
    coverImage: 'カバー画像にする',
    set: 'カバー画像がセットされました! 📸 '
  }
};
