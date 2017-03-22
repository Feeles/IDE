export default {
  MonitorCard: {
    visible: true,
    order: 0,
    frame: {
      src: 'index.html',
      size: [800, 600]
    }
  },
  ShotCard: {
    visible: false,
    order: 1,
    init: {
      fileName: 'main.js'
    }
  },
  EditorCard: {
    visible: false,
    order: 2
  },
  MediaCard: {
    visible: false,
    order: 3
  },
  CreditsCard: {
    visible: false,
    order: 4
  },
  ReadmeCard: {
    visible: false,
    order: 5,
    init: {
      fileName: 'README.md'
    }
  },
  PaletteCard: {
    visible: false,
    order: 6
  },
  HierarchyCard: {
    visible: false,
    order: 7
  },
  EnvCard: {
    visible: false,
    order: 8
  },
  CustomizeCard: {
    visible: false,
    order: 9
  },
};
