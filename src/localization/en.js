export default {

  accept: ['en', 'en-us'],
  native: 'English',

  menu: {
    shutdown: 'Shutdown',
    popout: 'Pop-out Screen',
    language: 'Language',
    clone: 'Save / Load / Clone',
    aboutFeeles: 'About Feeles',
    deploy: 'Deploy This App',
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
  editorMenu: {
    lineWrapping: 'Line Wrapping',
    tabVisibility: 'Tab Visibility',
    darkness: 'Darkness',
    indentUnit4: '4 spaces indent',
  },
  readme: {
    subtitle: 'Please read this first',
    index: 'Index',
    text: `# Introduction
This is an editor for making games and applications

Please call me **Feeles**

## Screen description
- The right half is the **application screen** or **code screen**
- The left half is the screen of the rest (explanation, asset, folder etc.)

## Overview
- HTML / CSS / javascript (ES 6) can be written
  - [index.html](index.html) Starting point of the application
  - [style.css](style.css) Design of the application
  - [main.js](main.js) Main program of the application
- You can load files on the desktop
  - Since there is a **folder screen** at the bottom of the this side, **click the icon of the computer** in it
- You can save and load data, and clone
  - Click the ↓ icon at the bottom of the application screen
  - It can also be **downloaded as an HTML file.** This is called **clone** in Feeles

- - -

If this explanation remains, this Feeles is probably **an empty Feeles**

Let's get started from there as there are various Feeles such as gaming Feeles

- - -

## Acknowledgments
- When making this application,
- If there is a person who is inappropriate,
- Let's write a name here and thank you.
`,
  },
  shot: {
    shoot: 'After rewriting, send the code',
    restore: 'Restore',
  },
  hierarchy: {
    emptyTrashBox: 'Empty trash',
  },
  snippet: {
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
  editor: {
    undo: 'Undo',
    save: 'Save',
    play: 'Play',
    notice: 'This tab has not saved. Are you sure?',
  },
  env: {
    title: 'Environment Variables',
    subtitle: '',
    remove: 'Remove',
  },
  palette: {
    title: 'Color Palette',
    subtitle: `Let's change the color according to your mood`,
  },
  monitorCard: {
    title: 'Tiny Screen',
    subtitle: `You can write code while watching the screen of the application`,
  },
  customizeCard: {
    title: 'Editor Preference',
    subtitle: `Let's customize the editor to your favorite`,
    detail: `Click here for details`,
    editor: `Tabs and line wrapping ...etc`,
    style: `Color of text and background ...etc`,
  },
  creditsCard: {
    title: 'Contributors',
    subtitle: `Everyone who contributed to these codes`,
  },

};
