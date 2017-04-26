export default {
  accept: ['en', 'en-us'],
  native: 'English',
  ll_CC: 'en_US',

  menu: {
    language: 'Launguage',
    clone: 'Save, Load and Clone',
    aboutFeeles: 'About Feeles',
    upload: 'Upload',
    deploySelf: 'Publish with your account',
    deployAs: name => `Publish with ${name}`,
    share: 'Share this app',
    you: 'You',
    login: 'Login',
    logout: 'Logout',
    loggedIn: 'You have logged in! 🎉 ',
    update: 'Update published app',
    create: 'Publish app as new',
    unlink: 'Unlink from published app',
    enterPassword: 'Please enter the password',
    failedToDeploy: 'Failed to deploy...😢 server error.',
    linkCopied: 'Link is copied! 📎 ',
    published: 'Your app was published! 🎉 ',
    goToSee: 'Go to see 👀',
    viewTwitter: 'View web site',
    version: 'Version',
    showAllUrls: 'Show all URLs',
    withTwitter: 'Log in with Twitter',
    withLine: 'Log in with LINE',
    withFacebook: 'Log in with Facebook',
    withGoogle: 'Log in with Google'
  },
  cloneDialog: {
    saveTitle: 'Save',
    saveHeader: 'Save to the browser',
    loadTitle: 'Load',
    loadHeader: 'Load from the browser',
    cloneTitle: 'Clone',
    cloneHeader: 'Clone to the desktop',
    overwriteSave: 'Overwrite Save',
    saveInNew: 'Save in New Slot',
    remove: 'Remove',
    openOnThisTab: 'Open on This Tab',
    openInNewTab: 'Open in New Tab',
    created: 'Creation date and time',
    updated: 'Update date and time',
    size: 'Data size',
    embed: 'All in one HTML file',
    divide: 'Separate by HTML file and library',
    cdn: 'Get the library from the internet',
    project: 'Export project as JSON',
    save: 'Save',
    cancel: 'Cancel',
    saveHTML: 'Save Only HTML',
    saveLibrary: 'Save Only Library',
    saveAll: 'Save All',
    failedToSave: 'Failed to save this app.',
    failedToRemove: 'Failed to remove this app.',
    failedToOpenTab: 'Failed to open an app because new tab is blocked!!',
    failedToRename: 'It is not possible to create two projects with the same title.',
    titleIsRequired: 'Project title is required to open via URL.',
    autoSaved: 'It is automatically saved ;)',
    setTitle: 'Please set title'
  },
  saveDialog: {
    title: 'You need to download it manually, because Your browser does not support HTML5!',
    description: filename =>
      `Right click on the above link, click "download with alias", and save it with the name "${filename}"`,
    cancel: 'Cancel'
  },
  aboutDialog: {
    title: 'About Feeles',
    coreVersion: 'Core Version',
    changeVersion: 'Change Version',
    change: 'Change'
  },
  addDialog: {
    title: 'Add new file',
    fileName: 'File name',
    add: 'Add',
    cancel: 'Cancel'
  },
  LaunchDialog: {
    title: 'Projects are found',
    openProject: 'Open this project',
    startNew: 'Start new'
  },
  metaDialog: {
    back: 'Back',
    next: 'Next',
    creator: 'Creator Information',
    title: 'Title',
    description: 'description',
    creatorConfirm: 'Filling is optional. Do not write personal information!',
    nickname: 'Nickname',
    twitterId: 'Twitter ID'
  },
  readmeCard: {
    title: 'Getting Started',
    index: 'Index'
  },
  shotCard: {
    title: 'Quick Run',
    shoot: 'After rewriting,',
    button: 'send the code',
    restore: 'Restore'
  },
  hierarchyCard: {
    title: 'Folders',
    emptyTrashBox: 'Empty trash'
  },
  credit: {
    writeAuthorName: 'Write author name',
    credits: 'Credits',
    whoMade: name => `Who made the file "${name}"?`,
    website: 'Website URL (optional)'
  },
  common: {
    tapTwiceQuickly: 'Tap twice quickly',
    cannotBeUndone: 'This operation can not be undone',
    editFile: 'Edit File',
    conflict: 'A file with the same name already exists. Do you want to overwrite it?',
    or: 'or',
    wantToOpen: name => `Do you want to open ${name}?`
  },
  editorCard: {
    title: 'Editor',
    undo: 'Undo',
    save: 'Save',
    play: 'Play',
    notice: 'This tab has not saved. Are you sure?',
    insert: 'Insert'
  },
  envCard: {
    title: 'Parameters',
    remove: 'Remove'
  },
  paletteCard: {
    title: 'Colors'
  },
  monitorCard: {
    title: 'Screen',
    popout: 'Popout Screen'
  },
  customizeCard: {
    title: 'Customize',
    detail: `Click here for details`,
    editor: `Tabs and line wrapping ...etc`,
    style: `Color of text and background ...etc`
  },
  creditsCard: {
    title: 'Credits'
  },
  mediaCard: {
    title: 'Media'
  },
  screenShotCard: {
    title: 'ScreenShot',
    coverImage: 'Set as cover image',
    set: 'Cover image is successfully set! 📸 '
  }
};
