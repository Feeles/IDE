import Dexie from 'dexie';


const personalDB = new Dexie('personal');

// DB migrations
personalDB.version(1).stores({
  projects: '++id, &title, size, created, updated, CORE_VERSION, CORE_CDN_URL',
  files: '++id, [projectId+fileName], serializedFile',
});

export default personalDB;

export async function createProject(files = []) {
  await 1; // Be async
  const timestamp = Date.now();

  let size = 0;
  for (const file of files) {
    size += file.blob.size;
  }
  // Create project
  const project = {
    title: null,
    size,
    created: timestamp,
    updated: timestamp,
    CORE_VERSION,
    CORE_CDN_URL,
  };
  project.id = await personalDB.projects.add(project);
  // Insert files of project
  await personalDB.files.bulkAdd(
    files.map(file => ({
      projectId: project.id,
      fileName: file.name,
      serializedFile: file.serialize(),
    }))
  );
  // Plain object has "id"
  return project;
}

export async function readProject(title) {
  const project = await personalDB.projects
    .where('title').equalsIgnoreCase(title)
    .first();
  // select * from files where projectId=project.id;
  const query = personalDB.files
    .where('[projectId+fileName]').between([project.id, ''], [project.id, '\uffff']);
  return {
    project,
    query,
    length: await query.clone().count(),
  };
}

export async function updateProject(projectId, update) {
  const prevProject = await personalDB.projects
    .where(':id').equals(projectId)
    .first();
  const nextProject = {...prevProject, ...update};

  const duplicated = await personalDB.projects
    .where('title').equalsIgnoreCase(nextProject.title)
    .first();
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
    .where('[projectId+fileName]').between([projectId, ''], [projectId, '\uffff'])
    .delete();
}

// Create or Update file
export async function putFile(projectId, file) {
  // Update project's timestamp
  await personalDB.projects
    .where(projectId)
    .modify({
      updated: file.lastModified || Date.now(),
    });

  // Query file by compound index
  const query = await personalDB.files
    .where('[projectId+fileName]').equalsIgnoreCase(projectId, file.name);

  if (!query.clone().first()) {
    // Any files found, so create new.
    const added = {
      projectId,
      fileName: file.name,
      serializedFile: file.serialize(),
    };
    added.id = await personalDB.files.add(added);
    return added;
  } else {
    // A file found, so modify it.
    await query.modify({
      serializedFile: file.serialize(),
    });
    return file;
  }
}

export async function deleteFile(projectId, ...fileNames) {
  // Update project's timestamp
  await personalDB.projects
    .where(projectId)
    .modify({
      updated: file.lastModified || Date.now(),
    });
  // Delete files included fileNames
  await personalDB.files
    .where('[projectId+fileName]').anyOfIgnoreCase([projectId, fileNames])
    .delete();
}
