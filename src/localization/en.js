export default {
  accept: ['en', 'en-us'],
  native: 'English',
  ll_CC: 'en_US',

  menu: {
    language: 'Launguage',
    clone: 'Save and Load',
    aboutFeeles: 'About Feeles',
    showAll: 'Show all menu',
    you: 'You',
    version: 'Version',
    showAllUrls: 'Show all URLs'
  },
  cloneDialog: {
    saveTitle: 'Save',
    saveHeader: 'Save to the browser',
    loadTitle: 'Load',
    loadHeader: 'Load from the browser',
    overwriteSave: 'Overwrite Save',
    saveInNew: 'Save in New Slot',
    remove: 'Remove',
    openOnThisTab: 'Open on This Tab',
    openInNewTab: 'Open in New Tab',
    created: 'Creation date and time',
    updated: 'Update date and time',
    size: 'Data size',
    project: 'Export project as JSON',
    save: 'Save',
    cancel: 'Cancel',
    saveHTML: 'Save Only HTML',
    saveLibrary: 'Save Only Library',
    saveAll: 'Save All',
    failedToSave: 'Failed to save this app.',
    failedToRemove: 'Failed to remove this app.',
    failedToOpenTab: 'Failed to open an app because new tab is blocked!!',
    failedToRename:
      'It is not possible to create two projects with the same title.',
    titleIsRequired: 'Project title is required to open via URL.',
    autoSaved: 'It is automatically saved ;)',
    setTitle: 'Please set title'
  },
  saveDialog: {
    title:
      'You need to download it manually, because Your browser does not support HTML5!',
    description: filename =>
      `Right click on the above link, click "download with alias", and save it with the name "${filename}"`,
    cancel: 'Cancel'
  },
  aboutDialog: {
    title: '',
    coreVersion: 'Core Version',
    changeVersion: 'Change Version',
    change: 'Change'
  },
  addDialog: {
    title: '',
    fileName: 'File name',
    add: 'Add',
    cancel: 'Cancel'
  },
  launchDialog: {
    title: '',
    description:
      'Some saved data are found. If you want to load it, please click "Load this data"',
    openProject: 'Open this project',
    startNew: 'Start'
  },
  readmeCard: {
    title: '',
    index: 'Index'
  },
  shotCard: {
    title: '',
    shoot: 'After rewriting,',
    button: 'send the code',
    restore: 'Restore'
  },
  hierarchyCard: {
    title: '',
    emptyTrashBox: 'Empty trash'
  },
  credit: {
    writeAuthorName: 'Write author name',
    credits: 'Credits',
    whoMade: name => `Who made the file "${name}"?`,
    website: 'Website URL (optional)'
  },
  common: {
    close: 'Close',
    tapTwiceQuickly: 'Tap twice quickly to edit',
    cannotBeUndone: 'This operation can not be undone',
    editFile: 'Edit File',
    conflict:
      'A file with the same name already exists. Do you want to overwrite it?',
    or: 'or',
    wantToOpen: name => `Do you want to open ${name}?`
  },
  editorCard: {
    title: '',
    undo: 'Undo',
    play: 'Play',
    notice: 'This tab has not saved. Are you sure?',
    insert: 'Insert into stage',
    edit: name => `Hack ${name}`,
    stopEditing: name => `Close ${name}`,
    error: '😇💭 Oops, a little typo...',
    restore: 'Restore before mistake',
    deleteLine: 'Delete a line',
    copyLine: 'Copy a line',
    pasteLine: 'Paste',
    clickHere: '⭐️ Click here',
    selectedScope: ', these can be used'
  },
  envCard: {
    title: '',
    remove: 'Remove'
  },
  paletteCard: {
    title: ''
  },
  monitorCard: {
    title: '',
    popout: 'Popout Screen'
  },
  customizeCard: {
    title: '',
    detail: 'Click here for details',
    editor: 'Tabs and line wrapping ...etc',
    style: 'Color of text and background ...etc'
  },
  creditsCard: {
    title: ''
  },
  mediaCard: {
    title: ''
  }
}
