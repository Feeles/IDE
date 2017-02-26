export default {

  accept: ['en', 'en-us'],
  native: 'English',

  menu: {
    language: 'Launguage',
    clone: 'Save and Load',
    aboutFeeles: 'About Feeles',
    deploy: 'Publish this app',
    share: 'Share',
    copyURL: 'Copy public link',
    update: 'Update published app',
    unlink: 'Unlink from published app',
    enterPassword: 'Please enter the password',
    failedToDeploy: 'Failed to deploy...😢',
    linkCopied: 'Link is copied! 📎 ',
    published: 'Your app was published! 🎉 ',
    goToSee: 'Go to see 👀',
    confirmUnlink: '⚠️ CONFIRM: Your published app will be NOT deleted.',
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
    setTitle: 'Please set title',
  },
  saveDialog: {
    title: 'You need to download it manually, because Your browser does not support HTML5!',
    description: (filename) => `Right click on the above link, click "download with alias", and save it with the name "${filename}"`,
    cancel: 'Cancel',
  },
  aboutDialog: {
    title: 'About Feeles',
    coreVersion: 'Core Version',
    changeVersion: 'Change Version',
    change: 'Change',
  },
  addDialog: {
    title: 'Add new file',
    mimeType: 'MIME Type',
    fileName: 'File name',
    add: 'Add',
    cancel: 'Cancel',
  },
  LaunchDialog: {
    title: 'Projects are found',
    openProject: 'Open this project',
    startNew: 'Start new',
  },
  metaDialog: {
    back: 'Back',
    next: 'Next',
    appearance: 'Appearance when Shared',
    creator: 'Creator Information',
    publish: 'Publish and share it!',
    creatorConfirm: 'Filling is optional. Do not write personal information!',
    nickname: 'Nickname',
    twitterId: 'Twitter ID',
  },
  readmeCard: {
    title: 'Getting Started',
    index: 'Index',
  },
  shotCard: {
    title: 'Quick Run',
    shoot: 'After rewriting, send the code',
    restore: 'Restore',
  },
  hierarchyCard: {
    title: 'Folders',
    emptyTrashBox: 'Empty trash',
  },
  snippetCard: {
    title: 'Assets',
    subtitle: 'Drag and drop it to the code on the right',
    fileNotSelected: 'File not selected',
    readMore: 'Read more',
  },
  credit: {
    writeAuthorName: 'Write author name',
    credits: 'Credits',
    whoMade: (name) => `Who made the file "${name}"?`,
    website: 'Website URL (optional)',
  },
  common: {
    tapTwiceQuickly: 'Tap twice quickly',
    cannotBeUndone: 'This operation can not be undone',
    editFile: 'Edit File',
    conflict: 'A file with the same name already exists. Do you want to overwrite it?',
    or: 'or',
  },
  editorCard: {
    title: 'Editor',
    undo: 'Undo',
    save: 'Save',
    play: 'Play',
    notice: 'This tab has not saved. Are you sure?',
  },
  envCard: {
    title: 'Parameters',
    remove: 'Remove',
  },
  paletteCard: {
    title: 'Colors',
  },
  monitorCard: {
    title: 'Screen',
  },
  customizeCard: {
    title: 'Customize',
    detail: `Click here for details`,
    editor: `Tabs and line wrapping ...etc`,
    style: `Color of text and background ...etc`,
  },
  creditsCard: {
    title: 'Credits',
  },
  mediaCard: {
    title: 'Media',
  },

};
