// Post controller removed — project migrated to stock transaction management
export const postController = {};

const isCUID = (value: string) => /^c[a-z0-9]{24}$/.test(value);
