import Dexie from 'dexie';

const personalDB = new Dexie('personal');

// DB migrations
personalDB.version(1).stores({
  projects: '++id, &title, size, created, updated',
  files: '++id, [projectId+fileName]'
});

personalDB
  .version(2)
  .stores({
    projects: '++id, &title, size, created, updated, url',
    files: '++id, [projectId+fileName]'
  })
  .upgrade(() => {
    personalDB.projects.toCollection().modify(project => {
      project.url = '';
    });
  });


export default personalDB;

export async function createProject(serializedFiles = []) {
  await 1; // Be async
  const timestamp = Date.now();

  let size = 0;
  for (const file of serializedFiles) {
    size += file.blob ? file.blob.size : file.text.length;
  }
  // Create project
  const project = {
    title: null,
    size,
    created: timestamp,
    updated: timestamp,
    url: location.origin + location.pathname,
    CORE_VERSION: CORE_VERSION,
    CORE_CDN_URL: CORE_CDN_URL,
    // Remote project (product) deployment URL<string>
    deployURL: null
  };
  project.id = await personalDB.projects.add(project);
  // Insert files of project
  await personalDB.files.bulkAdd(
    serializedFiles.map(item => ({
      projectId: project.id,
      fileName: item.name,
      serializedFile: item
    }))
  );
  // Plain object has "id"
  return project;
}

export async function readProject(title) {
  const project = await personalDB.projects
    .where('title')
    .equalsIgnoreCase(title)
    .first();
  if (!project) {
    return null;
  }
  // select * from files where projectId=project.id;
  const query = personalDB.files
    .where('[projectId+fileName]')
    .between([project.id, ''], [project.id, '\uffff']);
  return {
    project,
    query,
    length: await query.clone().count()
  };
}

export async function findProject(id) {
  const project = await personalDB.projects.get(id);
  if (!project) {
    return null;
  }
  // select * from files where projectId=project.id;
  const query = personalDB.files
    .where('[projectId+fileName]')
    .between([project.id, ''], [project.id, '\uffff']);
  return {
    project,
    query,
    length: await query.clone().count()
  };
}

export async function updateProject(projectId, update) {
  const prevProject = await personalDB.projects
    .where(':id')
    .equals(projectId)
    .first();
  const nextProject = { ...prevProject, ...update };

  const duplicated = nextProject.title !== null
    ? await personalDB.projects
        .where('title')
        .equalsIgnoreCase(nextProject.title)
        .first()
    : null;
  if (duplicated && duplicated.id !== nextProject.id) {
    // It is not possible to create two projects with the same title.
    throw 'failedToRename';
  }
  await personalDB.projects.put(nextProject);
  return nextProject;
}

export async function deleteProject(projectId) {
  await personalDB.projects.delete(projectId);
  await personalDB.files
    .where('[projectId+fileName]')
    .between([projectId, ''], [projectId, '\uffff'])
    .delete();
}

// Create or Update file
export async function putFile(projectId, serializedFile) {
  // Update project's timestamp
  await personalDB.projects.where(':id').equals(projectId).modify({
    updated: serializedFile.lastModified || Date.now()
  });

  const found = await personalDB.files
    .where('[projectId+fileName]')
    .equals([projectId, serializedFile.name])
    .first();

  if (!found) {
    // Any files found, so create new.
    const added = {
      projectId,
      fileName: serializedFile.name,
      serializedFile
    };
    added.id = await personalDB.files.add(added);
    return added;
  } else {
    // A file found, so modify it.
    await personalDB.files.where(':id').equals(found.id).modify({
      serializedFile
    });

    return serializedFile;
  }
}

export async function deleteFile(projectId, ...fileNames) {
  // Update project's timestamp
  const project = await personalDB.projects.get(projectId);
  if (!project) {
    project.modify({ updated: Date.now() });
  }
  // Delete files included fileNames
  const keys = fileNames.map(fn => [projectId + '', fn]);
  await personalDB.files
    .where('[projectId+fileName]')
    .anyOfIgnoreCase(...keys)
    .delete();
}
