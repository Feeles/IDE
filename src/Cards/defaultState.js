export default {
  MonitorCard: {
    visible: true,
    order: 1,
    frame: {
      src: 'index.html',
      size: [480, 320]
    }
  },
  ShotCard: {
    visible: false,
    order: 2,
    init: {
      fileName: 'main.js'
    }
  },
  MediaCard: {
    visible: false,
    order: 3
  },
  EditorCard: {
    visible: true,
    order: 4,
    init: {
      fileName: 'main.js'
    }
  },
  ReadmeCard: {
    visible: true,
    order: 5,
    init: {
      fileName: 'README.md'
    }
  },
  PaletteCard: {
    visible: false,
    order: 7
  },
  EnvCard: {
    visible: false,
    order: 8
  },
  HierarchyCard: {
    visible: true,
    order: 9
  },
  CustomizeCard: {
    visible: false,
    order: 10
  },
  CreditsCard: {
    visible: false,
    order: 11
  }
}
